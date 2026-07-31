import { AUTH_COOKIE } from "@/lib/session";
import { NextResponse } from "next/server";

/** Logout. Memakai POST karena aksi ini mengubah state sesi. */
export async function POST() {
  const response = NextResponse.json({ status: 200 }, { status: 200 });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
