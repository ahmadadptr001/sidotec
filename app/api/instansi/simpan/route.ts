import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const payload = await request.json();
  if (!payload || !id)
    return NextResponse.json({ status: 401, reason: "Data tidak lengkap" });

  try {
    let data = null;
    let error = null;
    // cek kalau data instansi sudah ada atau masih kosong
    const { data: dataCheck, error: errorCheck } = await supabase
      .from("instansi")
      .select();

    if (errorCheck) {
      console.error(errorCheck);
      return NextResponse.json({ status: 401, reason: errorCheck.message });
    }

    if (dataCheck && dataCheck.length !== 0) {
      const { data: dataInstansi, error: dataInstansiError } = await supabase
        .from("instansi")
        .update(payload)
        .eq("id", id)
        .select();

      error = dataInstansiError;
      data = dataInstansi;
    } else {
      const { data: dataInstansi, error: dataInstansiError } = await supabase
        .from("instansi")
        .insert(payload)
        .select();

      error = dataInstansiError;
      data = dataInstansi;
    }

    if (error) {
      console.error(error);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({ status: 200, data });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
