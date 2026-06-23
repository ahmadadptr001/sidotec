import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const jenis_ = searchParams.get("jenis");
  const limit_ = searchParams.get("limit");

  const limit = limit_ ?? 10;

  const allowedJenis = ["masuk", "keluar"];

  let jenis = "";
  if (jenis_ && allowedJenis.includes(jenis_)) jenis = jenis_;

  try {
    let hasil = null;
    if (jenis?.length === 0) {
      const { data, error } = await supabase
        .from("surat")
        .select()
        .limit(Number(limit));

      if (error) {
        console.error(error);
        return NextResponse.json({ status: 401, reason: error.message });
      }

      hasil = data;
    } else {
      const { data, error } = await supabase
        .from("surat")
        .select()
        .eq("jenis", jenis?.toLocaleLowerCase())
        .limit(Number(limit));

      if (error) {
        console.error(error);
        return NextResponse.json({ status: 401, reason: error.message });
      }

      hasil = data;
    }

    return NextResponse.json({ status: 200, data: hasil });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
