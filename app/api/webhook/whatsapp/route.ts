import { NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signature) return false;

  const expectedSignature = "sha256=" + crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );
}

/**
 * Meta Webhook Verification (GET)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Meta Webhook Events (POST)
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signature)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = JSON.parse(rawBody) as {
      object?: string;
      entry?: Array<{
        changes?: Array<{
          value?: {
            statuses?: Array<{ id: string; status: string; errors?: unknown }>;
            messages?: Array<{ from: string; text?: { body: string } }>;
          };
        }>;
      }>;
    };

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ ignored: true });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.statuses) {
      for (const status of value.statuses) {
        console.log("[whatsapp/webhook/status]", {
          messageId: status.id,
          status: status.status,
        });

        if (status.status === "failed") {
          console.error("[whatsapp/webhook/failed]", {
            messageId: status.id,
            errors: status.errors,
          });
        }
      }
    }

    if (value?.messages) {
      console.log("[whatsapp/webhook/messages]", {
        count: value.messages.length,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "[whatsapp/webhook]",
      error instanceof Error ? error.message : String(error),
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
