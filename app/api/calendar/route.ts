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

    const body = await request.json();
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

    const catalogMap = await getCatalogMapByYear(parsedBody.data.admissionYear);
    if (catalogMap.size === 0) {
      return jsonError(
        400,
        "Catalog data is unavailable for the selected admission year.",
        "INVALID_ADMISSION_YEAR"
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(parsedBody.data.url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return jsonError(502, "Could not fetch calendar from Moodle.", "CALENDAR_FETCH_FAILED");
    }

    const rawICS = await response.text();
    const deadlines = parseCalendarEvents(rawICS);
    const uniqueDeadlines = Array.from(
      new Map(deadlines.map((deadline) => [deadline.sourceEventId, deadline])).values()
    );
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    await connectToDatabase();
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

    await UserModel.updateOne(
      { _id: session.user.id },
      {
        $set: userUpdates,
      }
    );

    if (uniqueDeadlines.length > 0) {
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
                isCompleted: false,
              },
            },
            upsert: true,
          },
        }))
      );
    }

    return NextResponse.json({
      syncedCount: uniqueDeadlines.length,
      preview: uniqueDeadlines.slice(0, 3),
    });
  } catch {
    return jsonError(500, "Could not sync your calendar. Please try again.", "INTERNAL_ERROR");
  }
}
