import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";
import { JENIS_SURAT } from "@/lib/tabel";

const MAX_LIMIT = 1000;

export async function GET(request: Request) {
  try {
    await requireUser();

    const { searchParams } = new URL(request.url);
    const jenisParam = searchParams.get("jenis");
    const limitParam = searchParams.get("limit");

    // `jenis` tidak valid sekarang ditolak. Sebelumnya nilai asing seperti
    // ?jenis=xyz justru mengembalikan seluruh surat (masuk + keluar).
    let jenis: string | null = null;
    if (jenisParam !== null && jenisParam !== "") {
      const normalized = jenisParam.toLowerCase();
      if (!JENIS_SURAT.includes(normalized as (typeof JENIS_SURAT)[number])) {
        return apiFail(400, "Jenis surat harus 'masuk' atau 'keluar'");
      }
      jenis = normalized;
    }

    // Tanpa parameter `limit`, seluruh data dikembalikan. Nilai default 10 yang
    // lama membuat daftar surat, pencarian, dan paginasi hanya melihat 10 baris.
    let limit: number | null = null;
    if (limitParam !== null && limitParam !== "") {
      const parsed = Number(limitParam);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return apiFail(400, "Parameter limit tidak valid");
      }
      limit = Math.min(parsed, MAX_LIMIT);
    }

    let query = supabase
      .from("surat")
      .select()
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false });

    if (jenis) query = query.eq("jenis", jenis);
    if (limit !== null) query = query.limit(limit);

    const { data, error } = await query;
    assertNoDbError(error, "surat.list");

    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "surat.list");
  }
}
