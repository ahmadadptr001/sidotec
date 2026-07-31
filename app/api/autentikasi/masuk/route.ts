import { supabase } from "@/config/supabase";
import { apiCatch, apiFail, apiOk } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  AUTH_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  toSessionUser,
} from "@/lib/session";
import { KOLOM_PENGGUNA_PUBLIK } from "@/lib/tabel";
import type { PenggunaPublik } from "@/lib/tipe";
import { z } from "zod";

const skema = z.object({
  username: z.string().min(1, "Username atau email wajib diisi").max(255),
  password: z.string().min(1, "Kata sandi wajib diisi").max(255),
});

export async function POST(request: Request) {
  try {
    const parsed = skema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFail(400, parsed.error.issues[0]?.message ?? "Data tidak lengkap");
    }
    const { username, password } = parsed.data;

    // Dua query terpisah dengan .eq() — nilai dikirim sebagai parameter, bukan
    // ditempel ke dalam ekspresi filter, sehingga tidak bisa dipakai untuk
    // menyuntik kondisi tambahan.
    const kolom = `${KOLOM_PENGGUNA_PUBLIK}, password`;

    let { data: pengguna, error } = await supabase
      .from("pengguna")
      .select(kolom)
      .eq("username", username)
      .maybeSingle();

    if (!error && !pengguna) {
      ({ data: pengguna, error } = await supabase
        .from("pengguna")
        .select(kolom)
        .eq("email", username)
        .maybeSingle());
    }

    if (error) {
      console.error("[autentikasi.masuk]", error);
      return apiFail(500, "Terjadi kesalahan pada server");
    }

    // Pesan yang sama untuk user tidak ada maupun password salah, agar tidak
    // bisa dipakai menebak username yang terdaftar.
    const pesanGagal = "Username atau kata sandi salah";
    if (!pengguna) return apiFail(401, pesanGagal);

    const row = pengguna as unknown as PenggunaPublik & { password: string };
    const { ok, needsUpgrade } = await verifyPassword(password, row.password);
    if (!ok) return apiFail(401, pesanGagal);

    // Password lama yang masih plaintext langsung di-hash begitu login berhasil.
    if (needsUpgrade) {
      const { error: errorUpgrade } = await supabase
        .from("pengguna")
        .update({ password: await hashPassword(password) })
        .eq("id", row.id);
      if (errorUpgrade) {
        console.error("[autentikasi.masuk.upgradeHash]", errorUpgrade);
      }
    }

    const sessionUser = toSessionUser(row);
    const response = apiOk(sessionUser);

    response.cookies.set(AUTH_COOKIE, await createSessionToken(sessionUser), {
      httpOnly: true,
      // Aktif otomatis di produksi (HTTPS), tetap nonaktif saat `next dev`.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err) {
    return apiCatch(err, "autentikasi.masuk");
  }
}
