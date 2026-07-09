import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDefaultPrompts } from "@/lib/services/prompts";
import { ensureDefaultScenes } from "@/lib/services/scenes";
import { createPracticeSession } from "@/lib/services/sessions";

const CreateSessionSchema = z.object({
  selected_scene_id: z.string(),
  student_alias: z.string().optional()
});

export async function POST(request: Request) {
  const body = CreateSessionSchema.parse(await request.json());
  await ensureDefaultScenes();
  await ensureDefaultPrompts();
  const session = await createPracticeSession(body);
  return NextResponse.json({ session });
}
