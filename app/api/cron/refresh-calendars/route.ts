// Called every 2 hours by cron-job.org (12 times daily)
// Protected by CRON_SECRET bearer token — not a Vercel Cron job

import { NextResponse } from "next/server";
import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { syncCalendarForUser } from "@/lib/calendar";

export async function GET(request: Request): Promise<NextResponse> {
  // FIX 1A: Reject early if CRON_SECRET is not configured
  if (!process.env.CRON_SECRET) {
    console.error('[cron] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const users = await UserModel.find({
    hasCompletedOnboarding: true,
    moodleCalendarUrl: { $exists: true, $ne: "" },
    admissionYear: { $exists: true, $ne: "" },
  })
    .lean()
    .select("_id moodleCalendarUrl admissionYear");

  const results = await Promise.allSettled(
    users.map((user) =>
      syncCalendarForUser({
        userId: String(user._id),
        moodleCalendarUrl: user.moodleCalendarUrl!,
        admissionYear: user.admissionYear!,
      })
    )
  );

  let successCount = 0;
  let errorCount = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successCount++;
    } else {
      errorCount++;
      console.error(
        "[cron/refresh-calendars]",
        String(users[index]._id),
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );
    }
  });

  return NextResponse.json({
    success: true,
    successCount,
    errorCount,
    timestamp: new Date().toISOString(),
  });
}
