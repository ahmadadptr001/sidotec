import { supabase } from "@/config/supabase";
import { apiCatch, apiOk, assertNoDbError, requireUser } from "@/lib/api";

/**
 * Hanya menghitung jumlah pengguna, tanpa membocorkan daftar akun.
 * Dipakai kartu statistik dashboard yang bisa dibuka semua role.
 */
export async function GET() {
  try {
    await requireUser();

    const { count, error } = await supabase
      .from("pengguna")
      .select("id", { count: "exact", head: true });

    assertNoDbError(error, "user.jumlah");
    return apiOk({ total: count ?? 0 });
  } catch (err) {
    return apiCatch(err, "user.jumlah");
  }
}
