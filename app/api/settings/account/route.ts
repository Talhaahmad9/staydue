import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { z } from "zod";
import bcryptjs from "bcryptjs";

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json() as Record<string, unknown>;

    // Handle name update
    if ("name" in body) {
      const nameSchema = z.object({ name: z.string().min(2).max(50) });
      const result = nameSchema.safeParse({ name: body.name });
      if (!result.success) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
      }

      await UserModel.findByIdAndUpdate(session.user.id, { name: result.data.name });
      return NextResponse.json({ success: true });
    }

    // Handle password change
    if ("currentPassword" in body && "newPassword" in body) {
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      });
      const result = passwordSchema.safeParse({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });

      if (!result.success) {
        return NextResponse.json({ error: "Invalid password format" }, { status: 400 });
      }

      const user = await UserModel.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const passwordMatch = await bcryptjs.compare(
        result.data.currentPassword,
        user.passwordHash || ""
      );

      if (!passwordMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      // Hash and update new password
      const hashedPassword = await bcryptjs.hash(result.data.newPassword, 10);
      await UserModel.findByIdAndUpdate(session.user.id, { passwordHash: hashedPassword });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  } catch (error) {
    console.error("[settings/account]", error);
    return NextResponse.json(
      { error: "Could not update account settings" },
      { status: 500 }
    );
  }
}
