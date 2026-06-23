"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { masuk } from "@/services/user";
import Swal from "sweetalert2";

export default function LoginSidotec() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.username || !formData.password) return;

    try {
      const data = await masuk(formData);

      if (data?.data) {
        setLoading(false);
        Swal.fire({
          title: "Login Berhasil!",
          text: "Anda akan diarahkan ke halaman dashboard",
          icon: "success",
        }).then((action) => {
          if (action.isConfirmed) {
            router.replace("/dashboard");
          }
        });
        return;
      }
      setLoading(false);
      Swal.fire({
        title: "Login Gagal!",
        text: "Kredensial tidak valid",
        icon: "error",
      });
    } catch (err) {
      setLoading(false);
      console.error(err);
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
            <svg
              width="100"
              height="100"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="200" height="200" rx="40" fill="#F0F9FF" />

              <path
                d="M60 70C60 64.4772 64.4772 60 70 60H130C135.523 60 140 64.4772 140 70V90H60V70Z"
                fill="#7DD3FC"
              />

              <path
                d="M60 90H120C125.523 90 130 94.4772 130 100V110C130 115.523 125.523 120 120 120H80C74.4772 120 70 124.477 70 130V140H140"
                stroke="#0EA5E9"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="140" cy="140" r="8" fill="#0284C7" />
            </svg>

            <h1 className="text-4xl font-bold mt-2 text-slate-900 tracking-tighter">
              SIDOTEC
            </h1>
            <div className="h-1 w-12 bg-sky-500 rounded-full mt-2" />
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
              style={{
                backgroundColor: loading
                  ? "var(--color-sky-700)"
                  : "var(--color-sky-500)",
              }}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
