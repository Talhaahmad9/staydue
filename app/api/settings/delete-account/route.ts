import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel, DeadlineModel, SubscriptionModel, connectToDatabase } from "@/lib/mongodb";

export async function DELETE(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Delete all user data
    await DeadlineModel.deleteMany({ userId: session.user.id });
    await SubscriptionModel.deleteMany({ userId: session.user.id });

    // Delete the user
    await UserModel.findByIdAndDelete(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[settings/delete-account]", error);
    return NextResponse.json(
      { error: "Could not delete account" },
      { status: 500 }
    );
  }
}
