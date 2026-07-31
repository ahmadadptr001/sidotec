/** Bentuk data yang dipakai bersama antara halaman, service, dan API. */

export interface Surat {
  id: number;
  nomor_agenda: string;
  nomor_surat: string;
  jenis: string;
  asal_surat: string;
  tujuan_surat: string | null;
  ringkasan: string;
  kode_klasifikasi: string;
  indeks_berkas: string;
  tanggal: string;
  keterangan: string | null;
  kategori: string;
  file: string;
  created_at?: string;
}

export interface Disposisi {
  id: number;
  surat_id: string | number;
  tujuan: string;
  sifat: string;
  deadline: string;
  isi: string;
  catatan: string | null;
  created_at?: string;
}

/** Pengguna tanpa kolom sensitif — bentuk yang dikirim `/api/user`. */
export interface PenggunaPublik {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  unit: string | null;
  jabatan: string | null;
  role: string;
  created_at?: string;
}

/** Baris di dalam berkas backup: field apa pun boleh hilang atau berbeda tipe. */
export type BarisBackup = Record<string, unknown>;

export interface BackupData {
  metadata?: {
    system?: string;
    version?: string;
    backup_date?: string;
    description?: string;
    catatan_keamanan?: string;
  };
  tables: {
    pengguna?: BarisBackup[];
    surat?: BarisBackup[];
    disposisi?: BarisBackup[];
    instansi?: BarisBackup[];
  };
  statistics?: {
    total_pengguna: number;
    total_surat: number;
    total_disposisi: number;
    total_instansi: number;
    surat_masuk: number;
    surat_keluar: number;
  };
}
