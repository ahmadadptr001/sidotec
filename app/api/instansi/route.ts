import { supabase } from "@/config/supabase";
import { apiCatch, apiOk, assertNoDbError, requireUser } from "@/lib/api";

export async function GET() {
  try {
    await requireUser();

    const { data, error } = await supabase
      .from("instansi")
      .select()
      .order("id", { ascending: true });

    assertNoDbError(error, "instansi.list");
    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "instansi.list");
  }
}
