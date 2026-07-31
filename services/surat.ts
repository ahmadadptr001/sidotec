import { formatTanggalLokal } from "@/lib/format";
import { http } from "@/services/http";

interface suratProps {
  nomor_agenda: string;
  nomor_surat: string;
  jenis?: string;
  asal_surat: string;
  ringkasan: string;
  kode_klasifikasi: string;
  indeks_berkas: string;
  tanggal: string;
  keterangan?: string | undefined | null;
  tujuan_surat?: string | undefined | null;
  kategori: string;
  file: File | string;
}

interface disposisiProps {
  surat_id: string;
  tujuan: string;
  sifat: string;
  deadline: string;
  isi: string;
  catatan?: string;
}

export async function ambilDataDisposisiByIdSurat(id: string) {
  if (!id || id.length === 0) throw new Error("Data tidak lengkap");
  const response = await http.get("/api/surat/disposisi/id-surat/" + id);
  return response.data;
}

export async function ambilDataDisposisiById(id: string) {
  if (!id || id.length === 0) throw new Error("Data tidak lengkap");
  const response = await http.get("/api/surat/disposisi/" + id);
  return response.data;
}

export async function ambilDataDisposisi() {
  const response = await http.get("/api/surat/disposisi");
  return response.data;
}

export async function simpanDisposisi(data: disposisiProps, id: string) {
  if (!data || !id || id.length === 0) throw new Error("Data tidak lengkap");
  const response = await http.post("/api/surat/disposisi/edit?id=" + id, data);
  return response.data;
}

export async function hapusDataSurat(id: string) {
  if (!id) throw new Error("Harus menyertakan id");
  // DELETE, bukan GET: penghapusan tidak boleh terjadi hanya karena URL dibuka.
  const response = await http.delete("/api/surat/hapus/" + id);
  return response.data;
}

export async function hapusDataDisposisi(id: string) {
  if (!id) throw new Error("Harus menyertakan id");
  const response = await http.delete("/api/surat/disposisi/hapus/" + id);
  return response.data;
}

export async function ambilDataSuratById(id: string) {
  if (!id) throw new Error("Harus menyertakan id");
  const response = await http.get("/api/surat/" + id);
  return response.data;
}

/**
 * @param limit Batas jumlah data. Biarkan kosong untuk mengambil seluruh surat
 *              (dipakai halaman daftar agar pencarian & paginasi bekerja atas
 *              semua arsip, bukan hanya sebagian).
 */
export async function ambilDataSurat(jenis: string, limit?: number) {
  const params = new URLSearchParams({ jenis });
  if (typeof limit === "number") params.set("limit", String(limit));

  const response = await http.get(`/api/surat?${params.toString()}`);
  return response.data;
}

export async function editSurat(
  payload: Partial<suratProps>,
  id_surat: string,
  file?: File | null,
) {
  if (!payload || !id_surat || id_surat.length === 0)
    throw new Error("Data tidak lengkap");

  // Lampiran hanya dikirim bila pengguna memilih file baru.
  if (file) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    formData.append("file", file);

    const response = await http.post(
      "/api/surat/edit?id=" + id_surat,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  }

  const response = await http.post("/api/surat/edit?id=" + id_surat, payload);
  return response.data;
}

export async function tambahDisposisi(payload: disposisiProps) {
  if (!payload) throw new Error("Data tidak lengkap");
  const response = await http.post("/api/surat/disposisi/tambah", payload);
  return response.data;
}

export async function tambahSurat(payload: suratProps) {
  if (!payload) throw new Error("Data tidak lengkap");
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await http.post("/api/surat/tambah", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * @param tanggalAwal  Tanggal awal (inklusif), memakai tanggal surat.
 * @param tanggalAkhir Tanggal akhir (inklusif).
 */
export async function rentangSurat(
  tanggalAwal: Date,
  tanggalAkhir: Date,
  jenis: string,
) {
  if (!tanggalAwal || !tanggalAkhir || !jenis)
    throw new Error("Data tidak lengkap");

  const response = await http.post("/api/surat/rentang", {
    tanggalAwal: formatTanggalLokal(tanggalAwal),
    tanggalAkhir: formatTanggalLokal(tanggalAkhir),
    jenis,
  });

  return response.data;
}
