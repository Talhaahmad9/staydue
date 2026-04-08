import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { syncCalendarForUser } from "@/lib/calendar";
import { UserModel, connectToDatabase } from "@/lib/mongodb";

function jsonError(status: number, error: string, code: string): NextResponse {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError(401, "Unauthorized", "UNAUTHORIZED");
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id).lean();
    if (!user?.moodleCalendarUrl) {
      return jsonError(400, "No calendar connected", "NO_CALENDAR_URL");
    }

    if (!user.admissionYear) {
      return jsonError(400, "Admission year not set", "NO_ADMISSION_YEAR");
    }

    // Sync calendar deadlines using shared lib
    let syncResult;
    try {
      syncResult = await syncCalendarForUser({
        userId: session.user.id,
        moodleCalendarUrl: user.moodleCalendarUrl,
        admissionYear: user.admissionYear,
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
      console.error("[api/calendar/refresh/sync]", errorMessage);
      return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
    }

    return NextResponse.json({
      syncedCount: syncResult.syncedCount,
    });
  } catch (error) {
    console.error("[api/calendar/refresh]", error instanceof Error ? error.message : String(error));
    return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
  }
}
