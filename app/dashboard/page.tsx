"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { ArrowUpRight, Clock, FileText, Users, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { jumlahPengguna } from "@/services/user";
import { ambilDataSurat, ambilDataDisposisi } from "@/services/surat";
import { formatTanggalIndonesia, formatTanggalLokal, parseTanggal } from "@/lib/format";
import { KATEGORI_SURAT } from "@/lib/tabel";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

interface Surat {
  id: number;
  nomor_surat: string;
  jenis: string;
  kategori: string;
  tanggal: string;
  ringkasan: string;
}

interface Disposisi {
  id: number;
  surat_id: string;
  tujuan: string;
  deadline: string;
}

const WARNA_KATEGORI = ["#059669", "#3b82f6", "#f59e0b", "#64748b", "#8b5cf6"];
const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DashboardPage() {
  const [suratMasuk, setSuratMasuk] = useState<Surat[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<Surat[]>([]);
  const [disposisi, setDisposisi] = useState<Disposisi[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Tanpa batas 100 per jenis, sehingga kartu statistik tidak berhenti
      // bertambah setelah arsip melewati angka itu.
      const [masuk, keluar, disp, totalPengguna] = await Promise.all([
        ambilDataSurat("masuk"),
        ambilDataSurat("keluar"),
        ambilDataDisposisi(),
        jumlahPengguna(),
      ]);

      setSuratMasuk(masuk?.data ?? []);
      setSuratKeluar(keluar?.data ?? []);
      setDisposisi(disp?.data ?? []);
      setTotalUsers(totalPengguna);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const semuaSurat = useMemo(
    () => [...suratMasuk, ...suratKeluar],
    [suratMasuk, suratKeluar],
  );

  /**
   * Tren 7 hari terakhir dihitung dari kolom `tanggal` tiap surat.
   * Sebelumnya angka grafik hanya total dibagi bilangan tetap (total/2, total/1.8,
   * dst.) sehingga bentuk kurvanya tidak mencerminkan data apa pun.
   */
  const trenMingguan = useMemo(() => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const hari: { label: string; kunci: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const tanggal = new Date(hariIni);
      tanggal.setDate(tanggal.getDate() - i);
      hari.push({
        label: `${NAMA_HARI[tanggal.getDay()]} ${tanggal.getDate()}`,
        kunci: formatTanggalLokal(tanggal),
      });
    }

    const hitung = (daftar: Surat[]) => {
      const perTanggal = new Map<string, number>();
      for (const surat of daftar) {
        const tanggal = parseTanggal(surat.tanggal);
        if (!tanggal) continue;
        const kunci = formatTanggalLokal(tanggal);
        perTanggal.set(kunci, (perTanggal.get(kunci) ?? 0) + 1);
      }
      return hari.map(({ kunci }) => perTanggal.get(kunci) ?? 0);
    };

    return {
      labels: hari.map((h) => h.label),
      masuk: hitung(suratMasuk),
      keluar: hitung(suratKeluar),
      periode: `${formatTanggalIndonesia(hari[0].kunci)} – ${formatTanggalIndonesia(hari[6].kunci)}`,
    };
  }, [suratMasuk, suratKeluar]);

  /** Distribusi kategori: jumlah asli + persentase untuk label. */
  const distribusiKategori = useMemo(() => {
    const jumlah = new Map<string, number>(KATEGORI_SURAT.map((k) => [k, 0]));
    let terklasifikasi = 0;

    for (const surat of semuaSurat) {
      if (jumlah.has(surat.kategori)) {
        jumlah.set(surat.kategori, (jumlah.get(surat.kategori) ?? 0) + 1);
        terklasifikasi += 1;
      }
    }

    const labels = [...jumlah.keys()];
    const nilai = [...jumlah.values()];
    const pembagi = terklasifikasi || 1;

    return {
      labels,
      nilai,
      persen: nilai.map((v) => Math.round((v / pembagi) * 100)),
      terklasifikasi,
    };
  }, [semuaSurat]);

  const ringkasanDisposisi = useMemo(() => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tigaHari = new Date(hariIni);
    tigaHari.setDate(tigaHari.getDate() + 3);

    let aktif = 0;
    let terlambat = 0;
    let mendekatiTenggat = 0;

    for (const item of disposisi) {
      const deadline = parseTanggal(item.deadline);
      if (!deadline) continue;
      deadline.setHours(0, 0, 0, 0);

      if (deadline < hariIni) {
        terlambat += 1;
        continue;
      }
      aktif += 1;
      if (deadline <= tigaHari) mendekatiTenggat += 1;
    }

    const idSuratBerdisposisi = new Set(
      disposisi.map((d) => String(d.surat_id)),
    );
    const tanpaDisposisi = semuaSurat.filter(
      (s) => !idSuratBerdisposisi.has(String(s.id)),
    ).length;

    return { aktif, terlambat, mendekatiTenggat, tanpaDisposisi };
  }, [disposisi, semuaSurat]);

  const lineData = {
    labels: trenMingguan.labels,
    datasets: [
      {
        fill: true,
        label: "Surat Masuk",
        data: trenMingguan.masuk,
        borderColor: "rgb(5, 150, 105)",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
      },
      {
        fill: true,
        label: "Surat Keluar",
        data: trenMingguan.keluar,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: distribusiKategori.labels,
    datasets: [
      {
        data: distribusiKategori.nilai,
        backgroundColor: WARNA_KATEGORI,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { display: false },
        border: { display: false },
        beginAtZero: true,
        // Jumlah surat selalu bilangan bulat.
        ticks: { precision: 0 },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  const statsData = [
    {
      label: "Total Berkas",
      val: semuaSurat.length.toLocaleString("id-ID"),
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Disposisi Aktif",
      val: ringkasanDisposisi.aktif,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Jumlah Pengguna",
      val: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Disposisi",
      val: disposisi.length,
      icon: ArrowUpRight,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  const aktivitasTerakhir = useMemo(
    () =>
      [...semuaSurat]
        .sort((a, b) => {
          const waktuA = parseTanggal(a.tanggal)?.getTime() ?? 0;
          const waktuB = parseTanggal(b.tanggal)?.getTime() ?? 0;
          return waktuB - waktuA;
        })
        .slice(0, 3),
    [semuaSurat],
  );

  return (
    <div className="space-y-8">
      <div className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? "…" : stat.val}
                </h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-md`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart: Tren Surat */}
        <div className="lg:col-span-2 bg-white p-8 rounded-md border border-gray-100 shadow-sm">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Tren Lalu Lintas Surat
              </h2>
              <p className="text-sm text-gray-400 font-medium">
                7 hari terakhir &middot; {trenMingguan.periode}
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center text-xs font-bold text-gray-500">
                <span className="w-3 h-3 bg-emerald-600 rounded-full mr-2" /> Masuk
              </div>
              <div className="flex items-center text-xs font-bold text-gray-500">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2" /> Keluar
              </div>
            </div>
          </div>
          <div className="h-75">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart: Distribusi Kategori */}
        <div className="bg-white p-8 rounded-md border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Kategori Surat</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">
            Distribusi bidang surat
          </p>
          <div className="h-55 relative">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                cutout: "70%",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Angka tengah kini jumlah surat terklasifikasi, bukan teks "100%" tetap. */}
              <span className="text-3xl font-black text-gray-800">
                {distribusiKategori.terklasifikasi}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Terklasifikasi
              </span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {distribusiKategori.labels.map((label, i) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: WARNA_KATEGORI[i] }}
                  />
                  <span className="font-bold text-gray-600">{label}</span>
                </div>
                <span className="font-black text-gray-900">
                  {distribusiKategori.nilai[i]}{" "}
                  <span className="text-xs font-bold text-gray-400">
                    ({distribusiKategori.persen[i]}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aktivitas Terakhir */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Aktivitas Terakhir</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {aktivitasTerakhir.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">
                {loading ? "Memuat data..." : "Belum ada surat yang tercatat."}
              </p>
            ) : (
              aktivitasTerakhir.map((surat) => (
                <div
                  key={surat.id}
                  className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs shrink-0">
                      {surat.jenis === "masuk" ? "M" : "K"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        Surat {surat.jenis === "masuk" ? "Masuk" : "Keluar"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {surat.ringkasan || "Tanpa ringkasan"} —{" "}
                        <span className="text-sky-600">{surat.nomor_surat}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">
                    {formatTanggalIndonesia(surat.tanggal)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Perlu Atensi */}
        <div className="bg-sky-900 rounded-md p-8 text-white h-fit relative overflow-hidden shadow-xl shadow-sky-200">
          <div className="relative h-fit flex flex-col">
            <div>
              <h2 className="text-2xl font-black mb-2">Perlu Atensi Segera</h2>
              <p className="text-sky-100 text-sm opacity-80 font-medium">
                Terdapat beberapa berkas yang memerlukan tindakan segera.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {ringkasanDisposisi.terlambat > 0 && (
                <div className="bg-red-600/20 p-4 rounded-md flex items-center justify-between border border-red-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-sm font-bold">
                      {ringkasanDisposisi.terlambat} Disposisi Melewati Tenggat
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300" />
                </div>
              )}

              {ringkasanDisposisi.mendekatiTenggat > 0 && (
                <div className="bg-amber-600/20 p-4 rounded-md flex items-center justify-between border border-amber-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-sm font-bold">
                      {ringkasanDisposisi.mendekatiTenggat} Tenggat dalam 3 Hari
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </div>
              )}

              {ringkasanDisposisi.tanpaDisposisi > 0 && (
                <div className="bg-sky-800/50 p-4 rounded-md flex items-center justify-between border border-sky-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
                    <span className="text-sm font-bold">
                      {ringkasanDisposisi.tanpaDisposisi} Surat Belum Didisposisi
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-300" />
                </div>
              )}

              {!loading &&
                ringkasanDisposisi.terlambat === 0 &&
                ringkasanDisposisi.mendekatiTenggat === 0 &&
                ringkasanDisposisi.tanpaDisposisi === 0 && (
                  <div className="bg-emerald-600/20 p-4 rounded-md flex items-center justify-between border border-emerald-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-sm font-bold">
                        Semua Berkas Terkontrol dengan Baik
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-300" />
                  </div>
                )}
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-800 rounded-full opacity-20 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
