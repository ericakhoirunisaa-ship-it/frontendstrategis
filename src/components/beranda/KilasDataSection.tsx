import Link from "next/link";
import { Calendar, Globe, Database, MessageSquare, ArrowRight } from "lucide-react";

const cards = [
  {
    href: "/jadwal-rilis",
    icon: Calendar,
    title: "Jadwal Rilis",
    desc: "Jadwal publikasi, BRS, dan infografis BPS Toli-Toli yang akan dan telah diterbitkan.",
    tag: "Publikasi",
    bg: "#1D6FCA",
    iconBg: "rgba(255,255,255,0.18)",
    tagBg: "rgba(255,255,255,0.15)",
  },
  {
    href: "/portal-daerah",
    icon: Globe,
    title: "Portal Daerah",
    desc: "Akses portal data dan statistik tingkat kecamatan di seluruh wilayah Kabupaten Toli-Toli.",
    tag: "Portal",
    bg: "#059669",
    iconBg: "rgba(255,255,255,0.18)",
    tagBg: "rgba(255,255,255,0.15)",
  },
  {
    href: "/data-strategis",
    icon: Database,
    title: "Data Strategis",
    desc: "Eksplorasi indikator dan data strategis BPS Toli-Toli dengan grafik dinamis dan tabel data.",
    tag: "Statistik",
    bg: "#D97706",
    iconBg: "rgba(255,255,255,0.18)",
    tagBg: "rgba(255,255,255,0.15)",
  },
  {
    href: "/layanan-konsultasi",
    icon: MessageSquare,
    title: "Layanan Konsultasi",
    desc: "Konsultasi data, permintaan data khusus, dan layanan statistik terpadu BPS.",
    tag: "Layanan",
    bg: "#7C3AED",
    iconBg: "rgba(255,255,255,0.18)",
    tagBg: "rgba(255,255,255,0.15)",
  },
];

export default function KilasDataSection() {
  return (
    <section className="bg-[#F8FAFC] dark:bg-[#0B1120] py-16 border-t border-slate-100 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <span className="section-tag mb-3">Kilas Data Strategis</span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0C2340] dark:text-white leading-tight">
            Temukan Data yang Anda Butuhkan
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex flex-col rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-250"
                style={{ backgroundColor: card.bg }}
              >
                {/* Dekorasi lingkaran */}
                <div
                  className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20"
                  style={{ backgroundColor: "white" }}
                />
                <div
                  className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full opacity-10"
                  style={{ backgroundColor: "white" }}
                />

                <div className="relative flex flex-col flex-1 p-5">
                  {/* Icon + Tag */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: card.iconBg }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: card.tagBg }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-[15px] mb-1.5">{card.title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed flex-1">{card.desc}</p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white/80 group-hover:text-white group-hover:gap-2 transition-all">
                    Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
