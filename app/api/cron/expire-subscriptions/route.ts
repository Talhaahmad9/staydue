import { NextResponse } from "next/server";
import {
  revokeExpiredSubscriptions,
  sendGracePeriodEmails,
  sendProExpiringWarnings,
  sendTrialEndingWarnings,
} from "@/lib/subscription-lifecycle";

export async function GET(request: Request): Promise<NextResponse> {
  if (!process.env.CRON_SECRET) {
    console.error("[cron] CRON_SECRET env var is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [revoked, grace, proExpiring, trialEnding] = await Promise.all([
      revokeExpiredSubscriptions(),
      sendGracePeriodEmails(),
      sendProExpiringWarnings(),
      sendTrialEndingWarnings(),
    ]);

    const timestamp = new Date().toISOString();
    console.log("[cron/expire-subscriptions/summary]", {
      revoked: revoked.revoked,
      graceSent: grace.sent,
      proExpiringSent: proExpiring.sent,
      trialEndingSent: trialEnding.sent,
      errors: revoked.errors + grace.errors + proExpiring.errors + trialEnding.errors,
      timestamp,
    });

    return NextResponse.json({
      revoked: revoked.revoked,
      graceSent: grace.sent,
      proExpiringSent: proExpiring.sent,
      trialEndingSent: trialEnding.sent,
      errors: revoked.errors + grace.errors + proExpiring.errors + trialEnding.errors,
      timestamp,
    });
  } catch (error) {
    console.error("[cron/expire-subscriptions]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
