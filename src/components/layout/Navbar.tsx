"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import SearchModal from "@/components/SearchModal";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/data-strategis", label: "Data Strategis" },
  { href: "/indikator-bulanan", label: "Ringkasan Indikator" },
  { href: "/infografis", label: "Infografis" },
  { href: "/layanan-konsultasi", label: "Layanan" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <>
    <header className="w-full">
      <nav className="bg-white dark:bg-[#0F1825] border-b border-slate-200 dark:border-slate-700/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo-sitara.png"
                alt="SITARA"
                width={44}
                height={44}
                className="shrink-0"
              />
              <div className="leading-tight">
                <p className="text-[#0C2340] dark:text-white font-bold text-[15px]">SITARA</p>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">BPS Kab. Toli-Toli</p>
              </div>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "text-[#1D6FCA] bg-blue-50 dark:bg-blue-900/25"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#1D6FCA] hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#1D6FCA] rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://tolitolikab.bps.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#1D6FCA] transition-colors"
              >
                bps.go.id ↗
              </a>
              <Link
                href="/admin/login"
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-[#1D6FCA] transition-colors"
              >
                Admin
              </Link>
              {/* Search */}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent("sitara:open-search"))}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cari"
                title="Cari (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
              </button>
              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {/* Accessibility widget */}
              <AccessibilityWidget />
              <Link
                href="/layanan-konsultasi"
                className="btn-primary text-xs px-4 py-2"
              >
                Konsultasi Data
              </Link>
            </div>

            {/* Mobile right: search + toggle + accessibility + hamburger */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={() => document.dispatchEvent(new CustomEvent("sitara:open-search"))}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cari"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <AccessibilityWidget />
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#0F1825] px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 dark:bg-blue-900/25 text-[#1D6FCA]"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-2">
              <Link
                href="/layanan-konsultasi"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center btn-primary w-full py-2.5 text-sm"
              >
                Konsultasi Data
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
    <SearchModal />
    </>
  );
}
