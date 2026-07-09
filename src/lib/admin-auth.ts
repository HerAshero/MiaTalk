import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { optionalEnv, requireEnv } from "@/lib/env";

const COOKIE_NAME = "miatalk_admin";

function sign(value: string) {
  return createHmac("sha256", requireEnv("ADMIN_COOKIE_SECRET"))
    .update(value)
    .digest("hex");
}

export async function setAdminCookie() {
  const issuedAt = String(Date.now());
  const token = `${issuedAt}.${sign(issuedAt)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthed() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = sign(issuedAt);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;

  const isValid = timingSafeEqual(left, right);
  const ageMs = Date.now() - Number(issuedAt);
  return isValid && ageMs < 1000 * 60 * 60 * 8;
}

export function verifyAdminPassword(password: string) {
  return password === optionalEnv("ADMIN_PASSWORD", "change-me");
}
