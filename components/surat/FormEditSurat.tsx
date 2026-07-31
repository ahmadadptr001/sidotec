"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  FileText,
  ExternalLink,
  Loader2,
  Paperclip,
  AlertTriangle,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ambilDataSuratById, editSurat } from "@/services/surat";
import Swal from "sweetalert2";
import { KATEGORI_SURAT } from "@/lib/tabel";
import { pesanError } from "@/lib/error";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

interface FormEditSuratProps {
  jenis: "masuk" | "keluar";
}

const KOSONG = {
  nomor_surat: "",
  nomor_agenda: "",
  asal_surat: "",
  tujuan_surat: "",
  ringkasan: "",
  tanggal: "",
  kategori: "",
  kode_klasifikasi: "",
  indeks_berkas: "",
  keterangan: "",
};

/**
 * Form edit surat untuk kedua jenis surat.
 *
 * Sebelumnya halaman surat masuk dan surat keluar punya salinan form
 * masing-masing, dan versi surat masuk mengambil data dengan cara mencari di
 * dalam daftar (yang dibatasi 10 baris) sehingga surat lama tidak bisa diedit.
 * Sekarang keduanya memakai komponen ini dan mengambil data langsung per id.
 */
export default function FormEditSurat({ jenis }: FormEditSuratProps) {
  const router = useRouter();
  const params = useParams();
  const idSurat = String(params.id ?? "");
  const suratKeluar = jenis === "keluar";
  const basePath = suratKeluar ? "/dashboard/surat-keluar" : "/dashboard/surat-masuk";

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gagalMuat, setGagalMuat] = useState<string | null>(null);
  const [fileLama, setFileLama] = useState<string>("");
  const [fileBaru, setFileBaru] = useState<File | null>(null);
  const [errorFile, setErrorFile] = useState<string>("");
  const [formData, setFormData] = useState({ ...KOSONG });

  const dataBreadcrumbs = [
    { name: "dashboard", to: "/dashboard" },
    { name: suratKeluar ? "surat keluar" : "surat masuk", to: basePath },
    { name: "edit surat", to: `${basePath}/edit/${idSurat}` },
  ];

  useEffect(() => {
    if (!idSurat) return;
    let dibatalkan = false;

    (async () => {
      setIsLoading(true);
      setGagalMuat(null);
      try {
        // Ambil satu surat langsung berdasarkan id.
        const response = await ambilDataSuratById(idSurat);
        const detail = response?.data;
        if (dibatalkan) return;

        if (!detail) {
          setGagalMuat("Surat tidak ditemukan.");
          return;
        }

        setFileLama(detail.file || "");
        setFormData({
          nomor_surat: detail.nomor_surat || "",
          nomor_agenda: detail.nomor_agenda || "",
          asal_surat: detail.asal_surat || "",
          tujuan_surat: detail.tujuan_surat || "",
          ringkasan: detail.ringkasan || "",
          tanggal: detail.tanggal || "",
          kategori: detail.kategori || "",
          kode_klasifikasi: detail.kode_klasifikasi || "",
          indeks_berkas: detail.indeks_berkas || "",
          keterangan: detail.keterangan || "",
        });
      } catch (error) {
        if (!dibatalkan) {
          setGagalMuat(pesanError(error, "Gagal mengambil detail surat."));
        }
      } finally {
        if (!dibatalkan) setIsLoading(false);
      }
    })();

    return () => {
      dibatalkan = true;
    };
  }, [idSurat]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setErrorFile("");

    if (!file) {
      setFileBaru(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorFile("Ukuran file maksimal 5MB");
      setFileBaru(null);
      e.target.value = "";
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setErrorFile("Hanya format .pdf, .jpg, .jpeg, dan .png yang diizinkan");
      setFileBaru(null);
      e.target.value = "";
      return;
    }
    setFileBaru(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idSurat) return;

    setIsSubmitting(true);
    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // `tujuan_surat` hanya relevan untuk surat keluar.
    const { tujuan_surat, ...umum } = formData;
    const payload = suratKeluar ? { ...umum, tujuan_surat } : umum;

    try {
      await editSurat(payload, idSurat, fileBaru);
      Swal.close();
      await Swal.fire({
        title: "Data berhasil diperbarui",
        icon: "success",
      });
      router.push(basePath);
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Gagal memperbarui data!",
        text: pesanError(error),
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isImageFile = (url: string) =>
    /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url);

  const labelInput =
    "text-[10px] font-bold text-slate-400 uppercase tracking-widest";
  const kelasInput =
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <Breadcrumbs data={dataBreadcrumbs} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Ubah Data Surat {suratKeluar ? "Keluar" : "Masuk"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pastikan seluruh informasi surat sudah sesuai dengan dokumen fisik.
            </p>
          </div>
          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold uppercase shrink-0">
            ID: {idSurat}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-6 animate-pulse">
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-md"></div>
              ))}
            </div>
            <div className="h-32 bg-slate-100 rounded-md"></div>
            <div className="h-12 bg-slate-200 rounded-md w-1/3"></div>
          </div>
        ) : gagalMuat ? (
          /* Kegagalan pengambilan data kini ditampilkan, bukan berupa form kosong
             yang selalu gagal saat disimpan. */
          <div className="p-12 flex flex-col items-center text-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{gagalMuat}</p>
              <p className="text-sm text-slate-500 mt-1">
                Data mungkin sudah dihapus atau tautannya tidak lagi berlaku.
              </p>
            </div>
            <button
              onClick={() => router.push(basePath)}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              Kembali ke Daftar Surat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={labelInput}>Nomor Surat</label>
                <input
                  required
                  value={formData.nomor_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_surat: e.target.value })
                  }
                  className={kelasInput}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelInput}>Tanggal Surat</label>
                <input
                  required
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                  className={kelasInput}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelInput}>Nomor Agenda</label>
                <input
                  required
                  value={formData.nomor_agenda}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_agenda: e.target.value })
                  }
                  className={kelasInput}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelInput}>Kode Klasifikasi</label>
                <input
                  required
                  value={formData.kode_klasifikasi}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_klasifikasi: e.target.value })
                  }
                  className={`${kelasInput} uppercase`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelInput}>Indeks Berkas</label>
                <input
                  required
                  value={formData.indeks_berkas}
                  onChange={(e) =>
                    setFormData({ ...formData, indeks_berkas: e.target.value })
                  }
                  className={kelasInput}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelInput}>Kategori Surat</label>
                <select
                  required
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  className={kelasInput}
                >
                  <option value="" disabled>
                    Pilih Kategori...
                  </option>
                  {KATEGORI_SURAT.map((kategori) => (
                    <option key={kategori} value={kategori}>
                      {kategori}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={
                  suratKeluar ? "space-y-1.5" : "md:col-span-2 space-y-1.5"
                }
              >
                <label className={labelInput}>Asal Surat / Instansi Pengirim</label>
                <input
                  required
                  value={formData.asal_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, asal_surat: e.target.value })
                  }
                  className={kelasInput}
                />
              </div>

              {/* Field kunci surat keluar yang sebelumnya tidak bisa diedit. */}
              {suratKeluar && (
                <div className="space-y-1.5">
                  <label className={labelInput}>Tujuan Surat</label>
                  <input
                    value={formData.tujuan_surat}
                    onChange={(e) =>
                      setFormData({ ...formData, tujuan_surat: e.target.value })
                    }
                    placeholder="Instansi / unit penerima"
                    className={kelasInput}
                  />
                </div>
              )}

              <div className="md:col-span-2 space-y-1.5">
                <label className={labelInput}>Ringkasan Perihal</label>
                <textarea
                  required
                  rows={2}
                  value={formData.ringkasan}
                  onChange={(e) =>
                    setFormData({ ...formData, ringkasan: e.target.value })
                  }
                  className={`${kelasInput} resize-none`}
                />
              </div>
            </div>

            {/* Lampiran: pratinjau yang sekarang + opsi penggantian berkas */}
            <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <label className={`${labelInput} block`}>File Lampiran Saat Ini</label>
              {fileLama ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {isImageFile(fileLama) ? (
                      <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={fileLama}
                          className="w-full h-full object-cover"
                          alt="Pratinjau lampiran"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {decodeURIComponent(
                          fileLama.split("/").pop()?.split("?")[0] || "Lampiran",
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">
                        Klik tombol untuk meninjau
                      </p>
                    </div>
                  </div>
                  <a
                    href={fileLama}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-bold transition-all shrink-0"
                  >
                    Buka File <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Tidak ada file yang dilampirkan.
                </p>
              )}

              <div className="space-y-1.5">
                <label className={`${labelInput} flex items-center gap-2`}>
                  <Paperclip className="w-3 h-3 text-sky-600" /> Ganti Lampiran
                  (Opsional)
                </label>
                <input
                  type="file"
                  accept=".pdf, image/jpeg, image/png, image/jpg"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-sky-100 file:text-sky-800 hover:file:bg-sky-200 cursor-pointer"
                />
                {errorFile ? (
                  <p className="text-red-600 text-xs font-medium">{errorFile}</p>
                ) : (
                  <p className="text-[11px] font-medium text-slate-500">
                    {fileBaru
                      ? `Lampiran akan diganti dengan: ${fileBaru.name}`
                      : "Biarkan kosong bila lampiran tidak diubah. Format PDF/JPG/PNG, maksimal 5MB."}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelInput}>Keterangan Tambahan</label>
              <textarea
                rows={3}
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className={`${kelasInput} resize-none`}
              />
            </div>

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
                onClick={() => router.push(basePath)}
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
