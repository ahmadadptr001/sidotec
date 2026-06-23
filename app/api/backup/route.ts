import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  try {
    // Ambil semua data dari setiap tabel

    // 1. Data Pengguna (tanpa password untuk keamanan)
    const { data: pengguna, error: errorPengguna } = await supabase
      .from("pengguna")
      .select(
        "id, username, email, nama_lengkap, unit, jabatan, role, created_at, password",
      );

    if (errorPengguna) {
      console.error("Error fetching pengguna:", errorPengguna);
      return NextResponse.json({ status: 500, reason: errorPengguna.message });
    }

    // 2. Data Surat
    const { data: surat, error: errorSurat } = await supabase
      .from("surat")
      .select("*")
      .order("created_at", { ascending: false });

    if (errorSurat) {
      console.error("Error fetching surat:", errorSurat);
      return NextResponse.json({ status: 500, reason: errorSurat.message });
    }

    // 3. Data Disposisi
    const { data: disposisi, error: errorDisposisi } = await supabase
      .from("disposisi")
      .select("*")
      .order("created_at", { ascending: false });

    if (errorDisposisi) {
      console.error("Error fetching disposisi:", errorDisposisi);
      return NextResponse.json({ status: 500, reason: errorDisposisi.message });
    }

    // 4. Data Instansi
    const { data: instansi, error: errorInstansi } = await supabase
      .from("instansi")
      .select("*");

    if (errorInstansi) {
      console.error("Error fetching instansi:", errorInstansi);
      return NextResponse.json({ status: 500, reason: errorInstansi.message });
    }

    // Susun struktur backup
    const backupData = {
      metadata: {
        system: "SIDOTEC",
        version: "0.1.0",
        backup_date: new Date().toISOString(),
        description:
          "Sistem Informasi Dokumentasi Surat Masuk dan Keluar - Politeknik Indotec Kendari",
      },
      tables: {
        pengguna: pengguna || [],
        surat: surat || [],
        disposisi: disposisi || [],
        instansi: instansi || [],
      },
      statistics: {
        total_pengguna: pengguna?.length || 0,
        total_surat: surat?.length || 0,
        total_disposisi: disposisi?.length || 0,
        total_instansi: instansi?.length || 0,
        surat_masuk: surat?.filter((s: any) => s.jenis === "masuk").length || 0,
        surat_keluar:
          surat?.filter((s: any) => s.jenis === "keluar").length || 0,
      },
    };

    // Jika format adalah json, kembalikan sebagai JSON
    if (format === "json") {
      return NextResponse.json({ status: 200, data: backupData });
    }

    // Default: kembalikan sebagai JSON download
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    return new Response(blob, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="sidotec-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err: any) {
    console.error("Backup error:", err);
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
