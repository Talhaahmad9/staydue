import { NextResponse } from "next/server";
import { connectToDatabase, UserModel, SubscriptionModel } from "@/lib/mongodb";

export async function GET(request: Request): Promise<NextResponse> {
  // FIX 1A: Reject early if CRON_SECRET is not configured
  if (!process.env.CRON_SECRET) {
    console.error('[cron] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const now = new Date();
    const expiredUsers = await UserModel.find({
      isPro: true,
      proExpiresAt: { $lt: now },
    }).select("_id").lean();

    let expired = 0;
    let errors = 0;

    for (const user of expiredUsers) {
      try {
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { isPro: false, proExpiresAt: null } }
        );

        await SubscriptionModel.findOneAndUpdate(
          { userId: user._id, status: "active" },
          { $set: { status: "expired" } },
          { sort: { createdAt: -1 } }
        );

        expired++;
      } catch (error) {
        errors++;
        console.error("[cron/expire-subscriptions/error]", {
          userId: user._id.toString(),
          error,
        });
      }
    }

    const timestamp = new Date().toISOString();
    console.log("[cron/expire-subscriptions/summary]", { expired, errors, timestamp });

    return NextResponse.json({ expired, errors, timestamp });
  } catch (error) {
    console.error(
      "[cron/expire-subscriptions]",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
