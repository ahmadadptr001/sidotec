import { formatTanggalIndonesia, formatTanggalSingkat, tebakKota } from "@/lib/format";
import { logoSvgMarkup } from "@/lib/logo";

export interface InstansiCetak {
  nama_instansi?: string | null;
  status?: string | null;
  alamat?: string | null;
  email?: string | null;
  website?: string | null;
  nomor_telpon?: string | null;
  akreditasi?: string | null;
}

export interface PetugasCetak {
  nama_lengkap?: string | null;
  jabatan?: string | null;
}

export interface SuratCetak {
  id: number | string;
  nomor_agenda?: string | null;
  nomor_surat?: string | null;
  jenis?: string | null;
  asal_surat?: string | null;
  tujuan_surat?: string | null;
  ringkasan?: string | null;
  kode_klasifikasi?: string | null;
  indeks_berkas?: string | null;
  tanggal?: string | null;
  keterangan?: string | null;
  kategori?: string | null;
  file?: string | null;
}

/**
 * Semua nilai dari database WAJIB melewati fungsi ini sebelum ditempel ke HTML
 * cetak. Sebelumnya isi ringkasan ditulis mentah ke `document.write`, sehingga
 * tanda `<` merusak hasil cetak dan markup dari data bisa ikut dieksekusi.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function teksAtauGaris(value: unknown): string {
  const teks = escapeHtml(value).trim();
  return teks.length > 0 ? teks : "&nbsp;";
}

/** Tata letak dokumen resmi: A4, Times New Roman, margin ala surat dinas. */
const CSS_CETAK = `
  @page { size: A4 portrait; margin: 1.5cm 2cm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.45;
    color: #000;
    background: #fff;
  }
  .lembar { page-break-after: always; }
  .lembar:last-child { page-break-after: auto; }

  /* --- KOP SURAT --- */
  .kop { display: flex; align-items: center; gap: 14px; }
  .kop-logo { width: 74px; flex-shrink: 0; }
  .kop-logo svg { width: 100%; height: auto; display: block; }
  .kop-teks { flex: 1; text-align: center; }
  .kop-instansi {
    margin: 0;
    font-size: 17pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: .4px;
    line-height: 1.15;
  }
  .kop-status { margin: 1px 0 0; font-size: 11pt; text-transform: uppercase; letter-spacing: .3px; }
  .kop-alamat { margin: 2px 0 0; font-size: 9.5pt; line-height: 1.3; }
  .kop-kontak { margin: 1px 0 0; font-size: 9.5pt; }
  /* Garis ganda tebal-tipis, ciri khas kop surat dinas Indonesia. */
  .garis-kop { border-top: 3px solid #000; border-bottom: 1px solid #000; height: 3px; margin: 7px 0 0; }

  /* --- JUDUL --- */
  .judul-blok { text-align: center; margin: 20px 0 4px; }
  .judul {
    margin: 0;
    font-size: 13.5pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .sub-judul { margin: 4px 0 0; font-size: 11pt; }

  /* --- TABEL RINCIAN --- */
  table { width: 100%; border-collapse: collapse; }
  table.rincian { margin-top: 16px; }
  table.rincian th, table.rincian td {
    border: 1px solid #000;
    padding: 6px 9px;
    font-size: 11pt;
    vertical-align: top;
    text-align: left;
  }
  table.rincian th { width: 30%; font-weight: normal; background: #f2f2f2; }
  table.rincian td.isi-utama { font-weight: bold; }

  /* --- TABEL AGENDA (rekap) --- */
  table.agenda { margin-top: 14px; }
  table.agenda th, table.agenda td {
    border: 1px solid #000;
    padding: 5px 7px;
    font-size: 10pt;
    vertical-align: top;
  }
  table.agenda thead th {
    background: #e8e8e8;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 9pt;
  }
  table.agenda thead { display: table-header-group; }
  table.agenda tr { page-break-inside: avoid; }
  table.agenda td.tengah { text-align: center; }
  .periode { margin: 10px 0 0; font-size: 11pt; text-align: center; }

  /* --- TANDA TANGAN --- */
  .ttd-area { display: flex; justify-content: flex-end; margin-top: 30px; page-break-inside: avoid; }
  .ttd-kotak { width: 7.5cm; font-size: 11pt; }
  .ttd-tempat { margin: 0 0 2px; }
  .ttd-jabatan { margin: 0; }
  .ttd-ruang { height: 2.1cm; }
  .ttd-nama { margin: 0; font-weight: bold; text-decoration: underline; }
  .ttd-nip { margin: 1px 0 0; font-size: 10pt; }

  .catatan-kaki {
    margin-top: 22px;
    padding-top: 5px;
    border-top: 1px solid #999;
    font-size: 8.5pt;
    font-style: italic;
    color: #333;
  }

  @media screen {
    body { background: #eef2f7; padding: 24px; }
    .lembar {
      background: #fff;
      max-width: 21cm;
      margin: 0 auto 24px;
      padding: 1.5cm 2cm;
      box-shadow: 0 6px 24px rgba(15, 23, 42, .18);
    }
  }
`;

function kopSuratHtml(instansi: InstansiCetak | null | undefined): string {
  const nama = instansi?.nama_instansi?.trim() || "NAMA INSTANSI BELUM DIISI";
  const baris: string[] = [];

  if (instansi?.status || instansi?.akreditasi) {
    const bagian = [
      instansi?.status ? escapeHtml(instansi.status) : null,
      instansi?.akreditasi ? `Akreditasi ${escapeHtml(instansi.akreditasi)}` : null,
    ].filter(Boolean);
    baris.push(`<p class="kop-status">${bagian.join(" &middot; ")}</p>`);
  }
  if (instansi?.alamat) {
    baris.push(`<p class="kop-alamat">${escapeHtml(instansi.alamat)}</p>`);
  }

  const kontak = [
    instansi?.nomor_telpon ? `Telp. ${escapeHtml(instansi.nomor_telpon)}` : null,
    instansi?.email ? `Email: ${escapeHtml(instansi.email)}` : null,
    instansi?.website ? escapeHtml(instansi.website) : null,
  ].filter(Boolean);
  if (kontak.length > 0) {
    baris.push(`<p class="kop-kontak">${kontak.join(" &middot; ")}</p>`);
  }

  return `
    <div class="kop">
      <div class="kop-logo">${logoSvgMarkup(74, "cetak")}</div>
      <div class="kop-teks">
        <h1 class="kop-instansi">${escapeHtml(nama)}</h1>
        ${baris.join("\n        ")}
      </div>
    </div>
    <div class="garis-kop"></div>
  `;
}

function blokTandaTanganHtml(
  instansi: InstansiCetak | null | undefined,
  petugas: PetugasCetak | null | undefined,
): string {
  const kota = tebakKota(instansi?.alamat);
  const tanggal = formatTanggalIndonesia(new Date());
  const tempatTanggal = kota ? `${escapeHtml(kota)}, ${tanggal}` : tanggal;
  const jabatan = petugas?.jabatan?.trim() || "Petugas Arsip";
  const nama = petugas?.nama_lengkap?.trim();

  return `
    <div class="ttd-area">
      <div class="ttd-kotak">
        <p class="ttd-tempat">${tempatTanggal}</p>
        <p class="ttd-jabatan">${escapeHtml(jabatan)},</p>
        <div class="ttd-ruang"></div>
        <p class="ttd-nama">${nama ? escapeHtml(nama) : "..............................."}</p>
        <p class="ttd-nip">NIP. ...............................</p>
      </div>
    </div>
  `;
}

function catatanKakiHtml(): string {
  const waktu = new Date();
  const jam = `${String(waktu.getHours()).padStart(2, "0")}.${String(waktu.getMinutes()).padStart(2, "0")}`;
  return `<p class="catatan-kaki">Dokumen ini dicetak dari SIDOTEC &mdash; Sistem Informasi Dokumentasi Surat Masuk dan Surat Keluar, pada ${formatTanggalIndonesia(waktu)} pukul ${jam} WITA.</p>`;
}

/**
 * Lembar pengantar untuk satu surat, mengikuti bentuk lembar disposisi/kartu
 * kendali yang lazim dipakai instansi di Indonesia.
 */
export function htmlLembarSurat(
  surat: SuratCetak,
  instansi: InstansiCetak | null | undefined,
  petugas: PetugasCetak | null | undefined,
): string {
  const keluar = String(surat.jenis).toLowerCase() === "keluar";
  const judul = keluar
    ? "Lembar Pengantar Surat Keluar"
    : "Lembar Pengantar Surat Masuk";
  const labelPihak = keluar ? "Tujuan Surat" : "Asal Surat";
  const nilaiPihak = keluar ? surat.tujuan_surat : surat.asal_surat;

  return `
    <div class="lembar">
      ${kopSuratHtml(instansi)}

      <div class="judul-blok">
        <h2 class="judul">${escapeHtml(judul)}</h2>
        <p class="sub-judul">Nomor Agenda: ${teksAtauGaris(surat.nomor_agenda)}</p>
      </div>

      <table class="rincian">
        <tbody>
          <tr><th>Indeks Berkas</th><td>${teksAtauGaris(surat.indeks_berkas)}</td></tr>
          <tr><th>Kode Klasifikasi</th><td>${teksAtauGaris(surat.kode_klasifikasi)}</td></tr>
          <tr><th>Nomor Surat</th><td>${teksAtauGaris(surat.nomor_surat)}</td></tr>
          <tr><th>Tanggal Surat</th><td>${escapeHtml(formatTanggalIndonesia(surat.tanggal))}</td></tr>
          <tr><th>${escapeHtml(labelPihak)}</th><td>${teksAtauGaris(nilaiPihak)}</td></tr>
          <tr><th>Kategori</th><td>${teksAtauGaris(surat.kategori)}</td></tr>
          <tr><th>Isi Ringkas / Perihal</th><td class="isi-utama">${teksAtauGaris(surat.ringkasan)}</td></tr>
          <tr><th>Keterangan</th><td>${teksAtauGaris(surat.keterangan)}</td></tr>
          <tr><th>${keluar ? "Tanggal Dikirim" : "Tanggal Diterima"}</th><td>${escapeHtml(formatTanggalIndonesia(surat.tanggal))}</td></tr>
        </tbody>
      </table>

      ${blokTandaTanganHtml(instansi, petugas)}
      ${catatanKakiHtml()}
    </div>
  `;
}

/** Rekap buku agenda untuk satu rentang tanggal. */
export function htmlBukuAgenda(
  daftar: SuratCetak[],
  instansi: InstansiCetak | null | undefined,
  petugas: PetugasCetak | null | undefined,
  jenis: "masuk" | "keluar",
  rentang: { dari: Date; sampai: Date },
): string {
  const keluar = jenis === "keluar";
  const labelPihak = keluar ? "Tujuan Surat" : "Asal Surat";

  const baris = daftar
    .map((surat, index) => {
      const pihak = keluar ? surat.tujuan_surat : surat.asal_surat;
      return `
        <tr>
          <td class="tengah">${index + 1}</td>
          <td class="tengah">${teksAtauGaris(surat.nomor_agenda)}</td>
          <td>${teksAtauGaris(surat.nomor_surat)}</td>
          <td class="tengah">${escapeHtml(formatTanggalSingkat(surat.tanggal))}</td>
          <td>${teksAtauGaris(pihak)}</td>
          <td>${teksAtauGaris(surat.ringkasan)}</td>
          <td class="tengah">${teksAtauGaris(surat.kode_klasifikasi)}</td>
          <td>${teksAtauGaris(surat.keterangan)}</td>
        </tr>
      `;
    })
    .join("");

  const isiTabel =
    baris ||
    `<tr><td class="tengah" colspan="8">Tidak ada data pada rentang tanggal ini.</td></tr>`;

  return `
    <div class="lembar">
      ${kopSuratHtml(instansi)}

      <div class="judul-blok">
        <h2 class="judul">Buku Agenda Surat ${keluar ? "Keluar" : "Masuk"}</h2>
        <p class="periode">
          Periode ${escapeHtml(formatTanggalIndonesia(rentang.dari))}
          s.d. ${escapeHtml(formatTanggalIndonesia(rentang.sampai))}
          &mdash; ${daftar.length} surat
        </p>
      </div>

      <table class="agenda">
        <thead>
          <tr>
            <th style="width:4%">No</th>
            <th style="width:7%">No. Agenda</th>
            <th style="width:15%">Nomor Surat</th>
            <th style="width:9%">Tanggal</th>
            <th style="width:17%">${escapeHtml(labelPihak)}</th>
            <th style="width:26%">Isi Ringkas</th>
            <th style="width:8%">Kode</th>
            <th style="width:14%">Keterangan</th>
          </tr>
        </thead>
        <tbody>${isiTabel}</tbody>
      </table>

      ${blokTandaTanganHtml(instansi, petugas)}
      ${catatanKakiHtml()}
    </div>
  `;
}

/**
 * Membuka jendela cetak berisi dokumen lengkap.
 * Memakai document.write pada jendela baru (bukan iframe) agar pratinjau bisa
 * dibaca pengguna sebelum benar-benar dicetak.
 */
export function bukaJendelaCetak(judul: string, isi: string): boolean {
  const jendela = window.open("", "_blank", "width=920,height=1000");
  if (!jendela) return false;

  jendela.document.write(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(judul)}</title>
<style>${CSS_CETAK}</style>
</head>
<body>
${isi}
<script>
  window.addEventListener('load', function () {
    window.focus();
    window.print();
  });
</script>
</body>
</html>`);
  jendela.document.close();
  return true;
}
