"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { masuk } from "@/services/user";
import Swal from "sweetalert2";
import LogoSidotec from "@/components/ui/LogoSidotec";
import { pesanError } from "@/lib/error";

/** Hanya menerima path internal, supaya ?lanjut= tidak bisa dipakai open redirect. */
function tujuanSetelahMasuk(): string {
  if (typeof window === "undefined") return "/dashboard";
  const lanjut = new URLSearchParams(window.location.search).get("lanjut");
  if (lanjut && lanjut.startsWith("/") && !lanjut.startsWith("//")) return lanjut;
  return "/dashboard";
}

export default function LoginSidotec() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Pemeriksaan dilakukan SEBELUM setLoading, agar tombol tidak terkunci
    // pada keadaan "Sedang memproses..." tanpa ada permintaan yang berjalan.
    if (!formData.username || !formData.password) {
      Swal.fire({
        title: "Data belum lengkap",
        text: "Isi identitas pengguna dan kata sandi terlebih dahulu.",
        icon: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await masuk(formData);

      await Swal.fire({
        title: "Login Berhasil!",
        text: "Anda akan diarahkan ke halaman dashboard",
        icon: "success",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      router.replace(tujuanSetelahMasuk());
    } catch (err) {
      setLoading(false);
      Swal.fire({
        title: "Login Gagal!",
        text: pesanError(err, "Kredensial tidak valid"),
        icon: "error",
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-sky-600">
      {/* Menggunakan mask pattern batik. 
          Gue pakai pola SVG yang repetitif untuk tekstur khas instansi.
      */}
      <div className="absolute inset-0 opacity-100 ">
        <img
          src="/images/bg.jpg"
          alt="backgorund halaman masuk"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dekorasi Ornamen Samping (Opsional untuk menambah estetika) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      {/* --- LOGIN CARD --- */}
      <div className="relative w-full max-w-180 px-10">
        <div className="bg-white rounded-lg shadow-2xl p-10 md:p-12 border border-slate-300">
          {/* Brand Identity */}
          <div className="flex flex-col items-center mb-10">
            {/* Lambang yang sama dipakai di sidebar, kop surat cetak, dan ikon tab browser. */}
            <LogoSidotec className="w-24 h-24 drop-shadow-sm" />

            <h1 className="text-4xl font-bold mt-4 text-slate-900 tracking-tighter">
              SIDOTEC
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-1 text-center">
              Sistem Informasi Dokumentasi Surat
            </p>
            <div className="h-1 w-12 bg-sky-500 rounded-full mt-3" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Identitas Pengguna
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Masukkan email atau username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium text-sm"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Kata Sandi
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-sky-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? "Sedang memproses..." : "Masuk"}
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase">
              Sistem Informasi Surat Masuk dan Surat Keluar © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
