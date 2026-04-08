import { NextResponse } from "next/server";

/**
 * Meta Webhook Verification (GET)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[whatsapp/webhook] Handshake successful");
    return new Response(challenge ?? "", { status: 200 });
  }

  console.error("[whatsapp/webhook] Handshake failed");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Meta Webhook Events (POST)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "[whatsapp/webhook] Incoming payload:",
      JSON.stringify(body, null, 2),
    );

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ ignored: true });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Message status updates
    if (value?.statuses) {
      for (const status of value.statuses) {
        const messageId = status.id;
        const statusType = status.status; // sent | delivered | read | failed
        const recipient = status.recipient_id;
        const timestamp = status.timestamp;
        const errors = status.errors;

        console.log("Status Update:");
        console.log("  ID:", messageId);
        console.log("  Status:", statusType);
        console.log("  To:", recipient);
        console.log("  Time:", timestamp);

        if (statusType === "failed") {
          console.error("Message failed:", errors);
        }

        // TODO: store in DB if needed
        // await saveStatus({ messageId, statusType, recipient, timestamp });
      }
    }

    // Incoming user messages (optional)
    if (value?.messages) {
      for (const msg of value.messages) {
        const from = msg.from;
        const text = msg.text?.body;

        console.log("Incoming message:");
        console.log("  From:", from);
        console.log("  Text:", text);

        // TODO: handle or reply if needed
      }
    }

    // Always respond quickly
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[whatsapp/webhook] Error processing:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
