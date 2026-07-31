import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, assertNoDbError, requireSuperadmin } from "@/lib/api";
import { NextResponse } from "next/server";

/** DELETE, bukan GET: penghapusan tidak boleh dipicu dengan membuka URL. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const pelaku = await requireSuperadmin();
    const id = (await context.params).id;

    if (!id) return apiFail(400, "Data tidak lengkap");

    // Menghapus akun sendiri akan membuat pengguna kehilangan akses; ini juga
    // sudah dicegah di UI, tetapi harus ditegakkan di server.
    if (String(pelaku.id) === String(id)) {
      return apiFail(400, "Anda tidak dapat menghapus akun Anda sendiri");
    }

    const { error } = await supabase.from("pengguna").delete().eq("id", id);
    assertNoDbError(error, "autentikasi.hapus");

    return NextResponse.json(
      { status: 200, message: "Berhasil menghapus data pengguna" },
      { status: 200 },
    );
  } catch (err) {
    return apiCatch(err, "autentikasi.hapus");
  }
}
