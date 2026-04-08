import { DeadlineNotificationPayload } from "@/types/notification";

/**
 * Meta WhatsApp Business API Response Interface (v25.0)
 */
interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

/**
 * Template Parameter Types
 */
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
    language: {
      code: string;
    };
    components?: WhatsAppTemplateComponent[];
  };
}

/**
 * Privacy-safe phone masking for logs
 * Example: +923033047700 -> +92XXXXXX7700
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length < 8) return "****";
  const cleanPhone = phone.replace("+", "");
  return `+${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-4)}`;
}

/**
 * Sends a WhatsApp notification using the Meta Graph API v25.0
 * * @param payload - The deadline details (User, Title, Course, Date)
 * @param phoneNumber - The recipient's phone in +92 format
 * @param isTest - Whether to use the static 'staydue_test' template
 */
export async function sendWhatsAppMessage(
  payload: DeadlineNotificationPayload,
  phoneNumber: string,
  isTest: boolean = false,
): Promise<{ success: boolean; error?: string; maskedPhone?: string }> {
  try {
    // 1. Validate Environment
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

    // 2. Validate Template Selection
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

    // 3. Construct Payload
    // Meta expects 'to' as digits only (e.g., 923033047700)
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

    // 4. Map Template Variables (Only for non-test reminders)
    // Production Template Mapping: {{1}} Name, {{2}} Title, {{3}} Course, {{4}} Date
    if (!isTest) {
      messageBody.template.components = [
        {
          type: "body",
          parameters: [
            { type: "text", text: payload.userName },
            { type: "text", text: payload.deadline.title },
            { type: "text", text: payload.deadline.courseCode },
            { type: "text", text: payload.deadline.dueDate },
          ],
        },
      ];
    }

    // 5. Execute API Call (v25.0)
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      },
    );

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok) {
      const errorMsg = data.error?.message || "Unknown Meta API error";
      console.error("[whatsapp/error]", {
        status: response.status,
        error: errorMsg,
        templateName,
        maskedPhone: maskPhoneNumber(phoneNumber),
      });
      return { success: false, error: errorMsg };
    }

    // 6. Success Logging
    console.log("[whatsapp/sent]", {
      templateName,
      isTest,
      maskedPhone: maskPhoneNumber(phoneNumber),
      messageId: data.messages?.[0]?.id,
    });

    return { success: true, maskedPhone: maskPhoneNumber(phoneNumber) };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network/Unknown error";
    console.error("[whatsapp/exception]", errorMessage);
    return { success: false, error: errorMessage };
  }
}
