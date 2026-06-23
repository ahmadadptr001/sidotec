import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  if (!formData) {
    return NextResponse.json({ status: 401, reason: "Data tidak lengkap" });
  }
  const file = formData.get("file") as File;
  try {
    const filename = `${Date.now()}-${file.name}`;
    // upload file ke storage dulu
    const { data: dataStorage, error: errorStorage } = await supabase.storage
      .from("surat")
      .upload(filename, file);

    // ambil url public file nya
    const { data: urlPublicFile } = supabase.storage
      .from("surat")
      .getPublicUrl(filename);

    const payload = {
      nomor_agenda: formData.get("nomor_agenda"),
      nomor_surat: formData.get("nomor_surat"),
      jenis: formData.get("jenis"),
      asal_surat: formData.get("asal_surat"),
      ringkasan: formData.get("ringkasan"),
      kode_klasifikasi: formData.get("kode_klasifikasi"),
      indeks_berkas: formData.get("indeks_berkas"),
      tanggal: formData.get("tanggal"),
      keterangan: formData.get("keterangan"),
      kategori: formData.get("kategori"),
      file: urlPublicFile.publicUrl,
      tujuan_surat: formData.get("tujuan_surat"),
    };
    if (errorStorage) {
      console.error(errorStorage);
      return NextResponse.json({ status: 401, reason: errorStorage.message });
    }
    const { data, error } = await supabase
      .from("surat")
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
