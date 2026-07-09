import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminCookie, verifyAdminPassword } from "@/lib/admin-auth";

const LoginSchema = z.object({
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const { password } = LoginSchema.parse(await request.json());
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
