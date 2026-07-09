import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listSessions } from "@/lib/services/sessions";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}
