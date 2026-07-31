"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  Info,
  Forward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ambilDataSurat, hapusDataSurat } from "@/services/surat";
import DetailSurat from "@/components/ui/DetailSurat";
import Swal from "sweetalert2";
import { useUser } from "@/context/UserProvider";
import { bukaJendelaCetak, htmlLembarSurat } from "@/lib/cetak";
import { formatTanggalSingkat } from "@/lib/format";
import type { Surat } from "@/lib/tipe";
import { pesanError } from "@/lib/error";

// Bentuk data surat dipakai bersama dari lib/tipe agar tidak ada dua definisi
// yang bisa saling menyimpang.

const dataBreadcrumbs = [
  { name: "dashboard", to: "/dashboard" },
  { name: "surat keluar", to: "/dashboard/surat-keluar" },
];

export default function SuratKeluarPage() {
  const router = useRouter();
  const { user, instansi } = useUser();

  const [data, setData] = useState<Surat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewDetail, setViewDetail] = useState<Surat | null>(null);

  // State untuk pencarian, limit, dan paginasi
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Tanpa argumen limit: seluruh surat keluar diambil, sehingga pencarian dan
      // paginasi bekerja atas semua arsip (dulu terbatas 10 data pertama).
      const response = await ambilDataSurat("keluar");
      setData(response?.data ?? []);
    } catch (error) {
      console.error("Gagal mengambil data surat:", error);
      Swal.fire({
        title: "Gagal memuat data",
        text: pesanError(error, "Terjadi kesalahan saat mengambil data surat."),
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = (item: Surat) => {
    const berhasil = bukaJendelaCetak(
      `Lembar Pengantar Surat Keluar - ${item.nomor_surat}`,
      htmlLembarSurat(item, instansi?.[0] ?? null, user),
    );

    if (!berhasil) {
      Swal.fire({
        title: "Jendela cetak diblokir",
        text: "Izinkan pop-up untuk situs ini agar dokumen dapat dicetak.",
        icon: "warning",
      });
    }
  };

  const handleHapusDataSurat = (id: string) => {
    if (!id) return;

    Swal.fire({
      title: "Hapus Surat Ini?",
      text: "Surat beserta seluruh disposisi dan lampirannya akan dihapus permanen.",
      icon: "warning",
      confirmButtonText: "Saya Yakin",
      cancelButtonText: "Batal",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "gray",
    }).then(async (konfirmasiUser) => {
      if (!konfirmasiUser.isConfirmed) return;

      Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await hapusDataSurat(id);
        // Pembaruan fungsional agar tidak memakai snapshot state yang lama.
        setData((sebelumnya) => sebelumnya.filter((d) => d.id !== Number(id)));
        Swal.close();
        Swal.fire({
          title: response?.message || "Surat berhasil dihapus",
          icon: "success",
        });
      } catch (err) {
        Swal.close();
        Swal.fire({
          title: "Terjadi Kesalahan!",
          text: pesanError(err),
          icon: "error",
        });
      }
    });
  };

  const filteredData = useMemo(() => {
    const kunci = searchQuery.toLowerCase().trim();
    if (!kunci) return data;
    return data.filter((item) =>
      [item.nomor_surat, item.ringkasan, item.tujuan_surat, item.nomor_agenda]
        .filter(Boolean)
        .some((nilai) => String(nilai).toLowerCase().includes(kunci)),
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // Dijepit saat render, bukan direset lewat useEffect: hasil pencarian yang
  // menyusut tidak lagi memicu render tambahan hanya untuk mengatur ulang halaman.
  const halamanAktif = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (halamanAktif - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, halamanAktif, itemsPerPage]);

  return (
    <div className="relative overflow-x-hidden min-h-screen">
      <div className="space-y-3 transition-all duration-500">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Surat Keluar
          </h1>
          <button
            onClick={() => router.push("/dashboard/surat/tambah")}
            className="bg-black hover:bg-sky-950 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Surat
          </button>
        </div>

        <Breadcrumbs data={dataBreadcrumbs} />

        {/* Search Bar & Limit Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 my-4">
          <div className="flex flex-1 bg-white border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/10 focus-within:border-sky-500 transition-all">
            <div className="flex items-center px-4 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nomor agenda, nomor surat, ringkasan, atau tujuan..."
              className="flex-1 px-2 py-3 text-sm outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-2 sm:py-0 text-sm">
            <label htmlFor="limit" className="text-slate-500 font-medium">
              Tampilkan:
            </label>
            <select
              id="limit"
              className="outline-none bg-transparent font-semibold text-slate-700 cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 font-semibold">Detail Dokumen</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">
                    Tujuan Surat
                  </th>
                  <th className="px-6 py-4 text-right font-semibold">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-slate-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada data surat ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 max-w-50 md:max-w-md">
                        <div className="font-bold text-slate-800 leading-snug truncate">
                          {item.ringkasan}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-tighter truncate">
                          {item.nomor_surat} &middot; {formatTanggalSingkat(item.tanggal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">
                        {item.tujuan_surat || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/surat-keluar/${item.id}/disposisi`,
                              )
                            }
                            className="px-3 flex flex-col items-center gap-1 py-1.5 bg-slate-400 text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-slate-500 hover:text-slate-100 transition-all"
                          >
                            <Forward size={15} />
                            <span className="hidden sm:inline">Disposisi</span>
                          </button>
                          <button
                            onClick={() => setViewDetail(item)}
                            className="px-3 flex flex-col items-center gap-1 py-1.5 bg-emerald-400 text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-emerald-100 transition-all"
                          >
                            <Info size={15} />
                            <span className="hidden sm:inline">Detail</span>
                          </button>
                          <button
                            onClick={() => handlePrint(item)}
                            className="px-3 flex flex-col items-center gap-1 py-1.5 bg-orange-400 text-white rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-orange-500 hover:text-orange-100 transition-all"
                          >
                            <Printer size={15} />
                            <span className="hidden sm:inline">Print</span>
                          </button>

                          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
                          <button
                            onClick={() =>
                              router.push(`/dashboard/surat-keluar/edit/${item.id}`)
                            }
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Ubah"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleHapusDataSurat(String(item.id))}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bagian Paginasi */}
          {!isLoading && filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500 font-medium">
                Menampilkan{" "}
                <span className="font-bold text-slate-800">
                  {(halamanAktif - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(halamanAktif * itemsPerPage, filteredData.length)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-800">
                  {filteredData.length}
                </span>{" "}
                data
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(halamanAktif - 1, 1))}
                  disabled={halamanAktif === 1}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-semibold text-slate-700 px-2">
                  Halaman {halamanAktif} / {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(halamanAktif + 1, totalPages))
                  }
                  disabled={halamanAktif === totalPages}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ANIMASI SLIDE-IN DETAIL PANEL --- */}
      <aside
        className={`fixed top-0 right-0 h-full w-full md:w-112.5 lg:w-125 bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${
          viewDetail ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {viewDetail && (
          <DetailSurat
            item={viewDetail}
            setViewDetail={setViewDetail}
            onPrint={handlePrint}
          />
        )}
      </aside>
    </div>
  );
}
