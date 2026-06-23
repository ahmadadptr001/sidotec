"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  FileText,
  ImageIcon,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
// Asumsi ada service untuk ambil detail data tunggal
import { ambilDataSurat, editSurat } from "@/services/surat";
import Swal from "sweetalert2";

export default function EditSuratPage() {
  const router = useRouter();
  const params = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idSurat, setIdSurat] = useState("");

  const [formData, setFormData] = useState({
    nomor_surat: "",
    asal_surat: "",
    ringkasan: "",
    tanggal: "",
    kategori: "",
    kode_klasifikasi: "",
    nomor_agenda: "",
    indeks_berkas: "",
    keterangan: "",
    file: "",
  });

  const dataBreadcrumbs = [
    { name: "dashboard", to: "/dashboard" },
    { name: "surat masuk", to: "/dashboard/surat-masuk" },
    { name: "edit surat", to: "/dashboard/surat-masuk/edit/" + params.id },
  ];

  // 1. Fetch data lama berdasarkan ID
  useEffect(() => {
    const getDetailData = async () => {
      setIsLoading(true);
      try {
        // Filter data dari list atau panggil API detail
        const response = await ambilDataSurat("masuk");
        const detail = response.data.find(
          (item: any) => item.id.toString() === params.id,
        );

        if (detail) {
          setIdSurat(detail.id);

          setFormData({
            nomor_surat: detail.nomor_surat || "",
            asal_surat: detail.asal_surat || "",
            ringkasan: detail.ringkasan || "",
            tanggal: detail.tanggal || "",
            kategori: detail.kategori || "",
            kode_klasifikasi: detail.kode_klasifikasi || "",
            nomor_agenda: detail.nomor_agenda || "",
            indeks_berkas: detail.indeks_berkas || "",
            keterangan: detail.keterangan || "",
            file: detail.file || "",
          });
        }
      } catch (error) {
        console.error("Gagal mengambil detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getDetailData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    Swal.fire({
      title: "Loading...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await editSurat(formData, idSurat);
      if (response.status === 200) {
        Swal.close();
        Swal.fire({
          title: "Data berhasil diperbarui",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            router.back();
          }
        });
      } else {
        Swal.close();
      }
    } catch (error: any) {
      Swal.close();
      Swal.fire({
        title: "Gagal memperbarui data!",
        text: error.message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isImageFile = (url: string) =>
    /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <Breadcrumbs data={dataBreadcrumbs} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Form */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Ubah Data Surat
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pastikan seluruh informasi surat sudah sesuai dengan dokumen
              fisik.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold uppercase">
              ID: {params.id}
            </span>
          </div>
        </div>

        {isLoading ? (
          /* --- LOADING SKELETON --- */
          <div className="p-8 space-y-6 animate-pulse">
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-md"></div>
              ))}
            </div>
            <div className="h-32 bg-slate-100 rounded-md"></div>
            <div className="h-12 bg-slate-200 rounded-md w-1/3"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baris 1: No Surat & Tanggal */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Nomor Surat
                </label>
                <input
                  required
                  value={formData.nomor_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_surat: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Tanggal Surat
                </label>
                <input
                  required
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all"
                />
              </div>

              {/* Baris 2: Asal Surat */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Asal Surat / Instansi Pengirim
                </label>
                <input
                  required
                  value={formData.asal_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, asal_surat: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all"
                />
              </div>

              {/* Baris 3: Ringkasan */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ringkasan Perihal
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.ringkasan}
                  onChange={(e) =>
                    setFormData({ ...formData, ringkasan: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all resize-none"
                />
              </div>

              {/* Baris 4: Klasifikasi & Agenda */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Kode Klasifikasi
                </label>
                <input
                  value={formData.kode_klasifikasi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kode_klasifikasi: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Nomor Agenda
                </label>
                <input
                  value={formData.nomor_agenda}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_agenda: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Preview File Saat Ini */}
            <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                File Lampiran Saat Ini
              </label>
              {formData.file ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    {isImageFile(formData.file) ? (
                      <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden border border-slate-200">
                        <img
                          src={formData.file}
                          className="w-full h-full object-cover"
                          alt="prev"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center text-red-500">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Dokumen_Arsip.pdf
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">
                        Klik tombol untuk meninjau
                      </p>
                    </div>
                  </div>
                  <a
                    href={formData.file}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-bold transition-all"
                  >
                    Buka File <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Tidak ada file yang dilampirkan.
                </p>
              )}
            </div>

            {/* Keterangan Tambahan */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Keterangan Tambahan
              </label>
              <textarea
                rows={3}
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all resize-none"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-sky-600 text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3.5 border border-slate-200 text-slate-500 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
