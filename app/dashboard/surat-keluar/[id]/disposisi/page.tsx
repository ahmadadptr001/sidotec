"use client";
import {
  ambilDataDisposisiByIdSurat,
  ambilDataSuratById,
  hapusDataDisposisi,
} from "@/services/surat";
import { ChevronRight, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface dataSuratProps {
  ringkasan: string;
  keterangan: string;
}

interface dataDisposisiProps {
  id: number;
  created_at: Date;
  surat_id: string;
  tujuan: string;
  deadline: string;
  isi: string;
  catatan: string;
  sifat: string;
}

export default function DisposisiSuratPage() {
  const router = useRouter();
  const params = useParams();
  const [dataSurat, setDataSurat] = useState<dataSuratProps | null>(null);
  const [dataDisposisi, setDataDisposisi] = useState<
    dataDisposisiProps[] | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch data disposisi yang terkait dengan id surat
  const fetchDataDisposisi = async () => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      const response = await ambilDataDisposisiByIdSurat(String(params.id));
      const responseDataSurat = await ambilDataSuratById(String(params.id));

      if (response?.data && responseDataSurat?.data) {
        setDataDisposisi(response.data);
        setDataSurat(responseDataSurat.data);
      }
    } catch (err) {
      console.error(err);
      setDataDisposisi([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataDisposisi();
  }, [params.id]);

  // Fungsi untuk menentukan warna badge berdasarkan sifat
  const getBadgeColor = (sifat: string) => {
    const s = sifat.toLowerCase();
    switch (s) {
      case "biasa":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "penting":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "segera":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "rahasia":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleHapusDataDisposisi = async (id: string) => {
    if (!id) return;
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data disposisi yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Menghapus Data...",
            text: "Mohon tunggu sebentar",
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const response = await hapusDataDisposisi(id);
          if (response.status === 200) {
            Swal.close();
            Swal.fire({
              icon: "success",
              title: "Data Berhasil Dihapus",
              text: "Data disposisi telah berhasil dihapus.",
            });
            fetchDataDisposisi(); // Refresh data setelah hapus
          } else {
            Swal.close();
            Swal.fire({
              icon: "error",
              title: "Gagal Menghapus Data",
              text: response.reason || "Terjadi kesalahan saat menghapus data.",
            });
          }
        } catch (err) {
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Gagal Menghapus Data",
            text: err instanceof Error ? err.message : "Terjadi kesalahan",
          });
        }
      }
    });
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* State Loading: Menampilkan spinner saat mengambil data */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
          <p className="font-medium">Memuat data disposisi...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-sky-50 border border-sky-100 rounded-md flex-1 shadow-sm">
            {/* Teks Perihal */}
            <div className="">
              <h1 className="text-sm font-bold text-sky-900 mb-1 uppercase tracking-wide">
                Perihal Surat
              </h1>
              <h3 className="flex items-start gap-2 text-slate-700 font-medium">
                <ChevronRight
                  size={20}
                  className="mt-0.5 text-sky-500 shrink-0"
                />
                <span>{dataSurat?.ringkasan || "Tidak ada ringkasan"}</span>
              </h3>
            </div>

            {/* Button Tambah Data */}
            <button
              onClick={() =>
                router.push(
                  `/dashboard/surat-keluar/${params.id}/disposisi/tambah`,
                )
              }
              className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-md transition-all shadow-sm hover:shadow-md font-semibold whitespace-nowrap"
            >
              <Plus size={20} />
              Tambah Disposisi
            </button>
          </section>

          {/* Tabel Data Disposisi */}
          <div className="overflow-x-auto bg-white rounded-md shadow-sm border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-700 w-16 text-center">
                    No
                  </th>
                  <th className="p-4 font-semibold text-slate-700">Sifat</th>
                  <th className="p-4 font-semibold text-slate-700">
                    Ringkasan
                  </th>
                  <th className="p-4 font-semibold text-slate-700">
                    Batas Waktu
                  </th>
                  <th className="p-4 font-semibold text-slate-700 text-center w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dataDisposisi && dataDisposisi.length > 0 ? (
                  dataDisposisi.map(
                    (disposisi: dataDisposisiProps, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="p-4 text-center text-slate-600 font-medium">
                          {idx + 1}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 border rounded-md text-xs font-semibold uppercase tracking-wider ${getBadgeColor(
                              disposisi.sifat,
                            )}`}
                          >
                            {disposisi.sifat}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {disposisi.catatan}
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {disposisi.deadline}
                        </td>

                        {/* Kolom Aksi (Tindakan CRUD) */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/surat-keluar/${params.id}/disposisi/edit/${disposisi.id}`,
                                )
                              }
                              className="p-2 text-sky-600 hover:bg-sky-100 rounded-md transition-colors"
                              title="Edit Data"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleHapusDataDisposisi(String(disposisi.id))
                              }
                              className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                              title="Hapus Data"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <p>Belum ada data disposisi untuk surat ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
