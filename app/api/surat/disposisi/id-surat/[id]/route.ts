import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();

    const id = (await context.params).id;
    // Sebelumnya cabang ini membuat NextResponse tanpa `return`, jadi request
    // tanpa id tetap diteruskan ke query.
    if (!id) return apiFail(400, "ID surat harus disertakan");

    const { data, error } = await supabase
      .from("disposisi")
      .select()
      .eq("surat_id", id)
      .order("id", { ascending: true });

    assertNoDbError(error, "disposisi.byIdSurat");
    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "disposisi.byIdSurat");
  }
}
