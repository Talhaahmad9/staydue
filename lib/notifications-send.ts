import { DeadlineModel, UserModel } from "@/lib/mongodb";
import { sendReminderEmail } from "@/lib/resend";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { DeadlineNotificationPayload } from "@/types/notification";

export async function sendReminderWithoutifications(
  payload: DeadlineNotificationPayload
): Promise<{ success: boolean; whatsappSent: boolean }> {
  let whatsappSent = false;

  // Send email
  const emailResult = await sendReminderEmail(payload);
  if (!emailResult.success) {
    return { success: false, whatsappSent: false };
  }

  // Track reminder sent
  try {
    await DeadlineModel.updateOne(
      { _id: payload.deadlineId },
      { $push: { reminderSentDates: new Date() } }
    );
  } catch (updateError) {
    console.error(
      "[notify/update-reminder]",
      updateError instanceof Error ? updateError.message : String(updateError)
    );
  }

  // Send WhatsApp independently
  try {
    const user = await UserModel.findById(payload.userId).lean();
    if (user?.phone) {
      const whatsappResult = await sendWhatsAppMessage(payload, user.phone, false);
      whatsappSent = whatsappResult.success;
      if (!whatsappSent) {
        console.warn("[notify/whatsapp]", {
          deadlineId: payload.deadlineId,
          error: whatsappResult.error,
        });
      }
    }
  } catch (whatsappError) {
    console.error("[notify/whatsapp-send]", whatsappError instanceof Error ? whatsappError.message : String(whatsappError));
  }

  return { success: true, whatsappSent };
}

export async function buildTestNotificationPayload(
  userId: string,
  userName: string,
  userEmail: string
): Promise<DeadlineNotificationPayload | null> {
  const deadline = await DeadlineModel.findOne({
    userId,
    status: "upcoming",
    isCompleted: false,
    dueDate: { $gt: new Date() },
  })
    .sort({ dueDate: 1 })
    .lean();

  if (!deadline) return null;

  const otherDeadlines = await DeadlineModel.find({
    userId,
    status: "upcoming",
    isCompleted: false,
    dueDate: { $gt: new Date() },
    _id: { $ne: deadline._id },
  })
    .sort({ dueDate: 1 })
    .limit(4)
    .lean();

  const { getDeadlineUrgency } = await import("@/utils/date");

  return {
    deadlineId: deadline._id.toString(),
    userId,
    userEmail,
    userName,
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
}
