import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { DeadlineModel, connectToDatabase } from "@/lib/mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const deadline = await DeadlineModel.findById(id).lean();

  if (!deadline || deadline.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await DeadlineModel.findByIdAndUpdate(id, {
    isCompleted: true,
    status: "done",
    doneAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
