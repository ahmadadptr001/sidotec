import axios from "axios";

interface masukProps {
  username: string;
  password: string;
}

interface daftarProps {
  email: string;
  password: string;
  nama_lengkap: string;
  username: string;
  unit: string;
  jabatan: string;
  role: string;
}

export async function masuk(data: masukProps) {
  const response = await axios.post("/api/autentikasi/masuk", data);
  return response.data;
}

export async function session() {
  const response = await axios.get("/api/autentikasi/session");
  return response.data;
}

export async function removeSession() {
  const response = await axios.get("/api/autentikasi/removeSession");
  return response.data;
}

export async function daftarAkun(payload: daftarProps) {
  if (!payload) throw new Error("Data tidak lengkap!");
  const response = await axios.post("/api/autentikasi/daftar", payload);

  if (response.data?.status !== 200) throw new Error(response.data?.reason);
  return response.data;
}
export async function ambildataUser() {
  const response = await axios.get("/api/user");
  if (response.data?.status !== 200) throw new Error(response.data?.reason);
  return response.data;
}

export async function hapusDataUser(id: string) {
  if (!id) throw new Error("Data tidak lengkap");
  const response = await axios.get("/api/autentikasi/hapus/" + id);
  if (response.data?.status !== 200) throw new Error(response.data?.reason);
  return response.data;
}

export async function perbaruiDataUser(data: daftarProps) {
  if (!data) throw new Error("Data tidak lengkap");
  const response = await axios.post("/api/user/perbarui", data);
  if (response.data?.status !== 200) throw new Error(response.data?.reason);

  return response.data;
}
