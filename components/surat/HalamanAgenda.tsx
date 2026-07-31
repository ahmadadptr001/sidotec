"use client";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Calendar, Printer, PrinterCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { rentangSurat } from "@/services/surat";
import { useUser } from "@/context/UserProvider";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { bukaJendelaCetak, htmlBukuAgenda } from "@/lib/cetak";
import { formatTanggalSingkat } from "@/lib/format";
import { pesanError } from "@/lib/error";

interface Surat {
  id: number;
  indeks_berkas: string;
  kode_klasifikasi: string;
  asal_surat: string;
  tujuan_surat: string | null;
  nomor_surat: string;
  ringkasan: string;
  tanggal: string;
  nomor_agenda: string;
  keterangan: string | null;
  jenis: string;
  kategori: string;
}

interface HalamanAgendaProps {
  jenis: "masuk" | "keluar";
}

/**
 * Didefinisikan di luar komponen. Ketika dideklarasikan di dalam render, React
 * menganggapnya komponen baru setiap render sehingga state internal DatePicker
 * ikut ter-reset.
 */
function CustomInput({
  value,
  onClick,
  placeholder,
}: {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 bg-white border border-slate-200 hover:border-blue-500 transition-all p-3 min-w-55 rounded-md cursor-pointer shadow-sm"
    >
      <Calendar className="text-slate-400 group-hover:text-blue-500 w-4 h-4" />
      <span
        className={`text-sm font-semibold ${value ? "text-slate-900" : "text-slate-400"}`}
      >
        {value || placeholder}
      </span>
    </div>
  );
}

export default function HalamanAgenda({ jenis }: HalamanAgendaProps) {
  const router = useRouter();
  const { user, instansi } = useUser();
  const suratKeluar = jenis === "keluar";

  const [dariTanggal, setDariTanggal] = useState<Date | null>(null);
  const [sampaiTanggal, setSampaiTanggal] = useState<Date | null>(null);
  const [rentangTercetak, setRentangTercetak] = useState<{
    dari: Date;
    sampai: Date;
  } | null>(null);

  const [data, setData] = useState<Surat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const dataBreadcrumbs = [
    { name: "dashboard", to: "/dashboard" },
    { name: "agenda", to: "#" },
    {
      name: suratKeluar ? "surat keluar" : "surat masuk",
      to: `/dashboard/agenda/surat-${jenis}`,
    },
  ];

  const handleTampilkanData = async () => {
    if (!dariTanggal || !sampaiTanggal) return;

    if (dariTanggal > sampaiTanggal) {
      Swal.fire({
        title: "Rentang tanggal tidak valid",
        text: "Tanggal awal tidak boleh melebihi tanggal akhir.",
        icon: "warning",
      });
      return;
    }

    setIsLoading(true);
    setHasFetched(true);
    try {
      const response = await rentangSurat(dariTanggal, sampaiTanggal, jenis);
      setData(response?.data ?? []);
      setRentangTercetak({ dari: dariTanggal, sampai: sampaiTanggal });
    } catch (error) {
      console.error(error);
      setData([]);
      Swal.fire({
        title: "Gagal mengambil data",
        text: pesanError(error),
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCetak = () => {
    if (isLoading || data.length === 0 || !rentangTercetak) return;

    // Kop surat butuh identitas instansi; tanpa itu hasil cetak tidak layak
    // dijadikan dokumen resmi.
    if (!instansi?.[0]) {
      Swal.fire({
        title: "Identitas instansi belum lengkap",
        text: "Isi formulir identitas instansi terlebih dahulu agar kop surat dapat dicetak.",
        icon: "warning",
        confirmButtonText: "Isi Sekarang",
        showCancelButton: true,
        cancelButtonText: "Nanti",
      }).then((result) => {
        if (result.isConfirmed) router.push("/dashboard/setup/instansi");
      });
      return;
    }

    const berhasil = bukaJendelaCetak(
      `Buku Agenda Surat ${suratKeluar ? "Keluar" : "Masuk"}`,
      htmlBukuAgenda(data, instansi[0], user, jenis, rentangTercetak),
    );

    if (!berhasil) {
      Swal.fire({
        title: "Jendela cetak diblokir",
        text: "Izinkan pop-up untuk situs ini agar dokumen dapat dicetak.",
        icon: "warning",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-10 px-4 md:px-0">
      <header className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
          <Printer size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Agenda Surat {suratKeluar ? "Keluar" : "Masuk"}
          </h1>
          <p className="text-slate-500 text-sm">
            Pilih rentang tanggal surat untuk mencetak buku agenda.
          </p>
        </div>
      </header>

      <Breadcrumbs data={dataBreadcrumbs} />

      {/* Filter Section */}
      <section className="bg-white p-6 rounded-md border border-slate-200 shadow-sm mt-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">
              Dari Tanggal
            </p>
            <DatePicker
              selected={dariTanggal}
              onChange={(date: Date | null) => setDariTanggal(date)}
              dateFormat="dd/MM/yyyy"
              customInput={<CustomInput placeholder="Pilih tanggal mulai" />}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">
              Sampai Tanggal
            </p>
            <DatePicker
              selected={sampaiTanggal}
              onChange={(date: Date | null) => setSampaiTanggal(date)}
              dateFormat="dd/MM/yyyy"
              minDate={dariTanggal ?? undefined}
              customInput={<CustomInput placeholder="Pilih tanggal akhir" />}
            />
          </div>

          <button
            onClick={handleTampilkanData}
            disabled={!dariTanggal || !sampaiTanggal || isLoading}
            className="bg-slate-900 hover:bg-black h-fit text-white px-6 py-3 rounded-md font-bold text-sm transition-all flex items-center gap-2 disabled:bg-slate-200"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Tampilkan Data"
            )}
          </button>

          <button
            onClick={handleCetak}
            disabled={data.length === 0 || isLoading}
            className="bg-orange-600 h-fit hover:bg-orange-700 text-white px-6 py-3 rounded-md font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-orange-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            <PrinterCheck size={18} /> Cetak Agenda
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          Filter memakai <strong>tanggal surat</strong>, dan kedua batas tanggal
          ikut disertakan.
        </p>
      </section>

      {/* Table Section */}
      {hasFetched && (
        <div className="mt-8 bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-tighter">
                  <th className="px-6 py-4 w-20">No. Agenda</th>
                  <th className="px-6 py-4">
                    {suratKeluar ? "Tujuan" : "Asal Surat"}
                  </th>
                  <th className="px-6 py-4">No. Surat / Tgl</th>
                  <th className="px-6 py-4">Isi Ringkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-6 text-center text-sm text-slate-500"
                    >
                      Sedang mengambil data..
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-400 italic"
                    >
                      Tidak ada data ditemukan untuk rentang waktu tersebut.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        {item.nomor_agenda}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {(suratKeluar ? item.tujuan_surat : item.asal_surat) || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">
                          {item.nomor_surat}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {formatTanggalSingkat(item.tanggal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 leading-relaxed">
                        {item.ringkasan}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && data.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium">
              Total <span className="font-bold text-slate-800">{data.length}</span>{" "}
              surat pada rentang tanggal ini.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
