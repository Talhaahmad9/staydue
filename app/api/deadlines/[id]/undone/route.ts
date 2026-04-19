import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { DeadlineModel, connectToDatabase } from "@/lib/mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectToDatabase();
    const deadline = await DeadlineModel.findById(id).lean();

    if (!deadline || deadline.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date();
    const newStatus = deadline.dueDate < now ? "overdue" : "upcoming";

    await DeadlineModel.findByIdAndUpdate(id, {
      isCompleted: false,
      status: newStatus,
      doneAt: undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[deadlines/undone]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
