import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const email = payload.email;

  if (!payload)
    return NextResponse.json({ status: 401, reason: "Data harus lengkap!" });

  try {
    //   cek data user dulu kalau email atau username sudah digunakan
    const { data: isUser, error: errorCheck }: any = await supabase
      .from("pengguna")
      .select("email")
      .eq("email", email);

    if (errorCheck) {
      console.log(errorCheck);
      return NextResponse.json({ status: 401, reason: errorCheck.message });
    }

    if (isUser.length !== 0) {
      return NextResponse.json({
        status: 401,
        reason: "email sudah digunakan",
      });
    }

    const { data, error }: any = await supabase
      .from("pengguna")
      .insert(payload)
      .select();

    if (error) {
      console.error(error);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({ status: 200, data });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
