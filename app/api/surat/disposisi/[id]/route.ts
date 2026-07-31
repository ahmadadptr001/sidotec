import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();

    const id = (await context.params).id;
    if (!id) return apiFail(400, "ID disposisi harus disertakan");

    const { data, error } = await supabase
      .from("disposisi")
      .select()
      .eq("id", id)
      .maybeSingle();

    assertNoDbError(error, "disposisi.detail");
    if (!data) return apiFail(404, "Disposisi tidak ditemukan");

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "disposisi.detail");
  }
}
