import { NextResponse } from "next/server";
import { ensureDefaultScenes, listScenes } from "@/lib/services/scenes";

export async function GET() {
  await ensureDefaultScenes().catch(() => undefined);
  const scenes = await listScenes();
  return NextResponse.json({ scenes });
}
