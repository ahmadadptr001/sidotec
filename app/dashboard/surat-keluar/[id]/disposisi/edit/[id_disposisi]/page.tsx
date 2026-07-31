"use client";
import { ambilDataDisposisiById, simpanDisposisi } from "@/services/surat"; // Pastikan service ini ada
import { ChevronLeft, Calendar, Save, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { z } from "zod";
import { pesanError } from "@/lib/error";

// Skema Validasi Zod (Sama dengan Tambah)
const disposisiSchema = z.object({
  surat_id: z.string(),
  sifat: z.string().min(1, "Sifat harus dipilih"),
  tujuan: z.string().min(3, "Tujuan minimal 3 karakter"),
  deadline: z.string().min(1, "Batas waktu harus diisi"),
  isi: z.string().min(5, "Isi instruksi minimal 5 karakter"),
  catatan: z.string().optional(),
});

type DisposisiFormData = z.infer<typeof disposisiSchema>;

export default function EditDisposisiPage() {
  const params = useParams();
  const router = useRouter();


  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DisposisiFormData, string>>
  >({});

  const [formData, setFormData] = useState<DisposisiFormData>({
    surat_id: "",
    sifat: "Biasa",
    tujuan: "",
    deadline: "",
    isi: "",
    catatan: "",
  });

  // Ambil data lama berdasarkan ID disposisi
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!params.id_disposisi) return;
      try {
        const res = await ambilDataDisposisiById(String(params.id_disposisi));
        if (res?.data) {
          setFormData({
            surat_id: String(params.id),
            sifat: res.data.sifat || "Biasa",
            tujuan: res.data.tujuan || "",
            deadline: res.data.deadline || "",
            isi: res.data.isi || "",
            catatan: res.data.catatan || "",
          });
        }
      } catch {
        Swal.fire("Error", "Gagal mengambil data disposisi", "error");
        router.back();
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingData();
  }, [params.id, params.id_disposisi, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
      await simpanDisposisi(result.data, String(params.id_disposisi));

      await Swal.fire({
        title: "Berhasil Diperbarui",
        text: "Perubahan disposisi telah disimpan.",
        icon: "success",
        confirmButtonColor: "#0284c7",
      }).then((result) => {
        if (result.isConfirmed) router.back();
      });
    } catch (err) {
      Swal.fire(
        "Gagal!",
        pesanError(err, "Terjadi kesalahan saat update."),
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading screen saat fetch data lama
  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-sky-600" size={40} />
        <p className="text-slate-500">Mengambil data...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-800">Edit Disposisi</h1>
          <p className="text-slate-500 text-sm">
            Ubah detail instruksi disposisi.
          </p>
        </div>
      </div>

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
                className={`w-full p-2.5 rounded-lg border ${errors.sifat ? "border-red-500" : "border-slate-300"} outline-none`}
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
                  className={`w-full pl-10 p-2.5 rounded-lg border ${errors.deadline ? "border-red-500" : "border-slate-300"} outline-none`}
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
              className={`w-full p-2.5 rounded-lg border ${errors.tujuan ? "border-red-500" : "border-slate-300"} outline-none`}
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
              className={`w-full p-2.5 rounded-lg border ${errors.isi ? "border-red-500" : "border-slate-300"} outline-none resize-none`}
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
              className="w-full p-2.5 rounded-lg border border-slate-300 outline-none resize-none"
              value={formData.catatan}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
            />
          </div>
        </div>

        {/* Footer */}
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
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSubmitting ? "Menyimpan..." : "Update Disposisi"}
          </button>
        </div>
      </form>
    </main>
  );
}
