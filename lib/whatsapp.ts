import { DeadlineNotificationPayload } from "@/types/notification";

interface WhatsAppTemplateComponent {
  type: string;
  parameters?: {
    body?: {
      parameters: Array<{ type: string; text: string }>;
    };
  };
}

interface WhatsAppMessageBody {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: WhatsAppTemplateComponent[];
  };
}

function maskPhoneNumber(phone: string): string {
  // Show only last 4 digits: +92XXXXXX7890
  if (phone.length < 4) return "****";
  return `+92${"X".repeat(Math.max(0, phone.length - 6))}${phone.slice(-4)}`;
}

export async function sendWhatsAppMessage(
  payload: DeadlineNotificationPayload,
  phoneNumber: string,
  isTest: boolean = false
): Promise<{ success: boolean; error?: string; maskedPhone?: string }> {
  try {
    // Validate environment variables
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
      console.error("[whatsapp]", "Missing WhatsApp credentials in environment");
      return { success: false, error: "WhatsApp not configured" };
    }

    // Validate phone number
    if (!phoneNumber || !phoneNumber.match(/^\+92[0-9]{10}$/)) {
      return { success: false, error: "Invalid phone number format" };
    }

    const templateName = isTest ? process.env.WHATSAPP_TEMPLATE_TEST : process.env.WHATSAPP_TEMPLATE_NAME;
    if (!templateName) {
      console.error("[whatsapp]", `Missing template: ${isTest ? "WHATSAPP_TEMPLATE_TEST" : "WHATSAPP_TEMPLATE_NAME"}`);
      return { success: false, error: "WhatsApp template not configured" };
    }

    const messageBody: WhatsAppMessageBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber.replace("+", ""),
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en",
        },
      },
    };

    // Add template variables if not test
    if (!isTest) {
      const formattedDueDate = payload.deadline.dueDate;
      messageBody.template.components = [
        {
          type: "body",
          parameters: {
            body: {
              parameters: [
                { type: "text", text: payload.userName },
                { type: "text", text: payload.deadline.title },
                { type: "text", text: payload.deadline.courseCode },
                { type: "text", text: formattedDueDate },
              ],
            },
          },
        },
      ];
    }

    const response = await fetch(
      `https://graph.instagram.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      }
    );

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const errorMsg = (data.error as Record<string, unknown> | undefined)?.message || "Unknown error";
      console.error("[whatsapp/error]", {
        status: response.status,
        error: errorMsg,
        templateName,
        maskedPhone: maskPhoneNumber(phoneNumber),
      });
      return { success: false, error: String(errorMsg) };
    }

    console.log("[whatsapp/sent]", {
      templateName,
      isTest,
      maskedPhone: maskPhoneNumber(phoneNumber),
      messageId: (data.messages as Array<Record<string, unknown>> | undefined)?.[0]?.id,
    });

    return { success: true, maskedPhone: maskPhoneNumber(phoneNumber) };
  } catch (error) {
    console.error("[whatsapp]", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
