import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { sanitizeString } from "@/utils/sanitize";
import { registerInputSchema } from "@/utils/validate";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = registerInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup input.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: parsed.data.email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists for this email.", code: "EMAIL_IN_USE" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(parsed.data.password, 12);

    await UserModel.create({
      name: sanitizeString(parsed.data.name, 50),
      email: parsed.data.email,
      passwordHash,
      timezone: "Asia/Karachi",
      hasCompletedOnboarding: false,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Could not create your account right now. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
