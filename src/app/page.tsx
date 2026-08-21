import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatBoxCarousel from "@/components/beranda/StatBoxCarousel";
import KilasDataSection from "@/components/beranda/KilasDataSection";
import JadwalRilisSection from "@/components/beranda/JadwalRilisSection";
import TentangSection from "@/components/beranda/TentangSection";
import LayananSection from "@/components/beranda/LayananSection";
import InfografisSection from "@/components/beranda/InfografisSection";
import KepuasanSection from "@/components/beranda/KepuasanSection";
import VisitorCounter from "@/components/beranda/VisitorCounter";
import HeroSearch from "@/components/beranda/HeroSearch";
import HeroIllustration from "@/components/beranda/HeroIllustration";
import Link from "next/link";
import { ArrowRight, Shield, Database, BarChart3 } from "lucide-react";

export default function BerandaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#0C2340]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            {/* Left text */}
            <div className="max-w-xl">
              {/* Instansi chip */}
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className="flex h-3 w-5 overflow-hidden rounded-sm shrink-0">
                  <div className="w-1/2 bg-red-500" />
                  <div className="w-1/2 bg-white" />
                </div>
                <span className="text-white/60 text-[11px] font-semibold tracking-wider uppercase">
                  BPS Kabupaten Toli-Toli
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] mb-4">
                Sistem Informasi Indikator Strategis<br />
                <span className="text-[#38BDF8]">Kabupaten Toli-Toli</span>
              </h1>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                Akses data statistik resmi, indikator pembangunan, dan
                informasi strategis Kabupaten Toli-Toli secara mudah dan terpercaya.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/data-strategis" className="btn-primary py-3 px-6 text-sm">
                  Jelajahi Data <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/layanan-konsultasi"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/80 border border-white/15 hover:bg-white/5 transition-colors"
                >
                  Layanan BPS
                </Link>
              </div>

              {/* Search bar */}
              <HeroSearch />

              {/* Trust badges + visitor counter */}
              <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-6">
                {[
                  { icon: Shield,   label: "Data Resmi BPS" },
                  { icon: Database, label: "20+ Indikator" },
                  { icon: BarChart3, label: "Diperbarui Berkala" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span className="text-white/40 text-xs font-medium">{label}</span>
                  </div>
                ))}
                <VisitorCounter />
              </div>
            </div>

            {/* Right: animated illustration */}
            <div className="hidden lg:flex items-center justify-end flex-1">
              <HeroIllustration />
            </div>

          </div>
        </div>

        {/* Clean bottom border instead of wave */}
        <div className="h-px bg-white/10" />
      </section>

      {/* ── STATISTIK UTAMA ───────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0F1825] border-b border-slate-100 dark:border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-tag mb-2">Statistik Utama</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#0C2340] dark:text-white">
                Ringkasan Indikator Kab. Toli-Toli
              </h2>
            </div>
            <Link
              href="/data-strategis"
              className="hidden sm:flex items-center gap-1 text-[#1D6FCA] text-sm font-semibold hover:underline"
            >
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <StatBoxCarousel />
        </div>
      </section>

      {/* ── KILAS DATA ───────────────────────────────────────── */}
      <KilasDataSection />

      {/* ── INFOGRAFIS ───────────────────────────────────────── */}
      <InfografisSection />

      {/* ── JADWAL RILIS ─────────────────────────────────────── */}
      <JadwalRilisSection />

      {/* ── TENTANG ──────────────────────────────────────────── */}
      <TentangSection />

      {/* ── LAYANAN ──────────────────────────────────────────── */}
      <LayananSection />

      {/* ── SURVEI KEPUASAN ──────────────────────────────────── */}
      <KepuasanSection />

      <Footer />
    </div>
  );
}
