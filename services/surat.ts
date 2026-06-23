import axios from "axios";

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
  const response = await axios.get("/api/surat/disposisi/id-surat/" + id);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function ambilDataDisposisiById(id: string) {
  if (!id || id.length === 0) throw new Error("Data tidak lengkap");
  const response = await axios.get("/api/surat/disposisi/" + id);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function ambilDataDisposisi() {
  const response = await axios.get("/api/surat/disposisi");
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function simpanDisposisi(data: disposisiProps, id: string) {
  if (!data || id.length === 0) throw new Error("Data tidak lengkap");
  const response = await axios.post("/api/surat/disposisi/edit?id=" + id, data);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function hapusDataSurat(id: string) {
  if (!id) throw new Error("Harus menyertakan id");
  const response = await axios.get("/api/surat/hapus/" + id);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function hapusDataDisposisi(id: string) {
  if (!id) throw new Error("Harus menyertakan id");
  const response = await axios.delete("/api/surat/disposisi/hapus/" + id);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function ambilDataSuratById(id: string) {
  const response = await axios.get("/api/surat/" + id);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function ambilDataSurat(jenis: string, limit: number = 10) {
  const response = await axios.get(`/api/surat?jenis=${jenis}&limit=${limit}`);
  if (response.data.status !== 200) throw new Error(response.data.reason);

  return response.data;
}

export async function editSurat(payload: suratProps, id_surat: string) {
  if (!payload || id_surat.length === 0) throw new Error("Data tidak lengkap");
  const response = await axios.post("/api/surat/edit?id=" + id_surat, payload);

  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function tambahDisposisi(payload: disposisiProps) {
  if (!payload) throw new Error("Data tidak lengkap");
  const response = await axios.post("/api/surat/disposisi/tambah", payload);
  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function tambahSurat(payload: suratProps) {
  if (!payload) throw new Error("Data tidak lengkap");
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value as any);
  });

  const response = await axios.post("/api/surat/tambah", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}

export async function rentangSurat(
  tanggalAwal: Date,
  tanggalAkhir: Date,
  jenis: string,
) {
  if (!tanggalAkhir || !tanggalAkhir || !jenis)
    throw new Error("Data tidak lengkap");
  const response = await axios.post("/api/surat/rentang", {
    tanggalAwal,
    tanggalAkhir,
    jenis,
  });

  if (response.data.status !== 200) throw new Error(response.data.reason);
  return response.data;
}
