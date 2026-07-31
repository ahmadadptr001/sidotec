import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk, assertNoDbError, requireSuperadmin } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { KOLOM_PENGGUNA_PUBLIK, ROLE_PENGGUNA } from "@/lib/tabel";
import { z } from "zod";

const skema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(255),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi").max(150),
  unit: z.string().min(1, "Unit kerja wajib diisi").max(150),
  jabatan: z.string().min(1, "Jabatan wajib diisi").max(150),
  role: z.enum(ROLE_PENGGUNA, { message: "Role tidak valid" }),
});

export async function POST(request: Request) {
  try {
    await requireSuperadmin();

    const parsed = skema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }
    const { email, username, password, ...profil } = parsed.data;

    // Email DAN username keduanya diperiksa (sebelumnya username tidak dicek,
    // padahal login juga menerima username). Dua query .eq() terpisah dipakai
    // agar nilai tidak perlu ditempel ke dalam ekspresi filter.
    const { data: emailTerpakai, error: errorEmail } = await supabase
      .from("pengguna")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    assertNoDbError(errorEmail, "autentikasi.daftar.cekEmail");
    if (emailTerpakai) return apiFail(409, "Email sudah digunakan");

    const { data: usernameTerpakai, error: errorUsername } = await supabase
      .from("pengguna")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    assertNoDbError(errorUsername, "autentikasi.daftar.cekUsername");
    if (usernameTerpakai) return apiFail(409, "Username sudah digunakan");

    const { data, error } = await supabase
      .from("pengguna")
      .insert({
        email,
        username,
        password: await hashPassword(password),
        ...profil,
      })
      .select(KOLOM_PENGGUNA_PUBLIK);

    assertNoDbError(error, "autentikasi.daftar.insert");

    return apiOk(data);
  } catch (err) {
    return apiCatch(err, "autentikasi.daftar");
  }
}
