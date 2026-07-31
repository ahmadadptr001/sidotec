import { JENIS_SURAT, KATEGORI_SURAT } from "@/lib/tabel";
import { z } from "zod";

const TANGGAL = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus berformat YYYY-MM-DD");

/** Validasi surat di sisi server. Skema di halaman form hanya lapisan pertama. */
export const skemaSurat = z.object({
  nomor_agenda: z.string().min(1, "Nomor agenda wajib diisi").max(50),
  nomor_surat: z.string().min(1, "Nomor surat wajib diisi").max(150),
  jenis: z.enum(JENIS_SURAT, { message: "Pilih jenis surat yang valid" }),
  asal_surat: z.string().min(1, "Asal surat wajib diisi").max(200),
  ringkasan: z.string().min(1, "Isi ringkas wajib diisi").max(2000),
  kode_klasifikasi: z.string().min(1, "Kode klasifikasi wajib diisi").max(50),
  indeks_berkas: z.string().min(1, "Indeks berkas wajib diisi").max(100),
  tanggal: TANGGAL,
  kategori: z.enum(KATEGORI_SURAT, { message: "Pilih kategori yang valid" }),
  keterangan: z.string().max(2000).nullable().optional(),
  tujuan_surat: z.string().max(200).nullable().optional(),
});

/** Untuk halaman edit yang hanya mengirim sebagian field. */
export const skemaSuratPartial = skemaSurat.partial();

export const skemaDisposisi = z.object({
  surat_id: z.union([z.string().min(1), z.number()]),
  sifat: z.enum(["Biasa", "Penting", "Segera", "Rahasia"], {
    message: "Sifat disposisi tidak valid",
  }),
  tujuan: z.string().min(3, "Tujuan minimal 3 karakter").max(200),
  deadline: TANGGAL,
  isi: z.string().min(5, "Isi instruksi minimal 5 karakter").max(2000),
  catatan: z.string().max(2000).nullable().optional(),
});

export const skemaDisposisiPartial = skemaDisposisi.partial();

export const skemaRentang = z
  .object({
    tanggalAwal: TANGGAL,
    tanggalAkhir: TANGGAL,
    jenis: z.enum(JENIS_SURAT, { message: "Jenis surat tidak valid" }),
  })
  .refine((value) => value.tanggalAwal <= value.tanggalAkhir, {
    message: "Tanggal awal tidak boleh melebihi tanggal akhir",
    path: ["tanggalAwal"],
  });

/**
 * Mengubah FormData menjadi objek biasa. String kosong pada field opsional
 * dijadikan null supaya tidak tersimpan sebagai teks kosong di database.
 */
export function formDataKeObjek(
  formData: FormData,
  fields: readonly string[],
): Record<string, unknown> {
  const hasil: Record<string, unknown> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (value === null) continue;
    if (typeof value !== "string") continue;
    hasil[field] = value.trim() === "" ? null : value;
  }
  return hasil;
}
