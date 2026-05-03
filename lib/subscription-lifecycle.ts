import { connectToDatabase, UserModel, SubscriptionModel } from "@/lib/mongodb";
import {
  sendTrialEndingEmail,
  sendProExpiringEmail,
  sendGracePeriodEmail,
} from "@/lib/resend";

const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Revoke users whose grace period is complete (all 3 grace emails sent)
// Also catches any stale isPro records older than 7 days that predate the grace period feature.
export async function revokeExpiredSubscriptions(): Promise<{ revoked: number; errors: number }> {
  await connectToDatabase();
  const now = new Date();

  const expiredUsers = await UserModel.find({
    isPro: true,
    $or: [
      { proExpiresAt: { $lt: now }, graceEmailsSent: { $gte: 3 } },
      { proExpiresAt: { $lt: new Date(now.getTime() - 7 * DAY_MS) } },
    ],
  }).select("_id").lean();

  let revoked = 0;
  let errors = 0;

  for (const user of expiredUsers) {
    try {
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { isPro: false, proExpiresAt: null, graceEmailsSent: 0 } }
      );
      await SubscriptionModel.findOneAndUpdate(
        { userId: user._id, status: "active" },
        { $set: { status: "expired" } },
        { sort: { createdAt: -1 } }
      );
      revoked++;
    } catch (err) {
      errors++;
      console.error("[lifecycle/revoke/error]", { userId: user._id.toString(), err });
    }
  }

  return { revoked, errors };
}

// Send grace period emails (day 1, 2, 3 post-expiry). Uses optimistic concurrency on
// graceEmailsSent to ensure exactly one email per day even if the cron runs twice.
export async function sendGracePeriodEmails(): Promise<{ sent: number; errors: number }> {
  await connectToDatabase();
  const now = new Date();

  // Only target subscriptions that expired within the last 4 days to avoid
  // accidentally emailing users whose subscriptions expired long before this feature shipped.
  const graceCutoff = new Date(now.getTime() - 4 * DAY_MS);
  const users = await UserModel.find({
    isPro: true,
    proExpiresAt: { $lt: now, $gte: graceCutoff },
    graceEmailsSent: { $lt: 3 },
  }).select("_id name email graceEmailsSent").lean();

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const daysLeft = (3 - user.graceEmailsSent) as 1 | 2 | 3;
      // Atomic claim: only proceed if graceEmailsSent hasn't changed since we read it
      const claimed = await UserModel.findOneAndUpdate(
        { _id: user._id, graceEmailsSent: user.graceEmailsSent },
        { $inc: { graceEmailsSent: 1 } }
      );
      if (!claimed) continue; // another run already sent this one

      if (user.email) {
        await sendGracePeriodEmail(user.email, user.name ?? "there", daysLeft);
        sent++;
      }
    } catch (err) {
      errors++;
      console.error("[lifecycle/grace/error]", { userId: user._id.toString(), err });
    }
  }

  return { sent, errors };
}

// Send "Pro expires tomorrow" warning — once per subscription cycle.
// Window: proExpiresAt falls within the next 24 hours.
export async function sendProExpiringWarnings(): Promise<{ sent: number; errors: number }> {
  await connectToDatabase();
  const now = new Date();
  const in24h = new Date(now.getTime() + DAY_MS);

  const users = await UserModel.find({
    isPro: true,
    proExpiresAt: { $gte: now, $lte: in24h },
  }).select("_id name email proExpiresAt").lean();

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    try {
      if (user.email && user.proExpiresAt) {
        await sendProExpiringEmail(user.email, user.name ?? "there", user.proExpiresAt);
        sent++;
      }
    } catch (err) {
      errors++;
      console.error("[lifecycle/pro-expiring/error]", { userId: user._id.toString(), err });
    }
  }

  return { sent, errors };
}

// Send "Trial ends today" warning — on the last day of the 30-day trial.
// Window: trialStartedAt + 30 days falls within the next 24 hours.
export async function sendTrialEndingWarnings(): Promise<{ sent: number; errors: number }> {
  await connectToDatabase();
  const now = new Date();
  // trialStartedAt window: between (now - 30d) and (now - 29d)
  const windowStart = new Date(now.getTime() - TRIAL_MS);
  const windowEnd = new Date(now.getTime() - TRIAL_MS + DAY_MS);

  const users = await UserModel.find({
    isPro: false,
    trialStartedAt: { $gte: windowStart, $lte: windowEnd },
  }).select("_id name email").lean();

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    try {
      if (user.email) {
        await sendTrialEndingEmail(user.email, user.name ?? "there");
        sent++;
      }
    } catch (err) {
      errors++;
      console.error("[lifecycle/trial-ending/error]", { userId: user._id.toString(), err });
    }
  }

  return { sent, errors };
}
