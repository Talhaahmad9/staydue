import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectToDatabase, DeadlineModel, UserModel } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { sendReminderEmail } from "@/lib/resend";
import { DeadlineNotificationPayload } from "@/types/notification";
import { getDeadlineUrgency } from "@/utils/date";

export async function GET(): Promise<NextResponse> {
  // Only works in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Find the logged-in user
    const user = await UserModel.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find their first upcoming deadline that is not completed
    const deadline = await DeadlineModel.findOne({
      userId: user._id,
      status: "upcoming",
      isCompleted: false,
      dueDate: { $gt: new Date() },
    })
      .sort({ dueDate: 1 })
      .lean();

    if (!deadline) {
      return NextResponse.json({ error: "No upcoming deadlines found" }, { status: 404 });
    }

    // Build a DeadlineNotificationPayload manually with interval "day-of"
    const otherDeadlines = await DeadlineModel.find({
      userId: user._id,
      status: "upcoming",
      isCompleted: false,
      dueDate: { $gt: new Date() },
      _id: { $ne: deadline._id },
    })
      .sort({ dueDate: 1 })
      .limit(4)
      .lean();

    const payload: DeadlineNotificationPayload = {
      deadlineId: deadline._id.toString(),
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name || "Student",
      deadline: {
        title: deadline.title,
        courseCode: deadline.courseCode,
        courseTitle: deadline.courseTitle,
        dueDate: deadline.dueDate.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        interval: "3-day",
        allUpcoming: otherDeadlines.map((d) => ({
          title: d.title,
          courseCode: d.courseCode,
          dueDate: d.dueDate.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          urgency: getDeadlineUrgency(d.dueDate) as "today" | "tomorrow" | "3-day" | "upcoming",
        })),
      },
    };

    // Call sendReminderEmail
    const result = await sendReminderEmail(payload);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentTo: user.email,
      deadline: deadline.title,
    });
  } catch (error) {
    console.error("[test-notify]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
