const BULAN_INDONESIA = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Format YYYY-MM-DD berdasarkan zona waktu lokal.
 * `toISOString()` tidak dipakai karena mengubah tanggal ke UTC sehingga tanggal
 * yang dipilih pengguna bisa bergeser satu hari.
 */
export function formatTanggalLokal(date: Date): string {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

/**
 * Mengubah "2026-07-31" menjadi Date lokal.
 * `new Date("2026-07-31")` diperlakukan sebagai UTC oleh JavaScript, sehingga
 * pada zona waktu tertentu tanggalnya bergeser satu hari.
 */
export function parseTanggal(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const cocok = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (cocok) {
    return new Date(Number(cocok[1]), Number(cocok[2]) - 1, Number(cocok[3]));
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/** "31 Juli 2026" */
export function formatTanggalIndonesia(
  value: string | Date | null | undefined,
): string {
  const date = parseTanggal(value);
  if (!date) return "-";
  return `${date.getDate()} ${BULAN_INDONESIA[date.getMonth()]} ${date.getFullYear()}`;
}

/** "31/07/2026" */
export function formatTanggalSingkat(
  value: string | Date | null | undefined,
): string {
  const date = parseTanggal(value);
  if (!date) return "-";
  const hari = String(date.getDate()).padStart(2, "0");
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  return `${hari}/${bulan}/${date.getFullYear()}`;
}

/**
 * Menebak nama kota dari alamat instansi untuk baris "Kota, tanggal" pada blok
 * tanda tangan surat.
 *
 * Tabel `instansi` tidak menyimpan kota secara terpisah, jadi nilainya diurai
 * dari alamat dengan urutan dugaan berikut:
 *   1. segmen yang diawali "Kota"/"Kabupaten"/"Kab."  → ambil namanya
 *   2. segmen yang memuat kode pos 5 digit            → buang angkanya
 *   3. segmen terakhir
 * Bila semuanya gagal, kembalikan null dan blok tanda tangan cukup menampilkan
 * tanggal saja (lebih baik kosong daripada salah kota).
 */
export function tebakKota(alamat: string | null | undefined): string | null {
  if (!alamat) return null;

  const segmen = alamat
    .split(",")
    .map((bagian) => bagian.trim())
    .filter(Boolean);
  if (segmen.length < 2) return null;

  const bersihkan = (nilai: string) =>
    nilai.replace(/\d+/g, "").replace(/\s+/g, " ").trim();

  const layak = (nilai: string) => nilai.length >= 3 && nilai.length <= 30;

  for (const bagian of segmen) {
    const cocok = /^(?:kota|kabupaten|kab\.?)\s+(.+)$/i.exec(bagian);
    if (cocok) {
      const kandidat = bersihkan(cocok[1]);
      if (layak(kandidat)) return kandidat;
    }
  }

  for (const bagian of segmen) {
    if (/\b\d{5}\b/.test(bagian)) {
      const kandidat = bersihkan(bagian);
      if (layak(kandidat)) return kandidat;
    }
  }

  const terakhir = bersihkan(segmen[segmen.length - 1]);
  return layak(terakhir) ? terakhir : null;
}
