import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

// ini api untuk nge handle rentang dari tanggal awal hingga tanggal akhir
export async function POST(request: Request) {
  const { tanggalAwal, tanggalAkhir, jenis } = await request.json();

  if (!tanggalAwal || !tanggalAkhir || !jenis)
    return NextResponse.json({ status: 401, reason: "Data tidak lengkap" });

  try {
    const { data, error } = await supabase
      .from("surat")
      .select()
      .eq("jenis", jenis)
      .gte("created_at", tanggalAwal)
      .lte("created_at", tanggalAkhir);

    if (error) {
      console.error(error);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({ status: 200, data });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
