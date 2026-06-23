import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = await request.json();

  const id_surat = searchParams.get("id");

  if (!payload || !id_surat)
    return NextResponse.json({ status: 401, reason: "Data tidak lengkap" });

  try {
    const { data, error }: any = await supabase
      .from("surat")
      .update(payload)
      .eq("id", id_surat);

    if (error) {
      console.error(error.message);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({ status: 200, data });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
