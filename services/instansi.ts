import axios from "axios";

interface dataProps {
  nama_instansi: string;
  status: string;
  alamat: string;
  website: string;
  email: string;
  nomor_telpon: string;
  akreditasi: string;
}

export async function ambilDataInstansi() {
  const response = await axios.get("/api/instansi");
  if (response.data.status !== 200) throw new Error(response.data.reason);

  return response.data;
}

export async function simpanDataInstansi(id: string, data: dataProps) {
  const response = await axios.post("/api/instansi/simpan?id=" + id, data);
  if (response.data.status !== 200) throw new Error(response.data.reason);

  return response.data;
}
