/**
 * Daftar kolom yang boleh keluar dari API dan boleh masuk ke database.
 * Dipakai sebagai allowlist supaya kolom sensitif (mis. `password`) tidak
 * pernah ikut terkirim ke browser, dan supaya payload dari client tidak bisa
 * menulis kolom sembarangan.
 */

/** Kolom pengguna yang aman dikirim ke client. */
export const KOLOM_PENGGUNA_PUBLIK =
  "id, username, email, nama_lengkap, unit, jabatan, role, created_at";

export const FIELD_SURAT = [
  "nomor_agenda",
  "nomor_surat",
  "jenis",
  "asal_surat",
  "ringkasan",
  "kode_klasifikasi",
  "indeks_berkas",
  "tanggal",
  "keterangan",
  "kategori",
  "tujuan_surat",
] as const;

export const FIELD_DISPOSISI = [
  "surat_id",
  "tujuan",
  "sifat",
  "deadline",
  "isi",
  "catatan",
] as const;

export const FIELD_INSTANSI = [
  "nama_instansi",
  "status",
  "alamat",
  "website",
  "email",
  "nomor_telpon",
  "akreditasi",
] as const;

export const FIELD_PENGGUNA_EDITABLE = [
  "username",
  "email",
  "nama_lengkap",
  "unit",
  "jabatan",
  "role",
] as const;

export const JENIS_SURAT = ["masuk", "keluar"] as const;
export const KATEGORI_SURAT = [
  "SDM",
  "Keuangan",
  "Umum",
  "Akademik",
  "Internal",
] as const;
export const ROLE_PENGGUNA = [
  "staff",
  "pimpinan",
  "admin",
  "superadmin",
] as const;

/** Menyaring objek sehingga hanya berisi field yang diizinkan dan terisi. */
export function pilihField<T extends readonly string[]>(
  source: Record<string, unknown>,
  allowed: T,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of allowed) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
}
