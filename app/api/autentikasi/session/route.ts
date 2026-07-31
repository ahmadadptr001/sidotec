import { getSession } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  // Isi cookie sudah berupa data sesi minimal (tanpa password) dan tanda
  // tangannya diverifikasi di sini, jadi cookie palsu akan ditolak.
  const user = await getSession();

  return NextResponse.json(
    { isLogin: !!user, user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
