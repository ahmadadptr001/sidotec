import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload)
    return NextResponse.json({ status: 401, reason: "Data tidak lengkap" });

  try {
    const { data, error } = await supabase
      .from("disposisi")
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
