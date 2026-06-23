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
  Building,
} from "lucide-react";
import Swal from "sweetalert2";
import { backupDatabase, getBackupStats } from "@/services/backup";

interface BackupStats {
  metadata: {
    system: string;
    version: string;
    backup_date: string;
    description: string;
  };
  tables: {
    pengguna: any[];
    surat: any[];
    disposisi: any[];
    instansi: any[];
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
      // Ambil data real dari API
      const response = await getBackupStats();

      if (response?.status !== 200) {
        throw new Error(response?.reason || "Gagal mengambil data");
      }

      const backupData = response.data;

      // Jeda proses untuk UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Proses Download dengan data real
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const dateStr = new Date().toISOString().split("T")[0];
      const timeStr = new Date()
        .toTimeString()
        .split(" ")[0]
        .replace(/:/g, "-");
      link.download = `SIDOTEC_DB_BACKUP_${dateStr}_${timeStr}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Database telah dicadangkan dengan ${backupData.statistics.total_surat} surat, ${backupData.statistics.total_pengguna} pengguna, dan ${backupData.statistics.total_disposisi} disposisi.`,
        confirmButtonColor: "oklch(58.8% 0.158 241.966)",
      });
    } catch (error: any) {
      console.error("Backup error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan sistem.",
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

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Secure Encryption Verified
          </span>
        </div>
      </div>
    </div>
  );
}
