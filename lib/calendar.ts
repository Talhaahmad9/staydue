import mongoose from "mongoose";
import { getCatalogMapByYear, normalizeCourseCode } from "@/lib/catalog";
import { parseCalendarEvents } from "@/lib/ical";
import { DeadlineModel, connectToDatabase } from "@/lib/mongodb";

/**
 * Syncs calendar events for a single user
 * Fetches ICS from URL, parses events, and performs bulk upsert
 *
 * @param params User ID, Moodle calendar URL, and admission year
 * @returns Count of synced deadlines
 * @throws Descriptive errors with context tags for handling
 */
export async function syncCalendarForUser(params: {
  userId: string;
  moodleCalendarUrl: string;
  admissionYear: string;
}): Promise<{ syncedCount: number }> {
  const { userId, moodleCalendarUrl, admissionYear } = params;

  // Validate database connection
  await connectToDatabase();

  // Convert userId to ObjectId
  let userObjectId: mongoose.Types.ObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (error) {
    throw new Error(`[calendar/objectid] Invalid user ID format: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Fetch calendar with timeout
  let response: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    response = await fetch(moodleCalendarUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    throw new Error(`[calendar/fetch] Failed to fetch calendar: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Parse ICS response
  let rawICS: string;
  try {
    rawICS = await response.text();
  } catch (error) {
    throw new Error(`[calendar/parse] Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Parse events and deduplicate
  const deadlines = parseCalendarEvents(rawICS);
  const uniqueDeadlines = Array.from(
    new Map(deadlines.map((deadline) => [deadline.sourceEventId, deadline])).values()
  );

  // If no deadlines, return early
  if (uniqueDeadlines.length === 0) {
    return { syncedCount: 0 };
  }

  // Load catalog map for course title resolution
  let catalogMap: Map<string, string>;
  try {
    catalogMap = await getCatalogMapByYear(admissionYear);
    if (catalogMap.size === 0) {
      throw new Error("Catalog data unavailable");
    }
  } catch (error) {
    throw new Error(`[calendar/catalog] Failed to load catalog: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Bulk write deadlines to database
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
              courseTitle: catalogMap.get(normalizeCourseCode(deadline.courseCode)) ?? "Uncategorized",
              catalogYear: admissionYear,
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
  } catch (error) {
    throw new Error(`[calendar/bulkwrite] Failed to save deadlines: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { syncedCount: uniqueDeadlines.length };
}
