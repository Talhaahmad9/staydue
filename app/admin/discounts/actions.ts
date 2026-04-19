"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase, DiscountCodeModel } from "@/lib/mongodb";
import mongoose from "mongoose";

const createSchema = z.object({
  code: z.string().min(2).max(32).regex(/^[A-Z0-9_-]+$/, "Only uppercase letters, numbers, _ and - allowed"),
  description: z.string().min(1).max(120),
  discountValue: z.number().int().min(1).max(100),
  applicablePlans: z.array(z.enum(["monthly", "semester"])).min(1),
  maxUses: z.number().int().min(1).nullable(),
  validFrom: z.string().nullable(),
  validUntil: z.string().nullable(),
});

export async function createDiscountCode(
  raw: unknown
): Promise<{ success: boolean; error?: string }> {
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await connectToDatabase();
    const { code, description, discountValue, applicablePlans, maxUses, validFrom, validUntil } = parsed.data;

    const exists = await DiscountCodeModel.findOne({ code: code.toUpperCase() });
    if (exists) return { success: false, error: "Code already exists" };

    await DiscountCodeModel.create({
      code: code.toUpperCase(),
      description,
      discountValue,
      applicablePlans,
      maxUses: maxUses ?? null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: true,
      usedCount: 0,
    });

    revalidatePath("/admin/discounts");
    return { success: true };
  } catch (error) {
    console.error("[admin/create-discount]", error);
    return { success: false, error: "Failed to create discount code" };
  }
}

export async function toggleDiscountCode(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    await DiscountCodeModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { isActive } }
    );
    revalidatePath("/admin/discounts");
    return { success: true };
  } catch (error) {
    console.error("[admin/toggle-discount]", error);
    return { success: false, error: "Failed to update discount code" };
  }
}
