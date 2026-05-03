import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase, UserModel, SubscriptionModel } from "@/lib/mongodb";

const TRIAL_DAYS = 30;

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id)
      .select("isPro proExpiresAt trialStartedAt phone")
      .lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const latestSubscription = await SubscriptionModel.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("status plan endDate createdAt")
      .lean();

    const now = new Date();

    let trialDaysLeft: number | null = null;
    if (user.trialStartedAt && !user.isPro) {
      const msElapsed = now.getTime() - user.trialStartedAt.getTime();
      const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
      trialDaysLeft = Math.max(0, TRIAL_DAYS - daysElapsed);
    }

    let proDaysLeft: number | null = null;
    if (user.isPro && user.proExpiresAt) {
      const msLeft = user.proExpiresAt.getTime() - now.getTime();
      proDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      isPro: user.isPro,
      proExpiresAt: user.proExpiresAt,
      proDaysLeft,
      trialStartedAt: user.trialStartedAt,
      trialDaysLeft,
      hasPhone: !!user.phone,
      subscription: latestSubscription ?? null,
    });
  } catch (error) {
    console.error("[subscription/status]", error);
    return NextResponse.json(
      { error: "Could not fetch subscription status" },
      { status: 500 }
    );
  }
}
