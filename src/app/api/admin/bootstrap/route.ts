import { NextResponse } from "next/server";
import { ensureDefaultPrompts } from "@/lib/services/prompts";
import { ensureDefaultScenes } from "@/lib/services/scenes";

export async function POST() {
  await ensureDefaultScenes();
  await ensureDefaultPrompts();
  return NextResponse.json({ ok: true });
}
