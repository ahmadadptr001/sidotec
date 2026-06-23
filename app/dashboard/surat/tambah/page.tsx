"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FileText,
  Calendar,
  Users,
  Hash,
  Inbox,
  PlusCircle,
  Tag,
  FolderOpen,
  Paperclip,
  AlignLeft,
  Info,
  ArrowRightLeft,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Swal from "sweetalert2";
import { tambahSurat } from "@/services/surat";

// 1. Definisikan Skema Zod
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maksimal 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const formSchema = z.object({
  nomor_agenda: z.string().min(1, "Nomor agenda wajib diisi"),
  nomor_surat: z.string().min(1, "Nomor surat wajib diisi"),
  jenis: z.enum(["masuk", "keluar"], {
    message: "Pilih jenis surat yang valid",
  }),
  asal_surat: z.string().min(1, "Asal surat wajib diisi"),
  ringkasan: z.string().min(1, "Isi ringkas wajib diisi"),
  kode_klasifikasi: z.string().min(1, "Kode klasifikasi wajib diisi"),
  indeks_berkas: z.string().min(1, "Indeks berkas wajib diisi"),
  tanggal: z.string().min(1, "Tanggal surat wajib diisi"),
  keterangan: z.string().optional(),
  tujuan_surat: z.string().optional(),
  kategori: z.enum(["SDM", "Keuangan", "Umum", "Akademik", "Internal"], {
    message: "Pilih kategori yang valid",
  }),
  file: z
    .any()
    .refine((files) => files?.length === 1, "File dokumen wajib diunggah")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Ukuran file maksimal 5MB",
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Hanya format .pdf, .jpg, .jpeg, dan .png yang diizinkan",
    ),
});

// Inferensi tipe data dari skema Zod
type FormData = z.infer<typeof formSchema>;

export default function TambahSuratMasuk() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal: new Date().toISOString().split("T")[0],
    },
  });

  // Fungsi Submit Handler
  const onSubmit = async (data: FormData) => {
    if (!data)
      Swal.fire({
        title: "Ada Kesalahan!",
        text: "Data tidak lengkap",
        icon: "error",
      });

    Swal.fire({
      title: "Loading...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Karena data.file adalah FileList, kita bisa ekstrak file pertamanya untuk FormData API
    const file = data.file[0];
    const payload = { ...data, file };

    try {
      const response = await tambahSurat(payload);
      if (response.data) {
        Swal.close();
        Swal.fire({
          title: "Surat berhasil ditambahkan!",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) router.back();
        });
        return;
      }

      Swal.close();
    } catch (err: any) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Gagal menambahkan data surat!",
        text: err.message,
      });
    }
  };

  const dataBreadcrumbs = [
    { name: "dashboard", to: "/dashboard" },
    { name: "surat", to: "#" },
    { name: "Tambah Surat", to: "/dashboard/surat/tambah" },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Breadcrumbs data={dataBreadcrumbs} />

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Inbox className="w-8 h-8 text-sky-600" /> Tambah Surat
          </h1>
          <p className="text-slate-600 mt-1 text-sm font-medium">
            Catat dokumen yang masuk atau keluar ke dalam sistem arsip digital.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Identitas & Klasifikasi Surat
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nomor Agenda */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Hash className="w-3 h-3 text-sky-600" /> Nomor Agenda
              </label>
              <input
                {...register("nomor_agenda")}
                type="text"
                placeholder="Misal: 1, 2, 3, dst.."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              {errors.nomor_agenda && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.nomor_agenda.message}
                </p>
              )}
            </div>

            {/* Nomor Surat */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <FileText className="w-3 h-3 text-sky-600" /> Nomor Surat
                (Fisik)
              </label>
              <input
                {...register("nomor_surat")}
                type="text"
                placeholder="Misal: 005/UND/IV/2026"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              {errors.nomor_surat && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.nomor_surat.message}
                </p>
              )}
            </div>

            {/* Jenis Surat */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <ArrowRightLeft className="w-3 h-3 text-sky-600" /> Jenis Surat
              </label>
              <select
                {...register("jenis")}
                defaultValue=""
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 appearance-none"
              >
                <option value="" disabled className="text-slate-400">
                  Pilih Jenis Surat...
                </option>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
              </select>
              {errors.jenis && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.jenis.message}
                </p>
              )}
            </div>

            {/* Kode Klasifikasi */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Tag className="w-3 h-3 text-sky-600" /> Kode Klasifikasi
              </label>
              <input
                {...register("kode_klasifikasi")}
                type="text"
                placeholder="Misal: HK.01"
                className="w-full px-4 py-3 uppercase placeholder:capitalize bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              {errors.kode_klasifikasi && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.kode_klasifikasi.message}
                </p>
              )}
            </div>

            {/* Indeks Berkas */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <FolderOpen className="w-3 h-3 text-sky-600" /> Indeks Berkas
              </label>
              <input
                {...register("indeks_berkas")}
                type="text"
                placeholder="Kata tangkap / Indexing"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              {errors.indeks_berkas && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.indeks_berkas.message}
                </p>
              )}
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <AlignLeft className="w-3 h-3 text-sky-600" /> Kategori Surat
              </label>
              <select
                {...register("kategori")}
                defaultValue=""
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 appearance-none"
              >
                <option value="" disabled className="text-slate-400">
                  Pilih Kategori...
                </option>
                <option value="SDM">SDM</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Umum">Umum</option>
                <option value="Akademik">Akademik</option>
                <option value="Internal">Internal</option>
              </select>
              {errors.kategori && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.kategori.message}
                </p>
              )}
            </div>

            {/* tujuan */}
            {watch("jenis") === "keluar" && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <FolderOpen className="w-3 h-3 text-sky-600" /> Tujuan Surat
                </label>
                <input
                  {...register("tujuan_surat")}
                  type="text"
                  placeholder="Mis. Gedung A"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
                {errors.tujuan_surat && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.tujuan_surat.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-y border-slate-200 px-8 py-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Detail Isi Surat
            </h2>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Asal Surat */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <Users className="w-3 h-3 text-sky-600" /> Asal Surat
                  (Pengirim)
                </label>
                <input
                  {...register("asal_surat")}
                  type="text"
                  placeholder="Instansi / Perusahaan Pengirim"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
                {errors.asal_surat && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.asal_surat.message}
                  </p>
                )}
              </div>

              {/* Tanggal Surat */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <Calendar className="w-3 h-3 text-sky-600" /> Tanggal Pada
                  Surat
                </label>
                <input
                  {...register("tanggal")}
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900"
                />
                {errors.tanggal && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.tanggal.message}
                  </p>
                )}
              </div>
            </div>

            {/* Isi Ringkas */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <AlignLeft className="w-3 h-3 text-sky-600" /> Isi Ringkas /
                Perihal
              </label>
              <textarea
                {...register("ringkasan")}
                rows={3}
                placeholder="Tuliskan ringkasan perihal atau isi surat..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 resize-none placeholder:text-slate-400"
              />
              {errors.ringkasan && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.ringkasan.message}
                </p>
              )}
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Info className="w-3 h-3 text-sky-600" /> Keterangan (Opsional)
              </label>
              <textarea
                {...register("keterangan")}
                rows={2}
                placeholder="Catatan tambahan jika ada..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-900 resize-none placeholder:text-slate-400"
              />
              {errors.keterangan && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.keterangan.message}
                </p>
              )}
            </div>

            {/* Upload File */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Paperclip className="w-3 h-3 text-sky-600" /> Upload File Fisik
                (PDF/Gambar)
              </label>
              <input
                {...register("file")}
                type="file"
                accept=".pdf, image/jpeg, image/png, image/jpg"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10 outline-none transition-all font-medium text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-sky-100 file:text-sky-800 hover:file:bg-sky-200 cursor-pointer"
              />
              {errors.file && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.file.message as string}
                </p>
              )}
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Format: PDF, JPG, PNG. Maksimal 5MB.
              </p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Batalkan
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-10 py-3.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-900/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Simpan Surat
          </button>
        </div>
      </form>
    </div>
  );
}
