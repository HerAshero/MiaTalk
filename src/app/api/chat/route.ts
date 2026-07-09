import { NextResponse } from "next/server";
import { z } from "zod";
import { runStudentChat } from "@/lib/services/chat";

const ChatSchema = z.object({
  session_id: z.string().uuid(),
  student_answer: z.string().min(1).max(1000)
});

export async function POST(request: Request) {
  const body = ChatSchema.parse(await request.json());
  const result = await runStudentChat(body);
  return NextResponse.json(result);
}
