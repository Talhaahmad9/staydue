import { DeadlineNotificationPayload } from "@/types/notification";
import { BatchNotificationPayload } from "@/types/notification";

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status?: string }>;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    error_data?: unknown;
    fbtrace_id: string;
  };
}

interface WhatsAppParameter {
  type: "text";
  text: string;
}

interface WhatsAppTemplateComponent {
  type: "body" | "header" | "button";
  parameters: WhatsAppParameter[];
}

interface WhatsAppMessageBody {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components?: WhatsAppTemplateComponent[];
  };
}

function maskPhoneNumber(phone: string): string {
  if (phone.length < 8) return "****";
  const cleanPhone = phone.replace("+", "");
  return `+${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-4)}`;
}

export async function sendWhatsAppMessage(
  payload: DeadlineNotificationPayload,
  phoneNumber: string,
  isTest: boolean = false,
): Promise<{ success: boolean; error?: string; maskedPhone?: string }> {
  try {
    const {
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_TEMPLATE_NAME,
      WHATSAPP_TEMPLATE_TEST,
    } = process.env;

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error(
        "[whatsapp/error]",
        "Missing WhatsApp credentials in environment",
      );
      return { success: false, error: "WhatsApp API not configured" };
    }

    const templateName = isTest
      ? WHATSAPP_TEMPLATE_TEST
      : WHATSAPP_TEMPLATE_NAME;
    if (!templateName) {
      const envKey = isTest
        ? "WHATSAPP_TEMPLATE_TEST"
        : "WHATSAPP_TEMPLATE_NAME";
      console.error("[whatsapp/error]", `Missing ${envKey} in environment`);
      return { success: false, error: "Template name not found" };
    }

    const messageBody: WhatsAppMessageBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber.replace("+", ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
      },
    };

    if (!isTest) {
      messageBody.template.components = [
        {
          type: "body",
          parameters: [
            { type: "text", text: payload.userName },
            { type: "text", text: payload.deadline.title },
            {
              type: "text",
              text: `${payload.deadline.courseCode} (${payload.deadline.courseTitle})`,
            },
            { type: "text", text: payload.deadline.dueDate },
          ],
        },
      ];
    }

    const waController = new AbortController();
    const waTimeout = setTimeout(() => waController.abort(), 8000);
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
        signal: waController.signal,
      },
    ).finally(() => clearTimeout(waTimeout));

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok) {
      const errorMsg = data.error?.message || "Unknown Meta API error";
      console.error("[whatsapp/error]", {
        status: response.status,
        error: errorMsg,
        errorCode: data.error?.code,
        errorSubcode: data.error?.error_subcode,
        fbtrace_id: data.error?.fbtrace_id,
        templateName,
        maskedPhone: maskPhoneNumber(phoneNumber),
      });
      return { success: false, error: errorMsg };
    }

    console.log("[whatsapp/sent]", {
      templateName,
      isTest,
      maskedPhone: maskPhoneNumber(phoneNumber),
      messageId: data.messages?.[0]?.id,
      messageStatus: data.messages?.[0]?.message_status,
    });

    return { success: true, maskedPhone: maskPhoneNumber(phoneNumber) };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network/Unknown error";
    console.error("[whatsapp/exception]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendWhatsAppOverdueMessage(
  payload: DeadlineNotificationPayload,
  phoneNumber: string,
): Promise<{ success: boolean; error?: string; maskedPhone?: string }> {
  try {
    const {
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_TEMPLATE_OVERDUE,
    } = process.env;

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error(
        "[whatsapp/error]",
        "Missing WhatsApp credentials in environment",
      );
      return { success: false, error: "WhatsApp API not configured" };
    }

    if (!WHATSAPP_TEMPLATE_OVERDUE) {
      console.error(
        "[whatsapp/error]",
        "Missing WHATSAPP_TEMPLATE_OVERDUE in environment",
      );
      return { success: false, error: "Template name not found" };
    }

    const messageBody: WhatsAppMessageBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber.replace("+", ""),
      type: "template",
      template: {
        name: WHATSAPP_TEMPLATE_OVERDUE,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.deadline.title },
              { type: "text", text: payload.deadline.courseTitle },
              { type: "text", text: payload.deadline.courseCode },
              { type: "text", text: payload.deadline.dueDate },
            ],
          },
        ],
      },
    };

    const waController = new AbortController();
    const waTimeout = setTimeout(() => waController.abort(), 8000);
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
        signal: waController.signal,
      },
    ).finally(() => clearTimeout(waTimeout));

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok) {
      const errorMsg = data.error?.message || "Unknown Meta API error";
      console.error("[whatsapp/overdue-error]", {
        status: response.status,
        error: errorMsg,
        errorCode: data.error?.code,
        errorSubcode: data.error?.error_subcode,
        fbtrace_id: data.error?.fbtrace_id,
        templateName: WHATSAPP_TEMPLATE_OVERDUE,
        maskedPhone: maskPhoneNumber(phoneNumber),
      });
      return { success: false, error: errorMsg };
    }

    console.log("[whatsapp/overdue-sent]", {
      templateName: WHATSAPP_TEMPLATE_OVERDUE,
      maskedPhone: maskPhoneNumber(phoneNumber),
      messageId: data.messages?.[0]?.id,
      messageStatus: data.messages?.[0]?.message_status,
    });

    return { success: true, maskedPhone: maskPhoneNumber(phoneNumber) };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network/Unknown error";
    console.error("[whatsapp/overdue-exception]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

function formatDeadlineList(
  deadlines: BatchNotificationPayload["deadlines"],
  isOverdue: boolean,
): string {
  return deadlines
    .map((d, i) => {
      const prefix = isOverdue ? "Was due" : "Due";
      return `${i + 1}. ${d.title} — ${d.courseCode} (${d.courseTitle}) — ${prefix}: ${d.dueDate}`;
    })
    .join("\n");
}

export async function sendWhatsAppBatchReminder(
  batch: BatchNotificationPayload,
  phoneNumber: string,
): Promise<{ success: boolean; error?: string; maskedPhone?: string }> {
  try {
    const {
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN,
      DEADLINE_REMINDER_BATCH,
    } = process.env;

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error("[whatsapp/error]", "Missing WhatsApp credentials in environment");
      return { success: false, error: "WhatsApp API not configured" };
    }

    if (!DEADLINE_REMINDER_BATCH) {
      console.error("[whatsapp/error]", "Missing DEADLINE_REMINDER_BATCH in environment");
      return { success: false, error: "Template name not found" };
    }

    const deadlineList = formatDeadlineList(batch.deadlines, false);

    const messageBody: WhatsAppMessageBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber.replace("+", ""),
      type: "template",
      template: {
        name: DEADLINE_REMINDER_BATCH,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: batch.userName },
              { type: "text", text: String(batch.deadlines.length) },
              { type: "text", text: deadlineList },
            ],
          },
        ],
      },
    };

    const waController = new AbortController();
    const waTimeout = setTimeout(() => waController.abort(), 8000);
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
        signal: waController.signal,
      },
    ).finally(() => clearTimeout(waTimeout));

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok) {
      const errorMsg = data.error?.message || "Unknown Meta API error";
      console.error("[whatsapp/batch-reminder-error]", {
        status: response.status,
        error: errorMsg,
        errorCode: data.error?.code,
        errorSubcode: data.error?.error_subcode,
        fbtrace_id: data.error?.fbtrace_id,
        templateName: DEADLINE_REMINDER_BATCH,
        maskedPhone: maskPhoneNumber(phoneNumber),
      });
      return { success: false, error: errorMsg };
    }

    console.log("[whatsapp/batch-reminder-sent]", {
      templateName: DEADLINE_REMINDER_BATCH,
      deadlineCount: batch.deadlines.length,
      maskedPhone: maskPhoneNumber(phoneNumber),
      messageId: data.messages?.[0]?.id,
    });

    return { success: true, maskedPhone: maskPhoneNumber(phoneNumber) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network/Unknown error";
    console.error("[whatsapp/batch-reminder-exception]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendWhatsAppBatchOverdue(
  batch: BatchNotificationPayload,
  phoneNumber: string,
): Promise<{ success: boolean; error?: string; maskedPhone?: string }> {
  try {
    const {
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN,
      DEADLINE_REMINDER_OVERDUE,
    } = process.env;

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error("[whatsapp/error]", "Missing WhatsApp credentials in environment");
      return { success: false, error: "WhatsApp API not configured" };
    }

    if (!DEADLINE_REMINDER_OVERDUE) {
      console.error("[whatsapp/error]", "Missing DEADLINE_REMINDER_OVERDUE in environment");
      return { success: false, error: "Template name not found" };
    }

    const deadlineList = formatDeadlineList(batch.deadlines, true);

    const messageBody: WhatsAppMessageBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber.replace("+", ""),
      type: "template",
      template: {
        name: DEADLINE_REMINDER_OVERDUE,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: batch.userName },
              { type: "text", text: String(batch.deadlines.length) },
              { type: "text", text: deadlineList },
            ],
          },
        ],
      },
    };

    const waController = new AbortController();
    const waTimeout = setTimeout(() => waController.abort(), 8000);
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
        signal: waController.signal,
      },
    ).finally(() => clearTimeout(waTimeout));

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok) {
      const errorMsg = data.error?.message || "Unknown Meta API error";
      console.error("[whatsapp/batch-overdue-error]", {
        status: response.status,
        error: errorMsg,
        errorCode: data.error?.code,
        errorSubcode: data.error?.error_subcode,
        fbtrace_id: data.error?.fbtrace_id,
        templateName: DEADLINE_REMINDER_OVERDUE,
        maskedPhone: maskPhoneNumber(phoneNumber),
      });
      return { success: false, error: errorMsg };
    }

    console.log("[whatsapp/batch-overdue-sent]", {
      templateName: DEADLINE_REMINDER_OVERDUE,
      deadlineCount: batch.deadlines.length,
      maskedPhone: maskPhoneNumber(phoneNumber),
      messageId: data.messages?.[0]?.id,
    });

    return { success: true, maskedPhone: maskPhoneNumber(phoneNumber) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network/Unknown error";
    console.error("[whatsapp/batch-overdue-exception]", errorMessage);
    return { success: false, error: errorMessage };
  }
}
