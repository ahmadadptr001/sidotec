import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, assertNoDbError, requireUser } from "@/lib/api";
import { removeSuratFile } from "@/lib/storage";
import { NextResponse } from "next/server";

/** DELETE, bukan GET: penghapusan tidak boleh dipicu dengan membuka URL. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();

    const id = (await context.params).id;
    if (!id) return apiFail(400, "Data tidak lengkap");

    const { data: surat, error: errorBaca } = await supabase
      .from("surat")
      .select("id, file")
      .eq("id", id)
      .maybeSingle();

    assertNoDbError(errorBaca, "surat.hapus.baca");
    if (!surat) return apiFail(404, "Surat tidak ditemukan");

    // Disposisi milik surat ini dihapus lebih dulu supaya tidak menjadi baris
    // yatim yang tetap terhitung di statistik dashboard.
    const { error: errorDisposisi } = await supabase
      .from("disposisi")
      .delete()
      .eq("surat_id", id);
    assertNoDbError(errorDisposisi, "surat.hapus.disposisi");

    const { error } = await supabase.from("surat").delete().eq("id", id);
    assertNoDbError(error, "surat.hapus");

    // Baris sudah hilang, jadi lampiran di storage juga dibersihkan.
    await removeSuratFile(surat.file);

    return NextResponse.json(
      { status: 200, message: "Berhasil menghapus surat beserta disposisinya" },
      { status: 200 },
    );
  } catch (err) {
    return apiCatch(err, "surat.hapus");
  }
}
