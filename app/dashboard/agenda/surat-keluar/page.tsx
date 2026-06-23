"use client";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Calendar, Printer, PrinterCheck, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ambilDataSurat, rentangSurat } from "@/services/surat";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { useUser } from "@/context/UserProvider";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Surat {
  id: number;
  indeks_berkas: string;
  kode_klasifikasi: string;
  tujuan_surat: string;
  nomor_surat: string;
  ringkasan: string;
  tanggal: string;
  nomor_agenda: string;
}

const dataBreadcrumbs = [
  { name: "dashboard", to: "/dashboard" },
  { name: "agenda", to: "#" },
  { name: "surat keluar", to: "/dashboard/agenda/surat-keluar" },
];

export default function HalamanAgendaSuratKeluar() {
  const router = useRouter();
  const { instansi } = useUser();
  const [dariTanggal, setDariTanggal] = useState<Date | null>(null);
  const [sampaiTanggal, setSampaiTanggal] = useState<Date | null>(null);

  const [data, setData] = useState<Surat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Ref untuk komponen yang akan dicetak
  const componentRef = useRef<HTMLDivElement>(null);

  // Fungsi Cetak
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Agenda_Surat_Keluar_${dariTanggal ? format(dariTanggal, "yyyy-MM-dd") : ""}`,
  });

  // Fungsi pemicu API
  const handleTampilkanData = async () => {
    if (!dariTanggal || !sampaiTanggal) return;

    setIsLoading(true);
    setHasFetched(true);
    try {
      const response = await rentangSurat(dariTanggal, sampaiTanggal, "keluar");
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomInput = ({ value, onClick, placeholder }: any) => (
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

  return (
    <main className="min-h-screen bg-slate-50/50 pb-10 px-4 md:px-0">
      <header className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
          <Printer size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Agenda Surat Keluar
          </h1>
          <p className="text-slate-500 text-sm">
            Pilih rentang waktu untuk mencetak agenda surat.
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
              onChange={(date: any) => setDariTanggal(date)}
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
              onChange={(date: any) => setSampaiTanggal(date)}
              dateFormat="dd/MM/yyyy"
              customInput={<CustomInput placeholder="Pilih tanggal akhir" />}
            />
          </div>

          <button
            onClick={handleTampilkanData}
            disabled={!dariTanggal || !sampaiTanggal || isLoading}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-md font-bold text-sm transition-all flex items-center gap-2 disabled:bg-slate-200"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Tampilkan Data"
            )}
          </button>

          <button
            onClick={() => {
              if (isLoading || data.length === 0) return;
              if (!instansi[0]) {
                Swal.fire({
                  title: "Peringatan!",
                  text: "Silahkan isi formulir identitas instansi Anda",
                  icon: "warning",
                }).then((result) => {
                  if (result.isConfirmed) {
                    router.push("/dashboard/setup/instansi");
                  }
                });
                return;
              }
              handlePrint();
            }}
            disabled={data.length === 0 || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-orange-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            <PrinterCheck size={18} /> Cetak Agenda
          </button>
        </div>
      </section>

      {/* Table Section */}
      {hasFetched && (
        <div className="mt-8 bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-tighter">
                  <th className="px-6 py-4 w-20">No. Agenda</th>
                  <th className="px-6 py-4">Tujuan</th>
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
                  // Menampilkan semua data langsung tanpa slice
                  data.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        {item.nomor_agenda}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {item.tujuan_surat}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">
                          {item.nomor_surat}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {item.tanggal}
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
        </div>
      )}

      {/* area khusus print */}
      <div className="mt-8 bg-white print:p-0 hidden">
        <div
          ref={componentRef}
          className=" px-16 print:p-4 mt-8 mx-auto max-w-4xl"
        >
          {data.map((item, index) => (
            <div
              key={item.id}
              className="mb-20 last:mb-0 print:break-after-page"
            >
              {/* KOP SURAT */}
              <div className="flex flex-col items-center border-b-2 border-black pb-2 mb-1">
                <div className="flex w-full items-center justify-center gap-4">
                  <div className="text-center">
                    <h3 className="text-lg uppercase leading-tight">
                      {instansi[0]?.nama_instansi}
                    </h3>
                    <small className="text-[.7rem]">{instansi[0]?.email}</small>
                    <p className="text-sm">
                      Akreditas {instansi[0]?.akreditasi}
                    </p>
                    <p className="text-xs italic">{instansi[0]?.alamat}</p>
                  </div>
                </div>
              </div>

              {/* JUDUL */}
              <div className="border border-black bg-white p-1 text-center mb-0">
                <h1 className="font-bold uppercase tracking-widest">
                  Lembar Surat Keluar
                </h1>
              </div>

              <div className="border-x border-b border-black text-[12px]">
                {/* Baris 1 */}
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-2 border-r border-black flex">
                    <span className="w-32">Indeks Berkas</span>
                    <span>: {item.indeks_berkas || "09"}</span>
                  </div>
                  <div className="w-1/2 p-2 flex">
                    <span className="w-32">Kode</span>
                    <span>: {item.kode_klasifikasi || "90"}</span>
                  </div>
                </div>

                {/* Baris 2 */}
                <div className="p-2 border-b border-black flex">
                  <span className="w-32">Tanggal Surat</span>
                  <span>: {item.tanggal}</span>
                </div>

                {/* Baris 3 */}
                <div className="p-2 border-b border-black flex">
                  <span className="w-32">Nomor Surat</span>
                  <span>: {item.nomor_surat}</span>
                </div>

                {/* Baris 4 */}
                <div className="p-2 border-b border-black flex">
                  <span className="w-32">Tujuan Surat</span>
                  <span>: {item.tujuan_surat}</span>
                </div>

                {/* Baris 5 */}
                <div className="p-2 border-b border-black flex font-bold italic uppercase">
                  <span className="w-32">Isi Ringkas</span>
                  <span>: {item.ringkasan}</span>
                </div>

                {/* Baris 6 */}
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-2 border-r border-black flex">
                    <span className="w-32">Diterima Tanggal</span>
                    <span>: {item.tanggal}</span>
                  </div>
                  <div className="w-1/2 p-2 flex">
                    <span className="w-32">No. Agenda</span>
                    <span>: {item.nomor_agenda}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
