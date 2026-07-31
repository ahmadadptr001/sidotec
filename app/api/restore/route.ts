import { supabase } from "@/config/supabase";
import {
  ApiError,
  apiCatch,
  apiFail,
  apiOk,
  assertNoDbError,
  requireSuperadmin,
} from "@/lib/api";
import { hashPassword, isHashedPassword } from "@/lib/password";
import { FIELD_DISPOSISI, FIELD_INSTANSI, FIELD_SURAT, pilihField } from "@/lib/tabel";
import type { BarisBackup } from "@/lib/tipe";

const PASSWORD_ADMIN_DARURAT = "admin123";

/** Menghapus seluruh baris tabel, apa pun tipe kolom id-nya. */
async function kosongkanTabel(nama: string) {
  const { error } = await supabase.from(nama).delete().not("id", "is", null);
  assertNoDbError(error, `restore.kosongkan.${nama}`);
}

export async function POST(request: Request) {
  try {
    await requireSuperadmin();

    const payload = await request.json();
    const tables = payload?.tables;

    if (!tables || typeof tables !== "object") {
      return apiFail(400, "Format file backup tidak valid");
    }

    for (const nama of ["pengguna", "surat", "disposisi", "instansi"]) {
      if (tables[nama] !== undefined && !Array.isArray(tables[nama])) {
        return apiFail(400, `Bagian "${nama}" pada file backup tidak valid`);
      }
    }

    const penggunaBackup: BarisBackup[] = tables.pengguna ?? [];
    const suratBackup: BarisBackup[] = tables.surat ?? [];
    const disposisiBackup: BarisBackup[] = tables.disposisi ?? [];
    const instansiBackup: BarisBackup[] = tables.instansi ?? [];

    // 1. Kosongkan data lama. Urutan disposisi → surat menjaga relasi.
    await kosongkanTabel("disposisi");
    await kosongkanTabel("surat");
    await kosongkanTabel("instansi");
    await kosongkanTabel("pengguna");

    // 2. Instansi — `id` dibiarkan dibuat ulang oleh database.
    if (instansiBackup.length > 0) {
      const { error } = await supabase
        .from("instansi")
        .insert(instansiBackup.map((row) => pilihField(row, FIELD_INSTANSI)));
      assertNoDbError(error, "restore.instansi");
    }

    // 3. Pengguna — id bertipe uuid (tanpa sequence) sehingga aman dipertahankan.
    //    Password yang masih plaintext dari backup lama langsung di-hash.
    if (penggunaBackup.length > 0) {
      const rows = [];
      for (const user of penggunaBackup) {
        const passwordAsal =
          typeof user.password === "string" ? user.password : null;
        const password = passwordAsal
          ? isHashedPassword(passwordAsal)
            ? passwordAsal
            : await hashPassword(passwordAsal)
          : await hashPassword(PASSWORD_ADMIN_DARURAT);

        rows.push({
          id: user.id,
          username: user.username,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          password,
          unit: user.unit ?? null,
          jabatan: user.jabatan ?? null,
          role: user.role ?? "staff",
          created_at: user.created_at,
        });
      }

      const { error } = await supabase.from("pengguna").insert(rows);
      assertNoDbError(error, "restore.pengguna");
    }

    // 4. Surat — `id` LAMA TIDAK dipakai lagi. Menyisipkan id eksplisit ke kolom
    //    identity membuat sequence tertinggal, sehingga penambahan surat setelah
    //    restore gagal dengan duplicate key. Id baru dari database dipetakan ke
    //    id lama supaya relasi disposisi tetap benar.
    const petaIdSurat = new Map<string, number | string>();
    if (suratBackup.length > 0) {
      const rows = suratBackup.map((row) => pilihField(row, FIELD_SURAT));
      const { data, error } = await supabase
        .from("surat")
        .insert(rows)
        .select("id");
      assertNoDbError(error, "restore.surat");

      if (!data || data.length !== suratBackup.length) {
        throw new ApiError(
          500,
          "Jumlah surat yang tersimpan tidak sesuai dengan file backup",
        );
      }
      suratBackup.forEach((row, index) => {
        petaIdSurat.set(String(row.id), data[index].id);
      });
    }

    // 5. Disposisi — surat_id ditulis ulang memakai id surat yang baru.
    let disposisiDilewati = 0;
    if (disposisiBackup.length > 0) {
      const rows: Record<string, unknown>[] = [];
      for (const row of disposisiBackup) {
        const suratIdBaru = petaIdSurat.get(String(row.surat_id));
        if (suratIdBaru === undefined) {
          // Disposisi yang suratnya tidak ada di backup dilewati, bukan
          // dimasukkan sebagai baris yatim.
          disposisiDilewati += 1;
          continue;
        }
        rows.push({ ...pilihField(row, FIELD_DISPOSISI), surat_id: suratIdBaru });
      }

      if (rows.length > 0) {
        const { error } = await supabase.from("disposisi").insert(rows);
        assertNoDbError(error, "restore.disposisi");
      }
    }

    // 6. Jaring pengaman: bila backup tidak memuat satu pun pengguna, buat akun
    //    darurat agar sistem tidak terkunci total.
    let adminDaruratDibuat = false;
    if (penggunaBackup.length === 0) {
      const { error } = await supabase.from("pengguna").insert({
        username: "admin",
        email: "admin@sidotec.com",
        nama_lengkap: "Administrator",
        password: await hashPassword(PASSWORD_ADMIN_DARURAT),
        unit: "Teknologi Informasi",
        jabatan: "Super Admin",
        role: "superadmin",
      });
      assertNoDbError(error, "restore.adminDarurat");
      adminDaruratDibuat = true;
    }

    return apiOk(
      {
        pengguna: penggunaBackup.length,
        surat: suratBackup.length,
        disposisi: disposisiBackup.length - disposisiDilewati,
        instansi: instansiBackup.length,
        disposisi_dilewati: disposisiDilewati,
        admin_darurat_dibuat: adminDaruratDibuat,
      },
      { message: "Database berhasil dipulihkan" },
    );
  } catch (err) {
    return apiCatch(err, "restore");
  }
}
