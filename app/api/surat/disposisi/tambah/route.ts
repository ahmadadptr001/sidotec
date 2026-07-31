import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";
import { skemaDisposisi } from "@/lib/validasi-surat";

export async function POST(request: Request) {
  try {
    await requireUser();

    const parsed = skemaDisposisi.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }
    const payload = parsed.data;

    // Disposisi tanpa surat induk akan menjadi baris yatim, jadi keberadaan
    // suratnya diverifikasi lebih dulu.
    const { data: surat, error: errorSurat } = await supabase
      .from("surat")
      .select("id")
      .eq("id", payload.surat_id)
      .maybeSingle();

    assertNoDbError(errorSurat, "disposisi.tambah.cekSurat");
    if (!surat) return apiFail(404, "Surat tidak ditemukan");

    const { data, error } = await supabase
      .from("disposisi")
      .insert(payload)
      .select();

    assertNoDbError(error, "disposisi.tambah");
    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "disposisi.tambah");
  }
}
