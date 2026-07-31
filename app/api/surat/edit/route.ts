import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, requireUser } from "@/lib/api";
import { removeSuratFile, uploadSuratFile } from "@/lib/storage";
import { FIELD_SURAT } from "@/lib/tabel";
import { formDataKeObjek, skemaSuratPartial } from "@/lib/validasi-surat";

export async function POST(request: Request) {
  try {
    await requireUser();

    const { searchParams } = new URL(request.url);
    const idSurat = searchParams.get("id");
    if (!idSurat) return apiFail(400, "ID surat harus disertakan");

    // Halaman edit mengirim JSON bila lampiran tidak diganti, dan multipart
    // bila pengguna memilih file baru.
    const contentType = request.headers.get("content-type") ?? "";
    const multipart = contentType.includes("multipart/form-data");

    let raw: Record<string, unknown>;
    let fileBaru: File | null = null;

    if (multipart) {
      const formData = await request.formData();
      raw = formDataKeObjek(formData, FIELD_SURAT);
      const kandidat = formData.get("file");
      if (kandidat instanceof File && kandidat.size > 0) fileBaru = kandidat;
    } else {
      const body = await request.json();
      raw = typeof body === "object" && body !== null ? body : {};
    }

    const parsed = skemaSuratPartial.safeParse(raw);
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const perubahan: Record<string, unknown> = { ...parsed.data };
    if (Object.keys(perubahan).length === 0 && !fileBaru) {
      return apiFail(400, "Tidak ada perubahan yang dikirim");
    }

    // Lampiran lama dibaca dulu supaya bisa dibersihkan setelah penggantian.
    const { data: suratLama, error: errorLama } = await supabase
      .from("surat")
      .select("file")
      .eq("id", idSurat)
      .maybeSingle();

    if (errorLama) {
      console.error("[surat.edit.baca]", errorLama);
      return apiFail(400, errorLama.message);
    }
    if (!suratLama) return apiFail(404, "Surat tidak ditemukan");

    let pathBaru: string | null = null;
    if (fileBaru) {
      const uploaded = await uploadSuratFile(fileBaru);
      pathBaru = uploaded.path;
      perubahan.file = uploaded.publicUrl;
    }

    const { data, error } = await supabase
      .from("surat")
      .update(perubahan)
      .eq("id", idSurat)
      .select();

    if (error) {
      if (pathBaru) await removeSuratFile(pathBaru);
      console.error("[surat.edit]", error);
      return apiFail(400, error.message);
    }

    if (fileBaru && suratLama.file) {
      await removeSuratFile(suratLama.file);
    }

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "surat.edit");
  }
}
