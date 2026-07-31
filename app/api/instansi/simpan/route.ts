import { supabase } from "@/config/supabase";
import {
  apiCatch,
  apiFail,
  apiOk,
  assertNoDbError,
  requireSuperadmin,
} from "@/lib/api";
import { z } from "zod";

const skema = z.object({
  nama_instansi: z.string().min(3, "Nama instansi minimal 3 karakter").max(200),
  status: z.enum(["Negeri", "Swasta", "Kedinasan"], {
    message: "Pilih status instansi yang valid",
  }),
  alamat: z.string().min(10, "Alamat terlalu pendek, mohon lengkapi").max(500),
  website: z.string().url("Format URL tidak valid"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  nomor_telpon: z.string().min(6, "Nomor telepon tidak valid").max(30),
  akreditasi: z.enum(
    ["Unggul", "A", "Baik Sekali", "B", "Baik", "C", "Belum Terakreditasi"],
    { message: "Pilih status akreditasi yang valid" },
  ),
});

export async function POST(request: Request) {
  try {
    await requireSuperadmin();

    const parsed = skema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }
    const payload = parsed.data;

    // Baris instansi ditentukan dari database, bukan dari query string. Dulu id
    // diambil dari `?id=` yang bisa berisi "undefined" saat tabel masih kosong,
    // sehingga penyimpanan kedua selalu gagal.
    const { data: existing, error: errorCheck } = await supabase
      .from("instansi")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    assertNoDbError(errorCheck, "instansi.simpan.cek");

    const query = existing
      ? supabase.from("instansi").update(payload).eq("id", existing.id)
      : supabase.from("instansi").insert(payload);

    const { data, error } = await query.select();
    assertNoDbError(error, "instansi.simpan");

    // Dikembalikan lengkap dengan id supaya client bisa menyegarkan state-nya.
    return apiOk(data ?? []);
  } catch (err) {
    return apiCatch(err, "instansi.simpan");
  }
}
