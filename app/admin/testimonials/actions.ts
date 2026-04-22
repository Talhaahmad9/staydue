"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase, TestimonialModel } from "@/lib/mongodb";
import { uploadTestimonialPhoto, deleteScreenshot } from "@/lib/r2";
import mongoose from "mongoose";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

const textSchema = z.object({
  quote: z.string().min(10).max(500),
  name: z.string().min(1).max(80),
  batch: z.string().min(1).max(40),
  course: z.string().min(1).max(80),
  order: z.number().int().min(0).max(999),
});

export async function createTestimonial(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const parsed = textSchema.safeParse({
    quote: formData.get("quote"),
    name: formData.get("name"),
    batch: formData.get("batch"),
    course: formData.get("course"),
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { quote, name, batch, course, order } = parsed.data;

  let photoKey: string | undefined;
  const photoFile = formData.get("photo") as File | null;

  if (photoFile && photoFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(photoFile.type)) {
      return { success: false, error: "Photo must be a JPEG, PNG, or WebP image" };
    }
    if (photoFile.size > MAX_PHOTO_SIZE) {
      return { success: false, error: "Photo must be under 2MB" };
    }

    const buffer = Buffer.from(await photoFile.arrayBuffer());
    const safeName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const upload = await uploadTestimonialPhoto(buffer, safeName, photoFile.type);
    if (!upload.success || !upload.key) {
      return { success: false, error: upload.error ?? "Failed to upload photo" };
    }
    photoKey = upload.key;
  }

  try {
    await connectToDatabase();
    await TestimonialModel.create({ quote, name, batch, course, photoKey, isVisible: true, order });
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[admin/create-testimonial]", error);
    if (photoKey) {
      deleteScreenshot(photoKey).catch(() => {});
    }
    return { success: false, error: "Failed to save testimonial" };
  }
}

export async function deleteTestimonial(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const doc = await TestimonialModel.findByIdAndDelete(new mongoose.Types.ObjectId(id)).lean();
    if (doc?.photoKey) {
      deleteScreenshot(doc.photoKey).catch(() => {});
    }
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[admin/delete-testimonial]", error);
    return { success: false, error: "Failed to delete testimonial" };
  }
}

export async function toggleTestimonialVisibility(
  id: string,
  isVisible: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    await TestimonialModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { isVisible } }
    );
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[admin/toggle-testimonial]", error);
    return { success: false, error: "Failed to update testimonial" };
  }
}

export async function updateTestimonialOrder(
  id: string,
  order: number
): Promise<{ success: boolean; error?: string }> {
  if (!Number.isInteger(order) || order < 0 || order > 999) {
    return { success: false, error: "Invalid order value" };
  }
  try {
    await connectToDatabase();
    await TestimonialModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { order } }
    );
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[admin/update-testimonial-order]", error);
    return { success: false, error: "Failed to update order" };
  }
}
