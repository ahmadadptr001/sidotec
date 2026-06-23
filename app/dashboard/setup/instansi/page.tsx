"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Building,
  Mail,
  Globe,
  Phone,
  MapPin,
  Award,
  GraduationCap,
  Save,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { useUser } from "@/context/UserProvider";
import { simpanDataInstansi } from "@/services/instansi";

const formSchema = z.object({
  nama_instansi: z.string().min(3, "Nama instansi minimal 3 karakter"),
  status: z.enum(["Negeri", "Swasta", "Kedinasan"], {
    message: "Pilih status instansi yang valid",
  }),
  alamat: z.string().min(10, "Alamat terlalu pendek, mohon lengkapi"),
  website: z
    .string()
    .url("Format URL tidak valid (contoh: https://kampus.ac.id)"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  nomor_telpon: z.string().min(6, "Nomor telepon tidak valid"),
  akreditasi: z.enum(
    ["Unggul", "A", "Baik Sekali", "B", "Baik", "C", "Belum Terakreditasi"],
    { message: "Pilih status akreditasi yang valid" },
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function FormProfilInstansi() {
  const { instansi, setInstansi } = useUser();
  const [id, setId] = useState(instansi[0]?.id);
  const [formData, setFormData] = useState<FormData>({
    nama_instansi: instansi[0]?.nama_instansi || "",
    status: instansi[0]?.status || "Negeri",
    alamat: instansi[0]?.alamat || "",
    website: instansi[0]?.website || "",
    email: instansi[0]?.email || "",
    nomor_telpon: instansi[0]?.nomor_telpon || "",
    akreditasi: instansi[0]?.akreditasi || "Belum Terakreditasi",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error saat user mulai mengetik ulang
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBatalkan = () => {
    setFormData({
      nama_instansi: "",
      status: "Negeri",
      alamat: "",
      website: "",
      email: "",
      nomor_telpon: "",
      akreditasi: "Belum Terakreditasi",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi data dengan Zod
    const result = formSchema.safeParse(formData);

    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    if (!result.success) {
      // Mapping error dari Zod ke state error
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormData;
        if (path) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      Swal.close();
      return;
    }

    // Jika validasi sukses (Siap dikirim ke database)
    console.log("Data siap dikirim:", result.data);
    try {
      const response = await simpanDataInstansi(id, result.data);
      setInstansi([formData]);
      Swal.close();
      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Profil Berhasil Disimpan!",
          text:
            "Data instansi " + result.data.nama_instansi + " telah diperbarui.",
        });
      }
    } catch (err: any) {
      Swal.close();
      Swal.fire({
        title: "Gagal menyimpan data!",
        text: err.message || "Terjadi kesalahan pada server",
        icon: "error",
      });
    }
  };

  return (
    <div className="">
      {/* Header Halaman */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Building className="w-5 h-5" />
            </div>
            Profil Instansi / Kampus
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola informasi dasar, legalitas, dan kontak institusi.
          </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-8">
          {/* Grid Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kiri: Informasi Dasar & Kontak */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-700 pb-2 border-b border-indigo-100 uppercase tracking-wider">
                Informasi & Kontak
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Nama Instansi / Kampus
                </label>
                <div className="relative group">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    name="nama_instansi"
                    value={formData.nama_instansi}
                    onChange={handleChange}
                    placeholder="Contoh: Universitas Nusantara"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.nama_instansi
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/5"
                    } rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                </div>
                {errors.nama_instansi && (
                  <p className="text-red-500 text-[11px]">
                    {errors.nama_instansi}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Email Resmi
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@kampus.ac.id"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/5"
                    } rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[11px]">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Nomor Telepon / Fax
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    name="nomor_telpon"
                    value={formData.nomor_telpon}
                    onChange={handleChange}
                    placeholder="08xx"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.nomor_telpon
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/5"
                    } rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                </div>
                {errors.nomor_telpon && (
                  <p className="text-red-500 text-[11px]">
                    {errors.nomor_telpon}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Website / URL
                </label>
                <div className="relative group">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.kampus.ac.id"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.website
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/5"
                    } rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm`}
                  />
                </div>
                {errors.website && (
                  <p className="text-red-500 text-[11px]">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Kanan: Legalitas & Alamat */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-700 pb-2 border-b border-indigo-100 uppercase tracking-wider">
                Legalitas & Lokasi
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 text-nowrap">
                    Status Instansi
                  </label>
                  <div className="relative group">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-normal appearance-none cursor-pointer"
                    >
                      <option value="Negeri">Negeri (PTN)</option>
                      <option value="Swasta">Swasta (PTS)</option>
                      <option value="Kedinasan">Kedinasan (PTK)</option>
                    </select>
                  </div>
                  {errors.status && (
                    <p className="text-red-500 text-[11px]">{errors.status}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 text-nowrap">
                    Akreditasi
                  </label>
                  <div className="relative group">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      name="akreditasi"
                      value={formData.akreditasi}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-normal appearance-none cursor-pointer"
                    >
                      <option value="Unggul">Unggul</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="Belum Terakreditasi">
                        Belum Terakreditasi
                      </option>
                    </select>
                  </div>
                  {errors.akreditasi && (
                    <p className="text-red-500 text-[11px]">
                      {errors.akreditasi}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Alamat Lengkap
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Masukkan alamat lengkap instansi beserta kode pos..."
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.alamat
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/5"
                    } rounded-xl outline-none focus:bg-white focus:ring-4 transition-all text-sm resize-none`}
                  ></textarea>
                </div>
                {errors.alamat && (
                  <p className="text-red-500 text-[11px]">{errors.alamat}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-slate-400 italic">
            * Pastikan data instansi sesuai dengan dokumen legal yang berlaku.
          </p>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleBatalkan}
              type="button"
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan Profil
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
