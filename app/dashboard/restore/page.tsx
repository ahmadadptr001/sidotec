"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  UploadCloud,
  Database,
  ShieldAlert,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  X,
  Loader2,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { restoreDatabase } from "@/services/backup";
import Swal from "sweetalert2";
import { removeSession } from "@/services/user";

const dataBreadcrumbs = [
  {
    name: "dashboard",
    to: "/dashboard",
  },
  {
    name: "restore database",
    to: "/dashboard/restore",
  },
];

interface BackupTables {
  pengguna?: any[];
  surat?: any[];
  disposisi?: any[];
  instansi?: any[];
}

export default function RestoreDatabasePage() {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backupData, setBackupData] = useState<any>(null);
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validasi format JSON backup
  const validateBackupData = (data: any): boolean => {
    if (!data || !data.tables) {
      return false;
    }
    const tables = data.tables;
    const validTables = ["pengguna", "surat", "disposisi", "instansi"];
    for (const key of validTables) {
      if (tables[key] && !Array.isArray(tables[key])) {
        return false;
      }
    }
    return true;
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");

    // Validasi tipe file - sekarang menerima JSON
    const validTypes = ["application/json", "text/plain"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && fileExtension !== "json") {
      setFileError("Format file tidak valid. Gunakan file JSON (.json)");
      setSelectedFile(null);
      setBackupData(null);
      return;
    }

    // Validasi ukuran file (maks 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setFileError("Ukuran file terlalu besar. Maksimal 50MB");
      setSelectedFile(null);
      setBackupData(null);
      return;
    }

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);

      if (!validateBackupData(parsedData)) {
        setFileError("Format backup tidak valid. Struktur JSON tidak sesuai.");
        setSelectedFile(null);
        setBackupData(null);
        return;
      }

      setSelectedFile(file);
      setBackupData(parsedData);
    } catch (err) {
      setFileError("Gagal membaca file. Pastikan file JSON valid.");
      setSelectedFile(null);
      setBackupData(null);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileChange({ target: { files: dataTransfer.files } } as any);
    }
  };

  // Hapus file yang dipilih
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setBackupData(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle restore process
  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!backupData) {
      Swal.fire({
        icon: "warning",
        title: "File Belum Dipilih",
        text: "Silakan pilih file backup terlebih dahulu.",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Konfirmasi Restore",
      html: `
        <div class="text-left text-sm">
          <p class="mb-2"><strong>PERINGATAN:</strong></p>
          <ul class="list-disc pl-4 text-slate-600">
            <li>Semua data saat ini akan dihapus</li>
            <li>Data akan diganti dengan data dari file backup</li>
            <li>User admin akan dibuat ulang (username: admin, password: admin123)</li>
          </ul>
          <p class="mt-3 font-semibold text-amber-600">Apakah Anda yakin ingin melanjutkan?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Restore Sekarang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    setIsRestoring(true);

    try {
      const response = await restoreDatabase(backupData);

      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Restore Berhasil",
          html: `
            <div class="text-left text-sm">
              <p class="mb-2">Database berhasil dipulihkan!</p>
              <div class="bg-slate-100 p-3 rounded-lg mt-2">
                <p class="font-semibold text-slate-700">Data yang dipulihkan:</p>
                <ul class="list-disc pl-4 mt-1 text-slate-600">
                  <li>Pengguna: ${response.data?.pengguna || 0} data</li>
                  <li>Surat: ${response.data?.surat || 0} data</li>
                  <li>Disposisi: ${response.data?.disposisi || 0} data</li>
                  <li>Instansi: ${response.data?.instansi || 0} data</li>
                </ul>
              </div>
              <p class="mt-3 text-amber-600 font-medium">
                Login dengan: admin / admin123
                atau
                gunakan akun Anda sebelumnya.
              </p>
            </div>
          `,
          confirmButtonText: "OK",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await removeSession();
            router.replace("/");
          }
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Restore Gagal",
        text: err.message || "Terjadi kesalahan saat melakukan restore.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Tampilkan statistik dari file backup
  const getBackupStats = () => {
    if (!backupData?.tables) return null;
    const { tables } = backupData;
    return {
      pengguna: tables.pengguna?.length || 0,
      surat: tables.surat?.length || 0,
      disposisi: tables.disposisi?.length || 0,
      instansi: tables.instansi?.length || 0,
    };
  };

  const stats = backupData ? getBackupStats() : null;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* breadcrumbs */}
      <Breadcrumbs data={dataBreadcrumbs} />

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-amber-600" /> Restore Database
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Kembalikan kondisi data ke titik pencadangan sebelumnya.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Kolom Kiri: Warning & Information (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-sm">
            <div className="p-3 bg-white rounded-xl text-amber-600 w-fit mb-6 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-amber-900 mb-2 tracking-tight">
              Prosedur Kritis
            </h2>
            <p className="text-sm text-amber-700/80 leading-relaxed font-medium mb-6">
              Melakukan restorasi akan menghapus dan menimpa seluruh data yang
              ada saat ini dengan data dari file cadangan. Pastikan Anda
              memiliki cadangan terbaru dari data saat ini sebelum melanjutkan.
            </p>

            <ul className="space-y-3">
              {[
                "Format file harus .json",
                "Ukuran maksimal file 50MB",
                "Hanya untuk role Super Admin",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-[11px] font-bold text-amber-800 uppercase tracking-wide"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Preview Stats dari File Backup */}
          {stats && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-8 shadow-sm">
              <div className="p-3 bg-white rounded-xl text-sky-600 w-fit mb-6 shadow-sm">
                <FileJson className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-sky-900 mb-2 tracking-tight">
                Preview Data Backup
              </h2>
              <p className="text-sm text-sky-700/80 leading-relaxed font-medium mb-4">
                Data yang akan dipulihkan dari file backup:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Pengguna", value: stats.pengguna, icon: "👤" },
                  { label: "Surat", value: stats.surat, icon: "📄" },
                  { label: "Disposisi", value: stats.disposisi, icon: "↪️" },
                  { label: "Instansi", value: stats.instansi, icon: "🏢" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 border border-sky-100"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-2xl font-black text-sky-900">
                      {item.value}
                    </p>
                    <p className="text-[10px] font-bold text-sky-600 uppercase">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Upload Form (3/5) */}
        <div className="lg:col-span-3">
          <form onSubmit={handleRestore} className="space-y-6">
            <div
              className={`relative bg-white border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center
                ${dragActive ? "border-sky-500 bg-sky-50/50" : selectedFile ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 hover:border-slate-300"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                {selectedFile ? (
                  <FileJson className="w-10 h-10 text-emerald-500" />
                ) : (
                  <UploadCloud
                    className={`w-10 h-10 ${dragActive ? "text-sky-500 animate-bounce" : "text-slate-300"}`}
                  />
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {selectedFile ? "File Dipilih" : "Unggah File Cadangan"}
              </h3>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                {selectedFile
                  ? `File: ${selectedFile.name}`
                  : "Tarik file backup JSON ke sini atau klik untuk memilih."}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".json"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 min-w-75">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileArchive className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase leading-none mb-1">
                      File Terpilih
                    </p>
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-75">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileArchive className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                      File Terpilih
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      Belum ada file...
                    </p>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    {fileError}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4 text-white">
                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Konfirmasi Akhir</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Proses ini tidak dapat dibatalkan setelah dimulai.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRestoring || !selectedFile}
                className={`w-full md:w-auto px-10 py-4 rounded-xl text-xs font-bold uppercase transition-all shadow-lg flex items-center gap-2
                  ${
                    isRestoring || !selectedFile
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-white text-slate-900 hover:bg-amber-500 hover:text-white shadow-amber-900/20"
                  }`}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sedang Memulihkan...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Pulihkan Sekarang
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
