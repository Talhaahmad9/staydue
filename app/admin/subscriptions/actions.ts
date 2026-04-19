"use server";

import { revalidatePath } from "next/cache";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { connectToDatabase, SubscriptionModel, UserModel } from "@/lib/mongodb";
import { getScreenshotUrl, deleteScreenshot } from "@/lib/r2";
import mongoose from "mongoose";

async function getAdminEmail(): Promise<string> {
  const headersList = await headers();
  // Build a minimal NextRequest-compatible object for getToken
  const token = await getToken({
    req: {
      headers: Object.fromEntries(headersList.entries()),
      cookies: Object.fromEntries(
        (headersList.get("cookie") ?? "")
          .split(";")
          .filter(Boolean)
          .map((c) => {
            const [k, ...rest] = c.trim().split("=");
            return [k, rest.join("=")];
          })
      ),
    } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.email as string ?? "admin";
}

export async function approveSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    const sub = await SubscriptionModel.findById(subscriptionId).lean();
    if (!sub) return { success: false, error: "Subscription not found" };
    if (sub.status !== "pending") return { success: false, error: "Subscription is not pending" };

    const adminEmail = await getAdminEmail();

    const now = new Date();
    const startDate = now;
    const endDate = new Date(now);
    if (sub.plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 4);
    }

    await SubscriptionModel.updateOne(
      { _id: new mongoose.Types.ObjectId(subscriptionId) },
      {
        $set: {
          status: "active",
          startDate,
          endDate,
          reviewedAt: now,
          reviewedBy: adminEmail,
          rejectionReason: null,
        },
      }
    );

    await UserModel.updateOne(
      { _id: sub.userId },
      { $set: { isPro: true, proExpiresAt: endDate } }
    );

    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[admin/approve-subscription]", error);
    return { success: false, error: "Failed to approve subscription" };
  }
}

export async function rejectSubscription(
  subscriptionId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    const sub = await SubscriptionModel.findById(subscriptionId).lean();
    if (!sub) return { success: false, error: "Subscription not found" };
    if (sub.status !== "pending") return { success: false, error: "Subscription is not pending" };

    const adminEmail = await getAdminEmail();
    const now = new Date();

    await SubscriptionModel.updateOne(
      { _id: new mongoose.Types.ObjectId(subscriptionId) },
      {
        $set: {
          status: "rejected",
          rejectionReason: reason.trim() || "No reason provided",
          reviewedAt: now,
          reviewedBy: adminEmail,
        },
      }
    );

    // Clean up screenshot from R2
    if (sub.screenshotKey) {
      await deleteScreenshot(sub.screenshotKey);
    }

    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[admin/reject-subscription]", error);
    return { success: false, error: "Failed to reject subscription" };
  }
}

export async function getSubscriptionScreenshotUrl(
  screenshotKey: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    return await getScreenshotUrl(screenshotKey);
  } catch (error) {
    console.error("[admin/screenshot-url]", error);
    return { success: false, error: "Failed to get screenshot URL" };
  }
}
