import { http } from "@/services/http";
import type { SessionUser } from "@/lib/session";

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

export interface PerbaruiUserPayload {
  id: string;
  email: string;
  nama_lengkap: string;
  username: string;
  unit: string;
  jabatan: string;
  role: string;
}

export async function masuk(data: masukProps) {
  const response = await http.post("/api/autentikasi/masuk", data);
  return response.data;
}

export async function session(): Promise<{
  isLogin: boolean;
  user: SessionUser | null;
}> {
  const response = await http.get("/api/autentikasi/session");
  return response.data;
}

export async function removeSession() {
  // POST: logout mengubah state, jadi tidak boleh lewat GET.
  const response = await http.post("/api/autentikasi/removeSession");
  return response.data;
}

export async function daftarAkun(payload: daftarProps) {
  if (!payload) throw new Error("Data tidak lengkap!");
  const response = await http.post("/api/autentikasi/daftar", payload);
  return response.data;
}

export async function ambildataUser() {
  const response = await http.get("/api/user");
  return response.data;
}

/**
 * Hanya mengembalikan jumlah pengguna. Dipakai kartu statistik dashboard supaya
 * seluruh direktori pengguna tidak perlu dikirim ke role non-superadmin.
 */
export async function jumlahPengguna(): Promise<number> {
  const response = await http.get("/api/user/jumlah");
  return response.data?.data?.total ?? 0;
}

export async function hapusDataUser(id: string) {
  if (!id) throw new Error("Data tidak lengkap");
  const response = await http.delete("/api/autentikasi/hapus/" + id);
  return response.data;
}

export async function perbaruiDataUser(data: PerbaruiUserPayload) {
  if (!data?.id) throw new Error("Data tidak lengkap");
  const response = await http.post("/api/user/perbarui", data);
  return response.data;
}
