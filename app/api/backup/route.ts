import { supabase } from "@/config/supabase";
import { apiCatch, apiOk, assertNoDbError, requireSuperadmin } from "@/lib/api";
import { KOLOM_PENGGUNA_PUBLIK } from "@/lib/tabel";

export async function GET(request: Request) {
  try {
    await requireSuperadmin();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    // Password ikut dicadangkan dalam bentuk HASH (bukan teks asli), karena
    // tanpa itu proses restore tidak bisa memulihkan akses pengguna. Berkas
    // hasil backup tetap harus diperlakukan sebagai dokumen rahasia.
    const { data: pengguna, error: errorPengguna } = await supabase
      .from("pengguna")
      .select(`${KOLOM_PENGGUNA_PUBLIK}, password`);
    assertNoDbError(errorPengguna, "backup.pengguna");

    const { data: surat, error: errorSurat } = await supabase
      .from("surat")
      .select("*")
      .order("id", { ascending: true });
    assertNoDbError(errorSurat, "backup.surat");

    const { data: disposisi, error: errorDisposisi } = await supabase
      .from("disposisi")
      .select("*")
      .order("id", { ascending: true });
    assertNoDbError(errorDisposisi, "backup.disposisi");

    const { data: instansi, error: errorInstansi } = await supabase
      .from("instansi")
      .select("*")
      .order("id", { ascending: true });
    assertNoDbError(errorInstansi, "backup.instansi");

    const backupData = {
      metadata: {
        system: "SIDOTEC",
        version: "0.1.0",
        backup_date: new Date().toISOString(),
        description:
          "Sistem Informasi Dokumentasi Surat Masuk dan Keluar - Politeknik Indotec Kendari",
        catatan_keamanan:
          "Berkas ini memuat hash kata sandi seluruh pengguna. Simpan di tempat yang aman.",
      },
      tables: {
        pengguna: pengguna ?? [],
        surat: surat ?? [],
        disposisi: disposisi ?? [],
        instansi: instansi ?? [],
      },
      statistics: {
        total_pengguna: pengguna?.length ?? 0,
        total_surat: surat?.length ?? 0,
        total_disposisi: disposisi?.length ?? 0,
        total_instansi: instansi?.length ?? 0,
        surat_masuk: surat?.filter((s: { jenis?: string | null }) => s.jenis === "masuk").length ?? 0,
        surat_keluar: surat?.filter((s: { jenis?: string | null }) => s.jenis === "keluar").length ?? 0,
      },
    };

    if (format === "json") {
      return apiOk(backupData);
    }

    // format=file → isi backup mentah sebagai unduhan. Bentuk inilah (metadata
    // + tables di level teratas) yang bisa dibaca kembali halaman Restore.
    const namaBerkas = `sidotec-backup-${new Date().toISOString().split("T")[0]}.json`;
    return new Response(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${namaBerkas}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return apiCatch(err, "backup");
  }
}
