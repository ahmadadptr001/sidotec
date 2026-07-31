import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, requireUser } from "@/lib/api";
import { removeSuratFile, uploadSuratFile } from "@/lib/storage";
import { FIELD_SURAT } from "@/lib/tabel";
import { formDataKeObjek, skemaSurat } from "@/lib/validasi-surat";

export async function POST(request: Request) {
  try {
    await requireUser();

    const formData = await request.formData();

    // Field divalidasi lebih dulu, sebelum file diunggah, supaya tidak ada
    // berkas nyangkut di storage ketika datanya ternyata tidak sah.
    const parsed = skemaSurat.safeParse(formDataKeObjek(formData, FIELD_SURAT));
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return apiFail(400, "File dokumen wajib diunggah");
    }

    const { path, publicUrl } = await uploadSuratFile(file);

    const { data, error } = await supabase
      .from("surat")
      .insert({ ...parsed.data, file: publicUrl })
      .select();

    if (error) {
      // Insert gagal: file yang sudah terunggah dihapus kembali agar tidak
      // menjadi berkas yatim di bucket.
      await removeSuratFile(path);
      console.error("[surat.tambah]", error);
      return apiFail(400, error.message);
    }

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "surat.tambah");
  }
}
