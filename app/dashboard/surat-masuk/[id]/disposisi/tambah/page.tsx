"use client";
import { tambahDisposisi } from "@/services/surat";
import {
  ChevronLeft,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { z } from "zod";
import { pesanError } from "@/lib/error";

// Skema Validasi Zod
const disposisiSchema = z.object({
  sifat: z.string().min(1, "Sifat harus dipilih"),
  tujuan: z.string().min(3, "Tujuan minimal 3 karakter"),
  deadline: z.string().min(1, "Batas waktu harus diisi"),
  isi: z.string().min(5, "Isi instruksi minimal 5 karakter"),
  catatan: z.string().optional(),
});

type DisposisiFormData = z.infer<typeof disposisiSchema>;

export default function TambahDisposisiPage() {
  const params = useParams();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DisposisiFormData, string>>
  >({});


  // State untuk form
  const [formData, setFormData] = useState<DisposisiFormData>({
    sifat: "Biasa",
    tujuan: "",
    deadline: "",
    isi: "",
    catatan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi menggunakan Zod
    const result = disposisiSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Partial<Record<keyof DisposisiFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as keyof DisposisiFormData] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await tambahDisposisi({ surat_id: String(params.id), ...result.data });

      await Swal.fire({
        title: "Berhasil!",
        text: "Data disposisi telah disimpan.",
        icon: "success",
        confirmButtonColor: "#0284c7",
      });

      router.back();
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: pesanError(err, "Terjadi kesalahan sistem."),
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tambah Disposisi
          </h1>
          <p className="text-slate-500 text-sm">Input data disposisi baru.</p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sifat */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Sifat
              </label>
              <select
                className={`w-full p-2.5 rounded-lg border ${errors.sifat ? "border-red-500" : "border-slate-300"} outline-none transition-all`}
                value={formData.sifat}
                onChange={(e) =>
                  setFormData({ ...formData, sifat: e.target.value })
                }
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
              {errors.sifat && (
                <p className="text-xs text-red-500">{errors.sifat}</p>
              )}
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Batas Waktu
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  className={`w-full pl-10 p-2.5 rounded-lg border ${errors.deadline ? "border-red-500" : "border-slate-300"} outline-none transition-all`}
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>
              {errors.deadline && (
                <p className="text-xs text-red-500">{errors.deadline}</p>
              )}
            </div>
          </div>

          {/* Tujuan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Tujuan
            </label>
            <input
              type="text"
              placeholder="Contoh: Kabid IT"
              className={`w-full p-2.5 rounded-lg border ${errors.tujuan ? "border-red-500" : "border-slate-300"} outline-none transition-all`}
              value={formData.tujuan}
              onChange={(e) =>
                setFormData({ ...formData, tujuan: e.target.value })
              }
            />
            {errors.tujuan && (
              <p className="text-xs text-red-500">{errors.tujuan}</p>
            )}
          </div>

          {/* Isi */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Instruksi
            </label>
            <textarea
              rows={4}
              placeholder="Isi disposisi..."
              className={`w-full p-2.5 rounded-lg border ${errors.isi ? "border-red-500" : "border-slate-300"} outline-none transition-all resize-none`}
              value={formData.isi}
              onChange={(e) =>
                setFormData({ ...formData, isi: e.target.value })
              }
            />
            {errors.isi && <p className="text-xs text-red-500">{errors.isi}</p>}
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              className="w-full p-2.5 rounded-lg border border-slate-300 outline-none transition-all resize-none"
              value={formData.catatan}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </main>
  );
}
