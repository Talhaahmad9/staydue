"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase, UserModel, SubscriptionModel } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function grantPro(
  userId: string,
  plan: "monthly" | "semester"
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    const endDate = new Date();
    if (plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 4);
    }

    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { isPro: true, proExpiresAt: endDate } }
    );

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[admin/grant-pro]", error);
    return { success: false, error: "Failed to grant Pro" };
  }
}

export async function revokeTrial(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { trialStartedAt: null, trialPhoneNumber: null, whatsappTrialUsed: 0 } }
    );

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[admin/revoke-trial]", error);
    return { success: false, error: "Failed to revoke trial" };
  }
}

export async function revokePro(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { isPro: false, proExpiresAt: null } }
    );

    // Also expire any active subscription
    await SubscriptionModel.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), status: "active" },
      { $set: { status: "expired" } }
    );

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[admin/revoke-pro]", error);
    return { success: false, error: "Failed to revoke Pro" };
  }
}
