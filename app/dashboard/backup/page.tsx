"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Download,
  RefreshCw,
  ShieldCheck,
  Users,
  FileText,
  ArrowRightLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import { backupDatabase, getBackupStats } from "@/services/backup";
import { pesanError } from "@/lib/error";

interface BackupStats {
  metadata: {
    system: string;
    version: string;
    backup_date: string;
    description: string;
  };
  tables: {
    pengguna: unknown[];
    surat: unknown[];
    disposisi: unknown[];
    instansi: unknown[];
  };
  statistics: {
    total_pengguna: number;
    total_surat: number;
    total_disposisi: number;
    total_instansi: number;
    surat_masuk: number;
    surat_keluar: number;
  };
}

export default function DirectBackupPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Ambil statistik database saat page dimuat
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getBackupStats();
      if (response?.status === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRealBackup = async () => {
    setIsBackingUp(true);

    try {
      // Berkas diambil langsung dari endpoint (format=file) sehingga isi yang
      // tersimpan persis sama dengan yang bisa dibaca halaman Restore.
      const blob = await backupDatabase();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const waktu = new Date();
      const tanggal = [
        waktu.getFullYear(),
        String(waktu.getMonth() + 1).padStart(2, "0"),
        String(waktu.getDate()).padStart(2, "0"),
      ].join("-");
      const jam = [
        String(waktu.getHours()).padStart(2, "0"),
        String(waktu.getMinutes()).padStart(2, "0"),
      ].join("-");
      link.download = `SIDOTEC_DB_BACKUP_${tanggal}_${jam}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Statistik disegarkan agar angka pada kartu selalu terbaru.
      await fetchStats();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Berkas cadangan telah diunduh. Simpan di tempat yang aman karena berisi hash kata sandi pengguna.",
        confirmButtonColor: "#0284c7",
      });
    } catch (error) {
      console.error("Backup error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: pesanError(error, "Terjadi kesalahan sistem."),
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-md p-10 shadow-sm text-center">
        {/* Icon & Header */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <Database className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Database Backup
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Klik tombol di bawah untuk mengunduh salinan database terbaru.
          </p>
        </div>

        {/* Action Button */}
        <button
          disabled={isBackingUp}
          onClick={handleRealBackup}
          className={`group w-full py-4 rounded-md text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-md active:scale-95
            ${
              isBackingUp
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-sky-600 text-white hover:bg-sky-700"
            }`}
        >
          {isBackingUp ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sedang Memproses...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Backup & Unduh Sekarang
            </>
          )}
        </button>

        {/* Ringkasan isi database — sebelumnya data ini diambil tetapi tidak
            pernah ditampilkan. */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-left">
          {[
            { label: "Surat Masuk", nilai: stats?.statistics.surat_masuk, icon: ArrowRightLeft },
            { label: "Surat Keluar", nilai: stats?.statistics.surat_keluar, icon: ArrowRightLeft },
            { label: "Disposisi", nilai: stats?.statistics.total_disposisi, icon: FileText },
            { label: "Pengguna", nilai: stats?.statistics.total_pengguna, icon: Users },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-slate-200 rounded-md p-3 flex items-center gap-3"
            >
              <div className="p-2 bg-slate-50 text-slate-500 rounded">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {loading ? "…" : (item.nilai ?? 0)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Peringatan yang jujur: berkas cadangan TIDAK dienkripsi. */}
        <div className="mt-6 flex items-start gap-2 text-left text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-[11px] font-medium leading-snug">
            Berkas cadangan berupa JSON tanpa enkripsi dan memuat hash kata sandi
            seluruh pengguna. Simpan pada media yang aman dan jangan dibagikan.
          </span>
        </div>
      </div>
    </div>
  );
}
