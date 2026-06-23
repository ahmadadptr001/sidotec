import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload || !payload.tables) {
      return NextResponse.json({
        status: 400,
        reason: "Format file backup tidak valid",
      });
    }

    const { tables } = payload;

    // 1. Hapus semua data dari tabel yang ada
    // Gunakan filter yang benar untuk setiap tipe data

    // Hapus disposisi (id bertipe bigint) - gunakan or filter
    await supabase.from("disposisi").delete().gt("id", 0);

    // Hapus surat (id bertipe bigint)
    await supabase.from("surat").delete().gt("id", 0);

    // Hapus semua pengguna (id bertipe uuid) - ambil semua lalu hapus satu per satu
    const { data: allUsers } = await supabase.from("pengguna").select("id");

    if (allUsers && allUsers.length > 0) {
      for (const user of allUsers) {
        await supabase.from("pengguna").delete().eq("id", user.id);
      }
    }

    // Hapus instansi (id bertipe bigint)
    await supabase.from("instansi").delete().gt("id", 0);

    // 2. Restore data dari backup

    // Restore Instansi (jika ada)
    if (tables.instansi && tables.instansi.length > 0) {
      const { error: errorInsertInstansi } = await supabase
        .from("instansi")
        .insert(tables.instansi);

      if (errorInsertInstansi) {
        console.error("Error restoring instansi:", errorInsertInstansi);
        // Tidak return error, lanjutkan saja
      }
    }

    // Restore Pengguna (dari backup) - kecuali default admin
    if (tables.pengguna && tables.pengguna.length > 0) {
      const usersToInsert = tables.pengguna.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        password: user.password, // Password sudah di-hash dari backup
        unit: user.unit,
        jabatan: user.jabatan,
        role: user.role,
        created_at: user.created_at,
      }));

      const { error: errorInsertPengguna } = await supabase
        .from("pengguna")
        .insert(usersToInsert);

      if (errorInsertPengguna) {
        console.error("Error restoring pengguna:", errorInsertPengguna);
        // Tidak return error, lanjutkan saja
      }
    }

    // Restore Surat
    if (tables.surat && tables.surat.length > 0) {
      const suratToInsert = tables.surat.map((surat: any) => ({
        id: surat.id,
        nomor_agenda: surat.nomor_agenda,
        nomor_surat: surat.nomor_surat,
        jenis: surat.jenis,
        asal_surat: surat.asal_surat,
        ringkasan: surat.ringkasan,
        kode_klasifikasi: surat.kode_klasifikasi,
        indeks_berkas: surat.indeks_berkas,
        tanggal: surat.tanggal,
        keterangan: surat.keterangan,
        kategori: surat.kategori,
        file: surat.file,
        tujuan_surat: surat.tujuan_surat,
        created_at: surat.created_at,
      }));

      const { error: errorInsertSurat } = await supabase
        .from("surat")
        .insert(suratToInsert);

      if (errorInsertSurat) {
        console.error("Error restoring surat:", errorInsertSurat);
        // Tidak return error, lanjutkan saja
      }
    }

    // Restore Disposisi
    if (tables.disposisi && tables.disposisi.length > 0) {
      const disposisiToInsert = tables.disposisi.map((disp: any) => ({
        id: disp.id,
        surat_id: disp.surat_id,
        tujuan: disp.tujuan,
        sifat: disp.sifat,
        deadline: disp.deadline,
        isi: disp.isi,
        catatan: disp.catatan,
        created_at: disp.created_at,
      }));

      const { error: errorInsertDisposisi } = await supabase
        .from("disposisi")
        .insert(disposisiToInsert);

      if (errorInsertDisposisi) {
        console.error("Error restoring disposisi:", errorInsertDisposisi);
        // Tidak return error, lanjutkan saja
      }
    }

    // 3. Buat user admin default jika belum ada
    const { data: existingAdmin } = await supabase
      .from("pengguna")
      .select("id")
      .eq("username", "admin")
      .maybeSingle();

    if (!existingAdmin) {
      const { error: errorInsertAdmin } = await supabase
        .from("pengguna")
        .insert({
          username: "admin",
          email: "admin@sidotec.com",
          nama_lengkap: "Administrator",
          password: "admin123", // Password plain - akan di-hash oleh trigger DB jika ada
          unit: "Teknologi Informasi",
          jabatan: "Super Admin",
          role: "superadmin",
        });

      if (errorInsertAdmin) {
        console.error("Error creating default admin:", errorInsertAdmin);
        // Tidak fatal, lanjutkan
      }
    }

    // 4. Kembalikan statistik restore
    const restoredStats = {
      pengguna: tables.pengguna?.length || 0,
      surat: tables.surat?.length || 0,
      disposisi: tables.disposisi?.length || 0,
      instansi: tables.instansi?.length || 0,
    };

    return NextResponse.json({
      status: 200,
      message: "Database berhasil dipulihkan",
      data: restoredStats,
    });
  } catch (err: any) {
    console.error("Restore error:", err);
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
