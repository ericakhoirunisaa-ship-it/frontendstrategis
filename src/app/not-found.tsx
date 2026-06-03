"use client";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BarChart3, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-[#1D6FCA]" />
          </div>
          <h1 className="text-6xl font-extrabold text-[#0C2340] dark:text-white mb-2">404</h1>
          <h2 className="text-xl font-bold text-[#0C2340] dark:text-white mb-3">Halaman Tidak Ditemukan</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
            Silakan kembali ke beranda atau coba halaman lain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D6FCA] hover:bg-[#155FA0] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Home className="w-4 h-4" /> Ke Beranda
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#162133] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-8">
            Portal Data Strategis · BPS Kabupaten Toli-Toli
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
