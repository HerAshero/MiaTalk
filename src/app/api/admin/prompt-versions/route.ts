import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { ensureDefaultPrompts, listPromptVersions } from "@/lib/services/prompts";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDefaultPrompts();
  const promptVersions = await listPromptVersions();
  return NextResponse.json({ promptVersions });
}
