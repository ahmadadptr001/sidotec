"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Inbox,
  Send,
  DatabaseBackup,
  DatabaseZap,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown,
  UserPlus,
  Shield,
  Calendar,
  School,
  Trash,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeSession, session } from "@/services/user";
import { useUser, type Instansi } from "@/context/UserProvider";
import { dataRole } from "@/data/role";
import { ambilDataInstansi } from "@/services/instansi";
import LogoSidotec from "@/components/ui/LogoSidotec";
import { pesanError } from "@/lib/error";

interface MenuAnak {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface MenuItem extends MenuAnak {
  children?: MenuAnak[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const MENU_UTAMA: MenuGroup = {
  label: "Menu Utama",
  items: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Surat Masuk", icon: Inbox, path: "/dashboard/surat-masuk" },
    { name: "Surat Keluar", icon: Send, path: "/dashboard/surat-keluar" },
    {
      name: "Agenda",
      icon: Calendar,
      path: "#",
      children: [
        { name: "Surat Masuk", icon: Inbox, path: "/dashboard/agenda/surat-masuk" },
        { name: "Surat Keluar", icon: Send, path: "/dashboard/agenda/surat-keluar" },
      ],
    },
  ],
};

const MENU_SISTEM: MenuGroup = {
  label: "Sistem",
  items: [
    { name: "Backup Database", icon: DatabaseBackup, path: "/dashboard/backup" },
    { name: "Restore Database", icon: DatabaseZap, path: "/dashboard/restore" },
  ],
};

const MENU_PENGATURAN: MenuGroup = {
  label: "Pengaturan",
  items: [
    {
      name: "Setup Management",
      icon: Settings,
      path: "#",
      children: [
        { name: "Tambah Akun", icon: UserPlus, path: "/dashboard/setup/akun" },
        { name: "Hapus Akun", icon: Trash, path: "/dashboard/setup/hapus" },
        { name: "Ubah Role", icon: Shield, path: "/dashboard/setup/role" },
        { name: "Instansi", icon: School, path: "/dashboard/setup/instansi" },
      ],
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, instansi, setUser, setInstansi } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [keluar, setKeluar] = useState(false);
  const [gagalMuat, setGagalMuat] = useState<string | null>(null);
  const [percobaan, setPercobaan] = useState(0);
  const [lambat, setLambat] = useState(false);

  // Menu dihitung dari role, bukan disalin lewat setState. Menu Sistem &
  // Pengaturan hanya untuk superadmin — sama dengan aturan di proxy.ts, jadi
  // menu yang tampil selalu cocok dengan halaman yang benar-benar bisa dibuka.
  const menuGroups = useMemo(() => {
    if (user?.role?.toLowerCase() !== "superadmin") return [MENU_UTAMA];
    return [MENU_UTAMA, MENU_SISTEM, MENU_PENGATURAN];
  }, [user?.role]);

  // Cek sesi user
  useEffect(() => {
    if (user || keluar) return;
    let dibatalkan = false;

    (async () => {
      let sessi;
      try {
        sessi = await session();
      } catch (err) {
        console.error(err);
        // Kegagalan jaringan bukan berarti sesi habis, jadi tampilkan pesan
        // beserta tombol coba lagi, bukan diam di layar pemuatan.
        if (!dibatalkan) {
          setGagalMuat(pesanError(err, "Tidak dapat menghubungi server."));
        }
        return;
      }
      if (dibatalkan) return;

      if (!sessi.isLogin || !sessi.user) {
        router.replace("/autentikasi/masuk");
        return;
      }

      // Data instansi diambil SEBELUM setUser. `user` ada di dependency effect
      // ini, jadi setUser memicu effect berjalan ulang dan cleanup-nya menandai
      // proses ini dibatalkan — kalau setUser dipanggil lebih dulu, setInstansi
      // di bawah akan ikut terlewat dan layout tertahan di layar "mengambil
      // data" selamanya.
      let dataInstansi: Instansi[] = [];
      try {
        const responseInstansi = await ambilDataInstansi();
        dataInstansi = responseInstansi.data ?? [];
      } catch (err) {
        // Identitas instansi hanya dibutuhkan untuk kop surat cetak, jadi
        // kegagalan di sini tidak boleh menghalangi seluruh dashboard.
        console.error("Gagal memuat data instansi:", err);
      }
      if (dibatalkan) return;

      // Endpoint sesi sekarang mengirim objek pengguna langsung (tanpa
      // password), jadi tidak perlu JSON.parse(...)[0] lagi.
      setInstansi(dataInstansi);
      setUser(sessi.user);
    })();

    return () => {
      dibatalkan = true;
    };
  }, [user, keluar, percobaan, router, setUser, setInstansi]);

  // Penanda "lebih lama dari biasanya", supaya pemuatan yang menggantung tidak
  // terlihat sama seperti pemuatan yang sedang berjalan normal.
  useEffect(() => {
    if (user || gagalMuat) return;
    const timer = setTimeout(() => setLambat(true), 8000);
    return () => clearTimeout(timer);
  }, [user, gagalMuat, percobaan]);

  const cobaLagi = () => {
    setGagalMuat(null);
    setLambat(false);
    setPercobaan((n) => n + 1);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleDropdown = (menuName: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenDropdown(menuName);
    } else {
      setOpenDropdown(openDropdown === menuName ? null : menuName);
    }
  };

  const handleLogout = async () => {
    setKeluar(true);
    try {
      await removeSession();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    setInstansi(null);
    // Redirect eksplisit, tidak menunggu efek pemeriksaan sesi.
    router.replace("/autentikasi/masuk");
  };

  if (!user || !instansi)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        {gagalMuat ? (
          <>
            <LogoSidotec className="w-12 h-12 opacity-50" />
            <div>
              <p className="font-bold text-slate-800">Gagal memuat dashboard</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">{gagalMuat}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={cobaLagi}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              >
                Coba Lagi
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              >
                Keluar
              </button>
            </div>
          </>
        ) : (
          <>
            <LogoSidotec className="w-12 h-12 animate-pulse" />
            <p className="text-sm font-medium text-slate-500">
              Sedang mengambil data...
            </p>
            {lambat && (
              <p className="text-xs text-slate-400 max-w-xs">
                Ini lebih lama dari biasanya. Periksa koneksi ke server, lalu muat
                ulang halaman.
              </p>
            )}
          </>
        )}
      </div>
    );

  const labelRole =
    dataRole[user.role?.toLowerCase() as keyof typeof dataRole] ?? user.role;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Tombol Hamburger Mobile */}
      <button
        className="lg:hidden fixed top-5 left-5 z-30 p-2 bg-white shadow-md rounded-lg border border-slate-200"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* overlay sidebar */}
      {isMobileOpen && (
        <button
          className="inset-0 fixed z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Tutup menu navigasi"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 h-full bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800
          ${isCollapsed ? "w-20" : "w-70"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header Sidebar */}
        <div className="h-20 flex items-center px-6 shrink-0">
          <div className="flex items-center gap-3">
            <LogoSidotec className="w-9 h-9 shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-white">
                SIDOTEC
              </span>
            )}
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-8">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="px-4">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                  {group.label}
                </p>
              )}

              <ul className="space-y-1.5">
                {group.items.map((item: MenuItem) => {
                  const hasChildren = !!item.children;
                  const isParentActive =
                    hasChildren &&
                    item.children?.some((c) => pathname.startsWith(c.path));
                  const isActive = !hasChildren && pathname === item.path;
                  const isDropdownOpen = openDropdown === item.name;
                  const Icon = item.icon;

                  return (
                    <li key={item.name} className="relative">
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleDropdown(item.name)}
                            aria-expanded={isDropdownOpen}
                            className={`flex items-center justify-between w-full rounded-xl transition-all duration-200 group
                              ${isCollapsed ? "justify-center p-3" : "px-4 py-3"}
                              ${isParentActive || isDropdownOpen ? "text-white" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"}
                            `}
                          >
                            <div className="flex items-center">
                              <Icon
                                className={`w-5 h-5 shrink-0 transition-colors ${isParentActive ? "text-sky-400" : "group-hover:text-white"}`}
                              />
                              {!isCollapsed && (
                                <span className="text-[13px] font-medium ml-3">
                                  {item.name}
                                </span>
                              )}
                            </div>
                            {!isCollapsed && (
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "opacity-40"}`}
                              />
                            )}
                          </button>

                          {/* Children Menu dengan Garis Vertikal */}
                          {isDropdownOpen && !isCollapsed && (
                            <div className="ml-6.5 mt-1 relative">
                              <div className="absolute left-0 top-0 bottom-2 w-px bg-slate-700" />

                              <ul className="space-y-1 py-1">
                                {item.children?.map((child) => {
                                  const isChildActive = pathname === child.path;
                                  return (
                                    <li key={child.name} className="relative">
                                      <Link
                                        href={child.path}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`flex items-center gap-3 pl-6 pr-4 py-2 text-[13px] transition-all relative
                                          before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-px before:bg-slate-700
                                          ${isChildActive ? "text-sky-400 font-bold" : "text-slate-500 hover:text-slate-200"}
                                        `}
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center rounded-xl transition-all duration-200 group
                            ${isCollapsed ? "justify-center p-3" : "px-4 py-3"}
                            ${isActive ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 font-semibold" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"}
                          `}
                        >
                          <Icon
                            className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "group-hover:text-white"}`}
                          />
                          {!isCollapsed && (
                            <span className="text-[13px] ml-3">{item.name}</span>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 bg-[#0F172A] border-t border-slate-800 mt-auto">
          {!isCollapsed ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-sky-400 uppercase">
                    {(user.nama_lengkap || user.username || "?").slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {labelRole}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold group"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Sistem
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-3 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle Collapse Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 bg-slate-900 border border-slate-700 text-slate-400 rounded-full p-1 hover:text-sky-400 transition-all z-50 shadow-xl"
          aria-label={isCollapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:ml-20" : "lg:ml-70"}`}
      >
        <main className="flex-1 p-6 pt-24 lg:pt-12 lg:p-12 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
