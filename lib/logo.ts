/**
 * Sumber tunggal lambang SIDOTEC.
 *
 * Disimpan sebagai string agar bisa dipakai di tiga tempat sekaligus tanpa
 * duplikasi bentuk: komponen React (sidebar & halaman masuk), berkas
 * `app/icon.svg` (ikon tab browser), dan dokumen cetak yang dibuka di jendela
 * baru (tidak bisa memakai komponen React).
 *
 * Bentuknya sengaja tebal dan hanya terdiri dari beberapa bidang besar supaya
 * masih terbaca saat dirender 16x16 piksel di tab browser.
 */

export const LOGO_VIEWBOX = "0 0 64 64";

/** Isi <svg> untuk versi berwarna (latar gradien + amplop putih). */
export const LOGO_INNER = `
<defs>
  <linearGradient id="sidotecBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#0EA5E9"/>
    <stop offset="1" stop-color="#075985"/>
  </linearGradient>
</defs>
<rect width="64" height="64" rx="15" fill="url(#sidotecBg)"/>
<path d="M12 24.5C12 22.567 13.567 21 15.5 21h33c1.933 0 3.5 1.567 3.5 3.5v22c0 1.933-1.567 3.5-3.5 3.5h-33A3.5 3.5 0 0 1 12 46.5v-22Z" fill="#FFFFFF"/>
<path d="M14 24l18 14 18-14" fill="none" stroke="#0C4A6E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="48" cy="17" r="10" fill="#FFFFFF"/>
<circle cx="48" cy="17" r="8" fill="#059669"/>
<path d="M44 17.2l2.9 2.9L52 15" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
`.trim();

/** Versi satu warna (hitam) untuk kop surat cetak. */
export const LOGO_INNER_CETAK = `
<rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="none" stroke="#000000" stroke-width="3"/>
<path d="M13 25.5C13 23.567 14.567 22 16.5 22h31c1.933 0 3.5 1.567 3.5 3.5v20c0 1.933-1.567 3.5-3.5 3.5h-31A3.5 3.5 0 0 1 13 45.5v-20Z" fill="none" stroke="#000000" stroke-width="3"/>
<path d="M14.5 24.5L32 38l17.5-13.5" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
`.trim();

/** Markup <svg> lengkap. Dipakai untuk dokumen cetak & berkas ikon. */
export function logoSvgMarkup(
  size: number,
  varian: "warna" | "cetak" = "warna",
): string {
  const inner = varian === "warna" ? LOGO_INNER : LOGO_INNER_CETAK;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${LOGO_VIEWBOX}" role="img" aria-label="Logo SIDOTEC">${inner}</svg>`;
}
