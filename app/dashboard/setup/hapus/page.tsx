"use client";

import { useState, useRef, useEffect } from "react";
import {
  Shield,
  Search,
  UserX,
  AlertTriangle,
  Trash2,
  Briefcase,
  Mail,
  Fingerprint,
  User,
  Lock, // Ikon tambahan untuk indikasi terkunci
} from "lucide-react";
import { ambildataUser, hapusDataUser } from "@/services/user";
import Swal from "sweetalert2";
import { useUser } from "@/context/UserProvider";

export default function DeleteUserPage() {
  const { user: currentUser } = useUser(); // Rename agar tidak tertukar dengan iterasi
  const [searchQuery, setSearchQuery] = useState("");
  const [dataUser, setDataUser] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cek apakah user yang dipilih adalah user yang sedang login
  const isSelf = selectedUser?.id === currentUser?.id;

  const ambilData = async () => {
    try {
      const response = await ambildataUser();
      if (response.data) setDataUser(response.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    ambilData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = dataUser.filter(
        (u) =>
          u.nama_lengkap.toLowerCase().includes(query.toLowerCase()) ||
          u.username.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(filtered);
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || isSelf) return;

    Swal.fire({
      title: "Hapus Akun Pengguna?",
      text: `Anda yakin ingin menghapus akun @${selectedUser.username}? Tindakan ini permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Akun",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Menghapus...",
          text: "Mohon tunggu sebentar",
          icon: "info",
          didOpen: () => {
            Swal.showLoading();
          },
        });
        setLoading(true);
        try {
          await hapusDataUser(selectedUser.id);
          Swal.close();
          Swal.fire("Dihapus!", "Akun telah berhasil dihapus.", "success");
          ambilData();
          setSelectedUser(null);
        } catch (err: any) {
          Swal.close();
          Swal.fire("Gagal!", err.message || "Terjadi kesalahan", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-md text-white">
            <UserX className="w-5 h-5" />
          </div>
          Manajemen Penghapusan Akun
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Cari dan hapus data personil. Sistem membatasi penghapusan akun Anda
          sendiri untuk mencegah kegagalan akses.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Pencarian */}
        <div
          className="bg-white p-6 rounded-md border border-slate-200 shadow-sm relative"
          ref={dropdownRef}
        >
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 block">
            Cari Pengguna
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Ketik nama atau username..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md outline-none focus:bg-white focus:border-red-600 transition-all text-sm"
            />
          </div>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-10 w-[calc(100%-3rem)] left-6 mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((u, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectUser(u)}
                  className="flex items-center gap-3 p-3 hover:bg-red-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                >
                  <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {u.nama_lengkap.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                      {u.nama_lengkap}
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          Anda
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      @{u.username} • {u.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Detail Data */}
        {selectedUser && (
          <div
            className={`bg-white rounded-md border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 ${isSelf ? "border-sky-200" : "border-slate-200"}`}
          >
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom Kiri: Biodata */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-100 uppercase tracking-wider">
                    Informasi Profil
                  </h3>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Nama Lengkap
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <User className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium truncate">
                        {selectedUser.nama_lengkap}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Email
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium truncate">
                        {selectedUser.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Pekerjaan & Akses */}
                <div className="space-y-5">
                  <h3
                    className={`text-sm font-bold pb-2 border-b uppercase tracking-wider ${isSelf ? "text-sky-700 border-sky-100" : "text-red-700 border-red-100"}`}
                  >
                    Pekerjaan & Akses
                  </h3>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Username
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <Fingerprint className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium truncate">
                        @{selectedUser.username}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Hak Akses (Role)
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <Shield className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium uppercase text-xs tracking-wider">
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Form - Kondisional Berdasarkan isSelf */}
            <div
              className={`px-8 py-5 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isSelf ? "bg-sky-50 border-sky-100" : "bg-red-50/50 border-red-100"}`}
            >
              <div
                className={`flex items-center gap-3 ${isSelf ? "text-sky-600" : "text-red-600"}`}
              >
                {isSelf ? (
                  <Lock className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <p className="text-[11px] leading-tight font-medium max-w-sm">
                  {isSelf ? (
                    <>
                      <strong>Aksi Tidak Diizinkan:</strong> Anda tidak dapat
                      menghapus akun Anda sendiri demi alasan keamanan sistem.
                    </>
                  ) : (
                    <>
                      <strong>Peringatan Berbahaya:</strong> Data yang dihapus
                      tidak dapat dikembalikan secara otomatis.
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-md transition-all border border-slate-300 bg-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading || isSelf}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-bold rounded-md shadow-sm transition-all text-white ${
                    isSelf
                      ? "bg-slate-400 cursor-not-allowed opacity-70"
                      : "bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  }`}
                >
                  {isSelf ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {loading
                    ? "Menghapus..."
                    : isSelf
                      ? "Tidak Bisa Hapus Akun Sendiri"
                      : "Hapus Akun Permanen"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Tampilan Kosong */}
        {!selectedUser && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-md">
            <UserX className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              Cari dan pilih pengguna di atas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
