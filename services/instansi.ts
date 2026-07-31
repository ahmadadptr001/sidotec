import { http } from "@/services/http";

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
  const response = await http.get("/api/instansi");
  return response.data;
}

/**
 * @param id Boleh null/undefined ketika data instansi belum pernah dibuat;
 *           server akan melakukan insert dan mengembalikan baris beserta id-nya.
 */
export async function simpanDataInstansi(
  id: string | number | null | undefined,
  data: dataProps,
) {
  const query = id === null || id === undefined || id === "" ? "" : `?id=${id}`;
  const response = await http.post(`/api/instansi/simpan${query}`, data);
  return response.data;
}
