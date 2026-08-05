"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, LayoutDashboard, Database, Calendar, BarChart2, LogOut, Menu, X, ImageIcon, MessageSquareWarning, Sun, Moon, Map, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/statistik", icon: BarChart2, label: "Statistik Beranda" },
  { href: "/admin/indikator", icon: Database, label: "Indikator & Data" },
  { href: "/admin/indikator-bulanan", icon: TrendingUp, label: "Ringkasan Indikator" },
  { href: "/admin/jadwal-rilis", icon: Calendar, label: "Jadwal Rilis" },
  { href: "/admin/infografis", icon: ImageIcon, label: "Infografis" },
  { href: "/admin/peta-tematik", icon: Map, label: "Peta Tematik" },
  { href: "/admin/pengaduan", icon: MessageSquareWarning, label: "Pengaduan" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/admin/login"); return; }
    const u = localStorage.getItem("admin_user");
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#F5F8FC] dark:bg-[#0B1120]">
      {/* Sidebar — stays dark navy in both modes */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3A5F] transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <div className="w-9 h-9 bg-[#2196F3] rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
            <p className="text-blue-300 text-xs">Data Strategis Toli-Toli</p>
          </div>
          <button className="ml-auto lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === href ? "bg-[#2196F3] text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-blue-300 text-xs">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-[#162133] border-b border-gray-100 dark:border-slate-700/50 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden text-gray-500 dark:text-slate-400" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-[#1A1A2E] dark:text-white">
              {navItems.find((n) => n.href === pathname)?.label || "Admin"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/" className="text-xs text-[#2196F3] hover:underline">
              ← Lihat Website
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
