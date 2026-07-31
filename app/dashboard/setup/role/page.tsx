"use client";

import { useState, useRef, useEffect } from "react";
import {
  Shield,
  Search,
  User,
  AlertTriangle,
  Save,
  ChevronDown,
  Briefcase,
  Mail,
  Fingerprint,
} from "lucide-react";
import { ambildataUser, perbaruiDataUser } from "@/services/user"; // Pastikan service ini tersedia
import Swal from "sweetalert2";
import type { PenggunaPublik } from "@/lib/tipe";
import { pesanError } from "@/lib/error";

export default function EditUserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dataUser, setDataUser] = useState<PenggunaPublik[]>([]);
  const [searchResults, setSearchResults] = useState<PenggunaPublik[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk user yang sedang diedit
  const [selectedUser, setSelectedUser] = useState<PenggunaPublik | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
        (user) =>
          user.nama_lengkap.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(filtered);
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectUser = (user: PenggunaPublik) => {
    // Gunakan spread operator untuk memastikan kita mengedit copy-an datanya
    setSelectedUser({ ...user });
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Fungsi dinamis untuk mengubah field apapun
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => (prev === null ? prev : {
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    Swal.fire({
      title: "Simpan Perubahan?",
      text: "Data pengguna akan diperbarui di database.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      confirmButtonColor: "#0284c7",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Loading...",
          text: "Mohon tunggu sebentar",
          icon: "info",
          didOpen: () => {
            Swal.showLoading();
          },
        });
        setLoading(true);
        try {
          // Hanya field profil yang dikirim. Sebelumnya seluruh objek pengguna
          // (termasuk kolom password) ikut terkirim ke server.
          await perbaruiDataUser({
            id: String(selectedUser.id),
            email: selectedUser.email,
            username: selectedUser.username,
            nama_lengkap: selectedUser.nama_lengkap,
            unit: selectedUser.unit ?? "",
            jabatan: selectedUser.jabatan ?? "",
            role: selectedUser.role,
          });

          Swal.close();
          Swal.fire("Berhasil!", "Data pengguna telah diperbarui.", "success");
          ambilData(); // Refresh data master
          setSelectedUser(null); // Tutup form edit
        } catch (err) {
          Swal.close();
          Swal.fire("Gagal!", pesanError(err, "Terjadi kesalahan"), "error");
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
          <div className="p-2 bg-sky-600 rounded-md text-white">
            <User className="w-5 h-5" />
          </div>
          Ubah Role & Informasi Pengguna
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Cari dan ubah informasi profil serta hak akses personil
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Ketik nama atau username..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md outline-none focus:bg-white focus:border-sky-600 transition-all text-sm"
            />
          </div>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-10 w-[calc(100%-3rem)] left-6 mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((user, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center gap-3 p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                >
                  <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {user.nama_lengkap.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {user.nama_lengkap}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      @{user.username} • {user.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Form Edit (Hanya tampil jika user dipilih) */}
        {selectedUser && (
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
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
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        name="nama_lengkap"
                        value={selectedUser.nama_lengkap}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-sky-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        name="email"
                        value={selectedUser.email}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-sky-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Username
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        name="username"
                        value={selectedUser.username}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-sky-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Pekerjaan & Akses */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-sky-700 pb-2 border-b border-sky-100 uppercase tracking-wider">
                    Pekerjaan & Akses
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Unit Kerja
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        name="unit"
                        value={selectedUser.unit ?? ""}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-sky-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Jabatan
                    </label>
                    <input
                      name="jabatan"
                      value={selectedUser.jabatan ?? ""}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-sky-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Hak Akses (Role)
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        name="role"
                        value={selectedUser.role}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm appearance-none focus:bg-white focus:border-sky-600 outline-none cursor-pointer"
                      >
                        <option value="staff">Staff Operasional</option>
                        <option value="pimpinan">Pimpinan / Pejabat</option>
                        <option value="admin">Administrator</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Form */}
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-[11px] leading-tight font-medium">
                  <strong>Catatan:</strong> Pastikan data yang dimasukkan sudah
                  benar sesuai berkas kepegawaian.
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-md transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={loading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-bold rounded-md shadow-sm transition-all bg-sky-600 text-white hover:bg-sky-700 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />{" "}
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tampilan Kosong */}
        {!selectedUser && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-md">
            <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              Cari pengguna di atas untuk mulai mengedit data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
