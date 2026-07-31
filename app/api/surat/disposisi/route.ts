import { supabase } from "@/config/supabase";
import { apiCatch, apiOk, assertNoDbError, requireUser } from "@/lib/api";

export async function GET() {
  try {
    await requireUser();

    const { data, error } = await supabase
      .from("disposisi")
      .select()
      .order("deadline", { ascending: true });

    assertNoDbError(error, "disposisi.list");
    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "disposisi.list");
  }
}
