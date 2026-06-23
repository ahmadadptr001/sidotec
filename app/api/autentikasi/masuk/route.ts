import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password, username } = await request.json();

  try {
    const { data, error }: any = await supabase
      .from("pengguna")
      .select("*")
      .eq("password", password)
      .or(`email.eq.${username}, username.eq.${username}`);

    if (error) {
      console.error(error);
      return NextResponse.json({ status: 500, reason: error.message });
    } else if (!data.length) {
      console.log("[ERROR] pegguna tidak ditemukan");
      return NextResponse.json({
        status: 401,
        reason: "Pengguna tidak ditemukan",
      });
    }

    const response = NextResponse.json({ status: 200, data });

    response.cookies.set("auth", JSON.stringify(data), {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
