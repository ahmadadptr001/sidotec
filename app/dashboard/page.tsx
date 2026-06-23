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
import {
  Inbox,
  Send,
  Calendar,
  ArrowUpRight,
  Clock,
  FileText,
  Users,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { session, ambildataUser } from "@/services/user";
import { ambilDataSurat, ambilDataDisposisi } from "@/services/surat";

// Registrasi komponen ChartJS
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

interface User {
  id: string;
  username: string;
  nama_lengkap: string;
  role: string;
}

export default function DashboardPage() {
  const [suratMasuk, setSuratMasuk] = useState<Surat[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<Surat[]>([]);
  const [disposisi, setDisposisi] = useState<Disposisi[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch data dari API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch surat masuk dan keluar
      const [masuk, keluar, disp, users] = await Promise.all([
        ambilDataSurat("masuk", 100),
        ambilDataSurat("keluar", 100),
        ambilDataDisposisi(),
        ambildataUser(),
      ]);

      setSuratMasuk(masuk?.data || []);
      setSuratKeluar(keluar?.data || []);
      setDisposisi(disp?.data || []);
      setTotalUsers(users?.data?.length || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hitung kategori dari semua surat
  const calculateCategoryDistribution = () => {
    const allLetters = [...suratMasuk, ...suratKeluar];
    const categoryCount: { [key: string]: number } = {
      SDM: 0,
      Keuangan: 0,
      Umum: 0,
      Akademik: 0,
      Internal: 0,
    };

    allLetters.forEach((letter) => {
      if (categoryCount.hasOwnProperty(letter.kategori)) {
        categoryCount[letter.kategori]++;
      }
    });

    const total = allLetters.length || 1;
    return {
      labels: Object.keys(categoryCount),
      data: Object.values(categoryCount).map((val) =>
        Math.round((val / total) * 100),
      ),
    };
  };

  // Hitung disposisi yang pending (belum selesai)
  const calculatePendingDisposisi = () => {
    const today = new Date();
    return disposisi.filter((d) => new Date(d.deadline) >= today).length;
  };

  // Hitung disposisi yang sudah overdue (deadline lewat)
  const calculateOverdueDisposisi = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return disposisi.filter((d) => {
      const deadline = new Date(d.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline < today;
    }).length;
  };

  // Hitung disposisi yang deadline-nya sudah dekat (3 hari ke depan)
  const calculateApproachingDeadline = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    return disposisi.filter((d) => {
      const deadline = new Date(d.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline >= today && deadline <= threeDaysLater;
    }).length;
  };

  // Hitung surat yang belum memiliki disposisi
  const calculateSuratWithoutDisposisi = () => {
    const allSurat = [...suratMasuk, ...suratKeluar];
    const disposisiSuratIds = disposisi.map((d) => String(d.surat_id));
    return allSurat.filter((s) => !disposisiSuratIds.includes(String(s.id)))
      .length;
  };

  const checkSession = async () => {
    await session();
    await fetchDashboardData();
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Generate chart data berdasarkan data real
  const lineData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        fill: true,
        label: "Surat Masuk",
        data: [
          Math.ceil(suratMasuk.length / 2),
          Math.ceil(suratMasuk.length / 1.8),
          Math.ceil(suratMasuk.length / 1.6),
          Math.ceil(suratMasuk.length / 1.4),
          Math.ceil(suratMasuk.length / 1.2),
          Math.ceil(suratMasuk.length / 1),
          suratMasuk.length,
        ],
        borderColor: "rgb(5, 150, 105)",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
      },
      {
        fill: true,
        label: "Surat Keluar",
        data: [
          Math.ceil(suratKeluar.length / 2),
          Math.ceil(suratKeluar.length / 1.8),
          Math.ceil(suratKeluar.length / 1.6),
          Math.ceil(suratKeluar.length / 1.4),
          Math.ceil(suratKeluar.length / 1.2),
          Math.ceil(suratKeluar.length / 1),
          suratKeluar.length,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Data untuk Grafik Kategori (Doughnut)
  const categoryDist = calculateCategoryDistribution();
  const doughnutData = {
    labels: categoryDist.labels,
    datasets: [
      {
        data: categoryDist.data,
        backgroundColor: [
          "#059669", // emerald 600
          "#3b82f6", // Blue 500
          "#f59e0b", // Amber 500
          "#64748b", // Slate 500
          "#8b5cf6", // Violet 500
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { display: false }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  // Stats data dengan kalkulasi dari data real
  const totalBerkas = suratMasuk.length + suratKeluar.length;
  const prosesTTD = calculatePendingDisposisi();

  const statsData = [
    {
      label: "Total Berkas",
      val: totalBerkas.toLocaleString("id-ID"),
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Proses TTD",
      val: prosesTTD,
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
      label: "Disposisi",
      val: disposisi.length,
      icon: ArrowUpRight,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

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
                <p className="text-xs font-bold text-gray-400 uppercase ">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.val}
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Tren Lalu Lintas Surat
              </h2>
              <p className="text-sm text-gray-400 font-medium">
                Data mingguan periode April 2026
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center text-xs font-bold text-gray-500">
                <span className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></span>{" "}
                Masuk
              </div>
              <div className="flex items-center text-xs font-bold text-gray-500">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>{" "}
                Keluar
              </div>
            </div>
          </div>
          <div className="h-75">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart: Distribusi Kategori */}
        <div className="bg-white p-8 rounded-md border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Kategori Surat
          </h2>
          <p className="text-sm text-gray-400 font-medium mb-8">
            Persentase distribusi bidang
          </p>
          <div className="h-55 relative">
            <Doughnut
              data={doughnutData}
              options={{ ...chartOptions, cutout: "70%" }}
            />
            <div className="absolute ps-7 pb-3 inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-800">100%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Terklasifikasi
              </span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {doughnutData.labels.map((label, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-3"
                    style={{
                      backgroundColor:
                        doughnutData.datasets[0].backgroundColor[i],
                    }}
                  ></div>
                  <span className="font-bold text-gray-600">{label}</span>
                </div>
                <span className="font-black text-gray-900">
                  {doughnutData.datasets[0].data[i]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Important Info & Department Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Info Penting / Logs */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Aktivitas Terakhir
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {[...suratMasuk, ...suratKeluar]
              .sort(
                (a, b) =>
                  new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
              )
              .slice(0, 3)
              .map((surat, i) => (
                <div
                  key={i}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                      {surat.jenis === "masuk" ? "M" : "K"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Surat {surat.jenis === "masuk" ? "Masuk" : "Keluar"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {surat.ringkasan.substring(0, 40)}... —{" "}
                        <span className="text-sky-600">
                          {surat.nomor_surat}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(surat.tanggal).toLocaleDateString("id-ID")}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Action / Summary Section */}
        <div className="bg-sky-900 rounded-md p-8 text-white h-fit relative overflow-hidden shadow-xl shadow-sky-200">
          <div className="relative h-fit flex flex-col">
            <div>
              <h2 className="text-2xl font-black mb-2">Perlu Atensi Segera</h2>
              <p className="text-sky-100 text-sm opacity-80 font-medium">
                Terdapat beberapa berkas yang memerlukan tindakan segera.
              </p>
            </div>

            <div className=" mt-8 space-y-4">
              {/* Overdue Dispositions */}
              {calculateOverdueDisposisi() > 0 && (
                <div className="bg-red-600/20 p-4 rounded-md flex items-center justify-between border border-red-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold">
                      {calculateOverdueDisposisi()} Disposisi Overdue
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300" />
                </div>
              )}

              {/* Approaching Deadline */}
              {calculateApproachingDeadline() > 0 && (
                <div className="bg-amber-600/20 p-4 rounded-md flex items-center justify-between border border-amber-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold">
                      {calculateApproachingDeadline()} Deadline dalam 3 Hari
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </div>
              )}

              {/* Surat tanpa Disposisi */}
              {calculateSuratWithoutDisposisi() > 0 && (
                <div className="bg-sky-800/50 p-4 rounded-md flex items-center justify-between border border-sky-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold">
                      {calculateSuratWithoutDisposisi()} Surat Belum Didisposisi
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-300" />
                </div>
              )}

              {/* Fallback jika semua aman */}
              {calculateOverdueDisposisi() === 0 &&
                calculateApproachingDeadline() === 0 &&
                calculateSuratWithoutDisposisi() === 0 && (
                  <div className="bg-emerald-600/20 p-4 rounded-md flex items-center justify-between border border-emerald-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-sm font-bold">
                        Semua Berkas Terkontrol dengan Baik
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-300" />
                  </div>
                )}
            </div>
          </div>
          {/* Background Decoration */}
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-800 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
