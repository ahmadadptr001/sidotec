import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();

    const id = (await context.params).id;
    if (!id) return apiFail(400, "ID surat harus disertakan");

    const { data, error } = await supabase
      .from("surat")
      .select()
      .eq("id", id)
      .maybeSingle();

    assertNoDbError(error, "surat.detail");
    if (!data) return apiFail(404, "Surat tidak ditemukan");

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "surat.detail");
  }
}
