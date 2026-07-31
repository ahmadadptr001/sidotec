import { supabase } from "@/config/supabase";
import {
  apiCatch,
  apiFail,
  apiOk,
  assertNoDbError,
  requireSuperadmin,
} from "@/lib/api";
import {
  AUTH_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  toSessionUser,
} from "@/lib/session";
import { KOLOM_PENGGUNA_PUBLIK, ROLE_PENGGUNA } from "@/lib/tabel";
import { z } from "zod";

const skema = z.object({
  id: z.string().min(1, "ID pengguna wajib disertakan"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi").max(150),
  unit: z.string().max(150).nullable().optional(),
  jabatan: z.string().max(150).nullable().optional(),
  role: z.enum(ROLE_PENGGUNA, { message: "Role tidak valid" }),
});

export async function POST(request: Request) {
  try {
    const pelaku = await requireSuperadmin();

    const parsed = skema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }

    // Hanya field profil yang boleh berubah. `password` sengaja tidak termasuk
    // agar payload dari client tidak bisa menimpa kredensial.
    const { id, ...perubahan } = parsed.data;

    const { data, error } = await supabase
      .from("pengguna")
      .update(perubahan)
      .eq("id", id)
      .select(KOLOM_PENGGUNA_PUBLIK);

    assertNoDbError(error, "user.perbarui");

    if (!data || data.length === 0) {
      return apiFail(404, "Pengguna tidak ditemukan");
    }

    const response = apiOk(data);

    // Bila superadmin mengubah datanya sendiri, cookie sesi harus disegarkan —
    // kalau tidak, nama/role di sidebar tetap memakai data lama.
    if (String(pelaku.id) === String(id)) {
      const sessionUser = toSessionUser(data[0]);
      response.cookies.set(AUTH_COOKIE, await createSessionToken(sessionUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (err) {
    return apiCatch(err, "user.perbarui");
  }
}
