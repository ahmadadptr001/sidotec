import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireUser } from "@/lib/api";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();

    const id = (await params).id;
    if (!id) return apiFail(400, "ID disposisi harus disertakan");

    const { data, error } = await supabase
      .from("disposisi")
      .delete()
      .eq("id", id)
      .select("id");

    assertNoDbError(error, "disposisi.hapus");
    if (!data || data.length === 0) {
      return apiFail(404, "Disposisi tidak ditemukan");
    }

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "disposisi.hapus");
  }
}
