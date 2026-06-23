"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Inbox,
  Send,
  FileBarChart,
  DatabaseBackup,
  DatabaseZap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Forward,
  Settings,
  ChevronDown,
  UserPlus,
  Shield,
  Calendar,
  School,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeSession, session } from "@/services/user";
import Swal from "sweetalert2";
import { useUser } from "@/context/UserProvider";
import { dataRole } from "@/data/role";
import { ambilDataInstansi } from "@/services/instansi";

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
  const [menuGroups, setMenuGroups] = useState([
    {
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
            {
              name: "Surat Masuk",
              icon: Inbox,
              path: "/dashboard/agenda/surat-masuk",
            },
            {
              name: "Surat Keluar",
              icon: Send,
              path: "/dashboard/agenda/surat-keluar",
            },
          ],
        },
      ],
    },
    {
      label: "Sistem",
      items: [
        {
          name: "Backup Database",
          icon: DatabaseBackup,
          path: "/dashboard/backup",
        },
        {
          name: "Restore Database",
          icon: DatabaseZap,
          path: "/dashboard/restore",
        },
      ],
    },
    {
      label: "Pengaturan",
      items: [
        {
          name: "Setup Management",
          icon: Settings,
          path: "#",
          children: [
            {
              name: "Tambah Akun",
              icon: UserPlus,
              path: "/dashboard/setup/akun",
            },
            { name: "hapus Akun", icon: Trash, path: "/dashboard/setup/hapus" },
            { name: "Ubah Role", icon: Shield, path: "/dashboard/setup/role" },
            {
              name: "Instansi",
              icon: School,
              path: "/dashboard/setup/instansi",
            },
          ],
        },
      ],
    },
  ]);

  // cek sessi user
  useEffect(() => {
    if (user) return;
    (async () => {
      const sessi = await session();
      const islogin = sessi.isLogin;

      // jika belum login maka user akan dikembalikan ke halaman login
      if (!islogin) {
        router.replace("/autentikasi/masuk");
        return;
      }

      const data_user = JSON.parse(sessi.user)[0];
      setUser(data_user);

      // menentukan menu apa saja yang diizinkan berdasarkan role
      if (data_user.role.toLowerCase() !== "superadmin") {
        setMenuGroups([
          {
            label: "Menu Utama",
            items: [
              { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
              {
                name: "Surat Masuk",
                icon: Inbox,
                path: "/dashboard/surat-masuk",
              },
              {
                name: "Surat Keluar",
                icon: Send,
                path: "/dashboard/surat-keluar",
              },
              {
                name: "Agenda",
                icon: Calendar,
                path: "#",
                children: [
                  {
                    name: "Surat Masuk",
                    icon: Inbox,
                    path: "/dashboard/agenda/surat-masuk",
                  },
                  {
                    name: "Surat Keluar",
                    icon: Send,
                    path: "/dashboard/agenda/surat-keluar",
                  },
                ],
              },
            ],
          },
        ]);
      }

      // ambil & simpan data instansi secara global
      try {
        const responseInstansi = await ambilDataInstansi();
        setInstansi(responseInstansi.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
    const response = await removeSession();
    setUser(null);
  };
  if (!user || !instansi)
    return <div className="p-3">Sedang mengambil data...</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Tombol Hamburger Mobile */}
      <button
        className="lg:hidden fixed top-5 left-5  p-2 bg-white shadow-md rounded-lg border border-slate-200"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* overlay sidebar */}
      {isMobileOpen && (
        <button
          className="inset-0 fixed z-10 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
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
            <img
              src="/images/logo.png"
              alt="gambar logo sidotec"
              className="w-8 h-8 object-cover"
            />
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
                {group.items.map((item: any) => {
                  const hasChildren = !!item.children;
                  const isParentActive =
                    hasChildren &&
                    item.children?.some((c: any) =>
                      pathname.startsWith(c.path),
                    );
                  const isActive = !hasChildren && pathname === item.path;
                  const isDropdownOpen = openDropdown === item.name;
                  const Icon = item.icon;

                  return (
                    <li key={item.name} className="relative">
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleDropdown(item.name)}
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
                              {/* Garis Vertikal */}
                              <div className="absolute left-0 top-0 bottom-2 w-px bg-slate-700" />

                              <ul className="space-y-1 py-1">
                                {item.children?.map((child: any) => {
                                  const isChildActive = pathname === child.path;
                                  return (
                                    <li key={child.name} className="relative">
                                      <Link
                                        href={child.path}
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
                          className={`flex items-center rounded-xl transition-all duration-200 group
                            ${isCollapsed ? "justify-center p-3" : "px-4 py-3"}
                            ${isActive ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 font-semibold" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"}
                          `}
                        >
                          <Icon
                            className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "group-hover:text-white"}`}
                          />
                          {!isCollapsed && (
                            <span className="text-[13px] ml-3">
                              {item.name}
                            </span>
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

        {/* Footer Sidebar yang lebih Clean */}
        <div className="p-4 bg-[#0F172A] border-t border-slate-800 mt-auto">
          {!isCollapsed ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-sky-400 uppercase">
                    {user.nama_lengkap.slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {dataRole[user.role.toLowerCase() as keyof typeof dataRole]}
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
