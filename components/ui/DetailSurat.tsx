import {
  Calendar,
  ExternalLink,
  FileText,
  Hash,
  ImageIcon,
  Printer,
  Tag,
  User,
  X,
} from "lucide-react";
import { formatTanggalIndonesia } from "@/lib/format";
import type { Surat } from "@/lib/tipe";

interface detailSuratProps {
  item: Surat;
  setViewDetail: (item: Surat | null) => void;
  /** Dipasok halaman pemanggil agar tombol cetak memakai kop surat instansinya. */
  onPrint?: (item: Surat) => void;
}

export default function DetailSurat({
  item,
  setViewDetail,
  onPrint,
}: detailSuratProps) {
  const isImageFile = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url);
  };

  const suratKeluar = String(item?.jenis).toLowerCase() === "keluar";

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-600 rounded-md flex items-center justify-center text-white shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            Pratinjau Arsip
          </h2>
        </div>
        <button
          onClick={() => setViewDetail(null)}
          className="p-2 hover:bg-slate-200/50 rounded-full transition-all"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm">
        <section className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ringkasan / Perihal
          </label>
          <p className="text-lg font-bold text-slate-900 leading-snug">
            {item.ringkasan}
          </p>
          <p className="text-slate-600 mt-2">{item.keterangan}</p>
        </section>

        <div className="grid grid-cols-1 gap-5 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Nomor Surat
              </p>
              <p className="font-mono font-bold text-slate-700">
                {item.nomor_surat}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {suratKeluar ? "Tujuan Surat" : "Asal Surat"}
              </p>
              <p className="font-bold text-slate-800">
                {(suratKeluar ? item.tujuan_surat : item.asal_surat) || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Kategori & Klasifikasi
              </p>
              <p className="font-bold text-slate-800">
                {item.kategori} - {item.kode_klasifikasi}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Tanggal Surat
              </p>
              <p className="font-bold text-slate-800">
                {formatTanggalIndonesia(item.tanggal)}
              </p>
            </div>
          </div>
        </div>

        {/* Tampilan Lampiran File (Gambar / PDF) */}
        {item.file && (
          <div className="pt-6 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
              Lampiran Berkas
            </label>

            {isImageFile(item.file) ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden group relative">
                <img
                  src={item.file}
                  alt="Lampiran Surat"
                  className="w-full h-auto object-cover max-h-48"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={item.file}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white text-slate-900 rounded-md font-bold text-xs flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" /> Buka Gambar
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex p-4 border border-slate-200 rounded-lg bg-slate-50 items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Dokumen Lampiran
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF / Dokumen lainnya
                    </p>
                  </div>
                </div>
                <a
                  href={item.file}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-md text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  Buka <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {onPrint && (
          <div className="pt-8 flex flex-col gap-3 shrink-0 pb-6">
            <button
              type="button"
              onClick={() => onPrint(item)}
              className="w-full py-3 bg-sky-600 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all shadow-md shadow-sky-200 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Cetak Lembar Pengantar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
