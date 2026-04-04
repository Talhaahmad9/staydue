import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { getCatalogMapByYear, normalizeCourseCode } from "@/lib/catalog";
import { parseCalendarEvents } from "@/lib/ical";
import { DeadlineModel, UserModel, connectToDatabase } from "@/lib/mongodb";
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

    try {
      const catalogMap = await getCatalogMapByYear(parsedBody.data.admissionYear);
      if (catalogMap.size === 0) {
        return jsonError(
          400,
          "Catalog data is unavailable for the selected admission year.",
          "INVALID_ADMISSION_YEAR"
        );
      }
    } catch (catalogError) {
      console.error("[api/calendar/catalog]", catalogError instanceof Error ? catalogError.message : String(catalogError));
      return jsonError(500, "Could not load catalog data. Please try again.", "CATALOG_ERROR");
    }

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      response = await fetch(parsedBody.data.url, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        return jsonError(502, "Could not fetch calendar from Moodle.", "CALENDAR_FETCH_FAILED");
      }
    } catch (fetchError) {
      console.error("[api/calendar/fetch]", fetchError instanceof Error ? fetchError.message : String(fetchError));
      return jsonError(502, "Could not fetch calendar from Moodle.", "CALENDAR_FETCH_FAILED");
    }

    let rawICS: string;
    try {
      rawICS = await response.text();
    } catch (parseError) {
      console.error("[api/calendar/text]", parseError instanceof Error ? parseError.message : String(parseError));
      return jsonError(502, "Could not parse calendar response.", "CALENDAR_PARSE_FAILED");
    }

    const deadlines = parseCalendarEvents(rawICS);
    const uniqueDeadlines = Array.from(
      new Map(deadlines.map((deadline) => [deadline.sourceEventId, deadline])).values()
    );
    
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

    if (uniqueDeadlines.length > 0) {
      const catalogMap = await getCatalogMapByYear(parsedBody.data.admissionYear);

      try {
        await DeadlineModel.bulkWrite(
          uniqueDeadlines.map((deadline) => ({
            updateOne: {
              filter: { userId: userObjectId, sourceEventId: deadline.sourceEventId },
              update: {
                $set: {
                  title: deadline.title,
                  course: normalizeCourseCode(deadline.courseCode),
                  courseCode: normalizeCourseCode(deadline.courseCode),
                  courseTitle:
                    catalogMap.get(normalizeCourseCode(deadline.courseCode)) ?? "Uncategorized",
                  catalogYear: parsedBody.data.admissionYear,
                  description: deadline.description,
                  dueDate: deadline.dueDate,
                },
                $setOnInsert: {
                  userId: userObjectId,
                  status: "upcoming",
                  isCompleted: false,
                  createdAt: new Date(),
                },
              },
              upsert: true,
            },
          }))
        );
      } catch (bulkWriteError) {
        console.error("[api/calendar/bulk-write]", bulkWriteError instanceof Error ? bulkWriteError.message : String(bulkWriteError));
        return jsonError(500, "Could not save deadlines. Please try again.", "BULK_WRITE_ERROR");
      }
    }

    return NextResponse.json({
      syncedCount: uniqueDeadlines.length,
      preview: uniqueDeadlines.slice(0, 3),
    });
  } catch (error) {
    console.error("[api/calendar]", error instanceof Error ? error.message : String(error));
    return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
  }
}
