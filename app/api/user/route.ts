import { supabase } from "@/config/supabase";
import { apiCatch, apiOk, assertNoDbError, requireSuperadmin } from "@/lib/api";
import { KOLOM_PENGGUNA_PUBLIK } from "@/lib/tabel";

export async function GET() {
  try {
    await requireSuperadmin();

    // Kolom disebut satu per satu: `select()` tanpa argumen sebelumnya ikut
    // mengirim kolom `password` ke browser.
    const { data, error } = await supabase
      .from("pengguna")
      .select(KOLOM_PENGGUNA_PUBLIK)
      .order("nama_lengkap", { ascending: true });

    assertNoDbError(error, "user.list");
    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "user.list");
  }
}
