import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { getCatalogMapByYear, normalizeCourseCode } from "@/lib/catalog";
import { parseCalendarEvents } from "@/lib/ical";
import { DeadlineModel, UserModel, connectToDatabase } from "@/lib/mongodb";

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

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      response = await fetch(user.moodleCalendarUrl, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        return jsonError(502, "Could not fetch calendar from Moodle.", "CALENDAR_FETCH_FAILED");
      }
    } catch (fetchError) {
      console.error("[api/calendar/refresh/fetch]", fetchError instanceof Error ? fetchError.message : String(fetchError));
      return jsonError(502, "Could not fetch calendar from Moodle.", "CALENDAR_FETCH_FAILED");
    }

    let rawICS: string;
    try {
      rawICS = await response.text();
    } catch (parseError) {
      console.error("[api/calendar/refresh/text]", parseError instanceof Error ? parseError.message : String(parseError));
      return jsonError(502, "Could not parse calendar response.", "CALENDAR_PARSE_FAILED");
    }

    const deadlines = parseCalendarEvents(rawICS);
    const uniqueDeadlines = Array.from(
      new Map(deadlines.map((deadline) => [deadline.sourceEventId, deadline])).values()
    );

    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    if (uniqueDeadlines.length === 0) {
      return NextResponse.json({
        syncedCount: 0,
      });
    }

    let catalogMap;
    try {
      catalogMap = await getCatalogMapByYear(user.admissionYear);
      if (catalogMap.size === 0) {
        return jsonError(
          400,
          "Catalog data is unavailable for the selected admission year.",
          "INVALID_ADMISSION_YEAR"
        );
      }
    } catch (catalogError) {
      console.error("[api/calendar/refresh/catalog]", catalogError instanceof Error ? catalogError.message : String(catalogError));
      return jsonError(500, "Could not load catalog data. Please try again.", "CATALOG_ERROR");
    }

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
                catalogYear: user.admissionYear,
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
      console.error("[api/calendar/refresh/bulk-write]", bulkWriteError instanceof Error ? bulkWriteError.message : String(bulkWriteError));
      return jsonError(500, "Could not save deadlines. Please try again.", "BULK_WRITE_ERROR");
    }

    return NextResponse.json({
      syncedCount: uniqueDeadlines.length,
    });
  } catch (error) {
    console.error("[api/calendar/refresh]", error instanceof Error ? error.message : String(error));
    return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
  }
}
