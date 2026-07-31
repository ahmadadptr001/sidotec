import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";
import { skemaDisposisiPartial } from "@/lib/validasi-surat";

export async function POST(request: Request) {
  try {
    await requireUser();

    const { searchParams } = new URL(request.url);
    const idDisposisi = searchParams.get("id");
    if (!idDisposisi) return apiFail(400, "ID disposisi harus disertakan");

    const parsed = skemaDisposisiPartial.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak valid");
    }
    if (Object.keys(parsed.data).length === 0) {
      return apiFail(400, "Tidak ada perubahan yang dikirim");
    }

    const { data, error } = await supabase
      .from("disposisi")
      .update(parsed.data)
      .eq("id", idDisposisi)
      .select();

    assertNoDbError(error, "disposisi.edit");
    if (!data || data.length === 0) {
      return apiFail(404, "Disposisi tidak ditemukan");
    }

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "disposisi.edit");
  }
}
