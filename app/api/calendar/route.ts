import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { syncCalendarForUser } from "@/lib/calendar";
import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { connectCalendarSchema } from "@/utils/validate";

function jsonError(status: number, error: string, code: string): NextResponse {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError(401, "Unauthorized", "UNAUTHORIZED");
    }

    // Read raw body text first for parsing
    const rawText = await request.text();

    if (!rawText) {
      return jsonError(400, "Invalid request body. Please send valid JSON.", "JSON_PARSE_ERROR");
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch (parseError) {
      console.error("[api/calendar/json-parse]", parseError instanceof Error ? parseError.message : String(parseError));
      return jsonError(400, "Invalid request body. Please send valid JSON.", "JSON_PARSE_ERROR");
    }

    const parsedBody = connectCalendarSchema.safeParse(body);
    if (!parsedBody.success) {
      const fieldErrors = parsedBody.error.flatten().fieldErrors;
      const validationMessage =
        fieldErrors.url?.[0] ??
        fieldErrors.phone?.[0] ??
        fieldErrors.admissionYear?.[0] ??
        "Invalid calendar input.";
      return jsonError(400, validationMessage, "VALIDATION_ERROR");
    }


    
    let userObjectId: mongoose.Types.ObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } catch (objectIdError) {
      console.error("[api/calendar/objectid]", objectIdError instanceof Error ? objectIdError.message : String(objectIdError));
      return jsonError(500, "Invalid user session. Please log in again.", "INVALID_USER_ID");
    }

    try {
      await connectToDatabase();
    } catch (dbConnError) {
      console.error("[api/calendar/connect]", dbConnError instanceof Error ? dbConnError.message : String(dbConnError));
      return jsonError(500, "Database connection failed. Please try again.", "DB_CONNECT_ERROR");
    }

    // Update user with calendar URL, phone, and onboarding completion
    const userUpdates: {
      moodleCalendarUrl: string;
      hasCompletedOnboarding: boolean;
      admissionYear: string;
      phone?: string;
    } = {
      moodleCalendarUrl: parsedBody.data.url,
      hasCompletedOnboarding: true,
      admissionYear: parsedBody.data.admissionYear,
    };

    if (parsedBody.data.phone) {
      userUpdates.phone = parsedBody.data.phone;
    }

    try {
      await UserModel.updateOne(
        { _id: userObjectId },
        {
          $set: userUpdates,
        }
      );
    } catch (userUpdateError) {
      console.error("[api/calendar/user-update]", userUpdateError instanceof Error ? userUpdateError.message : String(userUpdateError));
      return jsonError(500, "Could not save calendar URL. Please try again.", "USER_UPDATE_ERROR");
    }

    // Sync calendar deadlines using shared lib
    let syncResult;
    try {
      syncResult = await syncCalendarForUser({
        userId: session.user.id,
        moodleCalendarUrl: parsedBody.data.url,
        admissionYear: parsedBody.data.admissionYear,
      });
    } catch (syncError) {
      const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
      if (errorMessage.includes("[calendar/fetch]")) {
        return jsonError(502, "Could not fetch calendar from Moodle.", "CALENDAR_FETCH_FAILED");
      }
      if (errorMessage.includes("[calendar/parse]")) {
        return jsonError(502, "Could not parse calendar response.", "CALENDAR_PARSE_FAILED");
      }
      if (errorMessage.includes("[calendar/catalog]")) {
        return jsonError(500, "Could not load catalog data. Please try again.", "CATALOG_ERROR");
      }
      if (errorMessage.includes("[calendar/bulkwrite]")) {
        return jsonError(500, "Could not save deadlines. Please try again.", "BULK_WRITE_ERROR");
      }
      console.error("[api/calendar/sync]", errorMessage);
      return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
    }

    return NextResponse.json({
      syncedCount: syncResult.syncedCount,
    });
  } catch (error) {
    console.error("[api/calendar]", error instanceof Error ? error.message : String(error));
    return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
  }
}
