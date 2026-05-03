import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import {
  connectToDatabase,
  UserModel,
  DeadlineModel,
  SubscriptionModel,
  NotificationLogModel,
} from "@/lib/mongodb";

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return adminEmails.includes(email);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(id);

    await Promise.all([
      UserModel.deleteOne({ _id: userId }),
      DeadlineModel.deleteMany({ userId }),
      SubscriptionModel.deleteMany({ userId }),
      NotificationLogModel.deleteMany({ userId }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/users/delete]", error);
    return NextResponse.json(
      { error: "Could not delete user. Please try again." },
      { status: 500 }
    );
  }
}
