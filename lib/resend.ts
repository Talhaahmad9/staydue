import { Resend } from "resend";
import { render } from "@react-email/render";
import ReminderEmail from "@/emails/ReminderEmail";
import OverdueEmail from "@/emails/OverdueEmail";
import OtpEmail from "@/emails/OtpEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import { DeadlineNotificationPayload, ReminderInterval } from "@/types/notification";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "StayDue <reminders@staydue.app>";

// Email delivery only. For WhatsApp delivery of the same payload,
// see lib/whatsapp.ts (to be implemented).

export async function sendReminderEmail(
  payload: DeadlineNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate email
    if (!payload.userEmail || !payload.userEmail.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const subjectLine = getSubjectLine(payload.deadline.interval, payload.deadline.title);
    const html = await render(ReminderEmail({ payload }));

    const response = await resend.emails.send({
      from: FROM,
      to: payload.userEmail,
      subject: subjectLine,
      html,
    });

    if (response.error) {
      console.error("[resend/reminder/error]", response.error);
      return { success: false, error: String(response.error) };
    }

    console.log("[resend/reminder/sent]", {
      deadlineId: payload.deadlineId,
      interval: payload.deadline.interval,
      messageId: response.data?.id,
    });

    return { success: true };
  } catch (error) {
    console.error("[resend/reminder]", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendOverdueEmail(
  payload: DeadlineNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate email
    if (!payload.userEmail || !payload.userEmail.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const subjectLine = `You missed a deadline: ${payload.deadline.title}`;
    const html = await render(OverdueEmail({ payload }));

    const response = await resend.emails.send({
      from: FROM,
      to: payload.userEmail,
      subject: subjectLine,
      html,
    });

    if (response.error) {
      console.error("[resend/overdue/error]", response.error);
      return { success: false, error: String(response.error) };
    }

    console.log("[resend/overdue/sent]", {
      deadlineId: payload.deadlineId,
      messageId: response.data?.id,
    });

    return { success: true };
  } catch (error) {
    console.error("[resend/overdue]", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function getSubjectLine(interval: ReminderInterval, title: string): string {
  switch (interval) {
    case "3-day":
      return `3 days left: ${title}`;
    case "1-day":
      return `Due tomorrow: ${title}`;
    case "day-of":
      return `Due today — don't forget: ${title}`;
  }
}

export async function sendOtpEmail(
  to: string,
  name: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate email
    if (!to || !to.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const html = await render(OtpEmail({ otp }));

    const response = await resend.emails.send({
      from: FROM,
      to,
      subject: "Your StayDue verification code",
      html,
    });

    if (response.error) {
      console.error("[resend/otp/error]", response.error);
      return { success: false, error: String(response.error) };
    }

    console.log("[resend/otp/sent]", {
      to,
      messageId: response.data?.id,
    });

    return { success: true };
  } catch (error) {
    console.error("[resend/otp]", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate email
    if (!to || !to.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const html = await render(PasswordResetEmail({ resetUrl }));

    const response = await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset your StayDue password",
      html,
    });

    if (response.error) {
      console.error("[resend/reset/error]", response.error);
      return { success: false, error: String(response.error) };
    }

    console.log("[resend/reset/sent]", {
      to,
      messageId: response.data?.id,
    });

    return { success: true };
  } catch (error) {
    console.error("[resend/reset]", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
