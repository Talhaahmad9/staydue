import { NextResponse } from "next/server";

/**
 * Meta Webhook Verification (GET)
 * This is the "handshake" Meta performs to verify your Callback URL.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Check if the secret sent by Meta matches your .env.local token
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    // 
    // You must return the challenge string as plain text with a 200 status
    console.log("[whatsapp/webhook] Handshake successful");
    return new Response(challenge, { status: 200 });
  }

  console.error("[whatsapp/webhook] Handshake failed: Invalid verify token");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Meta Webhook Events (POST)
 * This is where Meta will send message status updates (sent, delivered, read).
 */
export async function POST(req: Request) {
  // Acknowledge receipt immediately to prevent Meta from retrying the request
  return NextResponse.json({ success: true });
}