import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ status: 200 });
  res.cookies.delete("auth");
  return res;
}
