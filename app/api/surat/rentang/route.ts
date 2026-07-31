import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";
import { skemaRentang } from "@/lib/validasi-surat";

/**
 * Agenda surat per rentang tanggal.
 *
 * Filter memakai kolom `tanggal` (tanggal pada surat) — bukan `created_at`
 * (waktu data diinput) seperti sebelumnya, karena kolom itulah yang ditampilkan
 * di tabel dan di lembar cetak. Keduanya inklusif: `tanggal` bertipe date,
 * sehingga gte/lte pada string YYYY-MM-DD mencakup hari pertama dan terakhir.
 */
export async function POST(request: Request) {
  try {
    await requireUser();

    const parsed = skemaRentang.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }
    const { tanggalAwal, tanggalAkhir, jenis } = parsed.data;

    const { data, error } = await supabase
      .from("surat")
      .select()
      .eq("jenis", jenis)
      .gte("tanggal", tanggalAwal)
      .lte("tanggal", tanggalAkhir)
      .order("tanggal", { ascending: true })
      .order("nomor_agenda", { ascending: true });

    assertNoDbError(error, "surat.rentang");
    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "surat.rentang");
  }
}
