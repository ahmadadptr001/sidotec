"use client";

import { useState } from "react";
import { z } from "zod";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  Building2,
  Briefcase,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";
import { daftarAkun } from "@/services/user";
import { pesanError } from "@/lib/error";

// 1. Definisikan Schema Zod
const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  unit: z.string().min(1, "Unit kerja wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  role: z.enum(["staff", "pimpinan", "admin", "superadmin"], {
    message: "Role tidak valid",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ModernFormPendaftaran() {
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    nama_lengkap: "",
    unit: "",
    jabatan: "",
    role: "staff",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error saat user mulai mengetik ulang
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi dijalankan lebih dulu; dialog loading baru dibuka setelah data
    // dinyatakan sah, agar tidak sempat berkedip saat form masih salah.
    const result = formSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormData;
        if (path) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await daftarAkun(result.data);
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Akun berhasil dibuat!",
        text: "Berhasil menambahkan akun baru @" + result.data.username,
      });

      // Form dikosongkan agar akun berikutnya tidak terkirim dengan data yang sama.
      setFormData({
        email: "",
        username: "",
        password: "",
        nama_lengkap: "",
        unit: "",
        jabatan: "",
        role: "staff",
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        title: "Gagal membuat akun!",
        text: pesanError(err),
        icon: "error",
      });
    }
  };

  return (
    <div className="">
      {/* Header Halaman */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-lg text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            Tambah Akun Pengguna
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manajemen otentikasi dan hak akses personil SIDOTEC
          </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-8">
          {/* Grid Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kiri: Identitas Login */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-sky-700 pb-2 border-b border-sky-100 uppercase tracking-wider">
                Kredensial Login
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Alamat Email Resmi
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@instansi.go.id"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-sky-600 focus:ring-sky-500/5"} rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[11px]">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nama singkat Anda"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.username ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-sky-600 focus:ring-sky-500/5"} rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-[11px]">{errors.username}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Kata Sandi
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 border ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-sky-600 focus:ring-sky-500/5"} rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[11px]">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Kanan: Profil & Jabatan */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-sky-700 pb-2 border-b border-sky-100 uppercase tracking-wider">
                Profil Instansi
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  placeholder="Input nama lengkap sesuai SK"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.nama_lengkap ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-sky-600 focus:ring-sky-500/5"} rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                />
                {errors.nama_lengkap && (
                  <p className="text-red-500 text-[11px]">
                    {errors.nama_lengkap}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 text-nowrap">
                    Unit Kerja
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="Unit"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.unit ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-sky-600"} rounded-xl outline-none focus:bg-white text-sm`}
                    />
                  </div>
                  {errors.unit && (
                    <p className="text-red-500 text-[11px]">{errors.unit}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 text-nowrap">
                    Jabatan
                  </label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      placeholder="Jabatan"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.jabatan ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-sky-600"} rounded-xl outline-none focus:bg-white text-sm`}
                    />
                  </div>
                  {errors.jabatan && (
                    <p className="text-red-500 text-[11px]">{errors.jabatan}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Hak Akses Sistem (Role)
                </label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-600 transition-all text-sm font-normal appearance-none cursor-pointer"
                  >
                    <option value="staff">Staff Operasional</option>
                    <option value="pimpinan">Pimpinan / Pejabat</option>
                    <option value="admin">Administrator</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-[11px]">{errors.role}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-slate-400 italic">
            * Seluruh perubahan data akan tercatat dalam log aktivitas sistem.
          </p>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Buat Akun
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
