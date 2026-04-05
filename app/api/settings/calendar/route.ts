import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { z } from "zod";

const calendarUrlSchema = z.string().url().startsWith("https://lms.iobm.edu.pk");

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json() as Record<string, unknown>;

    if (!("url" in body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = calendarUrlSchema.safeParse(body.url);
    if (!result.success) {
      return NextResponse.json(
        { error: "Please provide a valid Moodle calendar export URL" },
        { status: 400 }
      );
    }

    await UserModel.findByIdAndUpdate(session.user.id, {
      moodleCalendarUrl: result.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[settings/calendar]", error);
    return NextResponse.json(
      { error: "Could not update calendar settings" },
      { status: 500 }
    );
  }
}
