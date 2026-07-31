/**
 * Sumber tunggal lambang Politeknik Indotec Kendari.
 *
 * Berkas gambarnya diturunkan dari logo resmi instansi:
 *   public/images/logo-indotec.png  512x512, transparan  — dipakai di aplikasi & kop surat
 *   app/icon.png                     96x96,  transparan  — ikon tab browser
 *   app/apple-icon.png              180x180, latar putih  — ikon layar utama iOS
 *
 * Dipakai di tiga tempat: komponen React (sidebar, halaman masuk), berkas ikon
 * metadata Next.js, dan dokumen cetak yang dibuka di jendela terpisah sehingga
 * tidak bisa memakai komponen React.
 */

export const LOGO_PATH = "/images/logo-indotec.png";
export const LOGO_ALT = "Logo Politeknik Indotec Kendari";

export const NAMA_INSTANSI_BAWAAN = "Politeknik Indotec Kendari";

/**
 * Markup <img> untuk dokumen cetak.
 *
 * Jendela cetak dibuka dengan `window.open("")` sehingga base URL-nya
 * about:blank — path relatif tidak akan ditemukan. Karena itu URL-nya harus
 * absolut terhadap origin aplikasi.
 */
export function logoImgMarkup(tinggiPx: number): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `<img src="${origin}${LOGO_PATH}" alt="${LOGO_ALT}" width="${tinggiPx}" height="${tinggiPx}" />`;
}
