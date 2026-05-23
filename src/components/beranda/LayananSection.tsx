import Link from "next/link";
import { Building2, MessageCircle, ShieldAlert, Megaphone, ClipboardList, Mail } from "lucide-react";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Jl+Magamu+No+111+Tuweley+Baolan+Toli-Toli+Sulawesi+Tengah+94515";

const layanan = [
  {
    icon: Building2,
    title: "Sub PST",
    sub: "Pelayanan Statistik Terpadu",
    desc: "Kunjungi Sub PST BPS Toli-Toli di Jl. Magamu No.111, Tuweley, Kec. Baolan untuk konsultasi dan permintaan data statistik secara langsung.",
    label: "Lihat Lokasi",
    href: MAPS_URL,
    external: true,
    accent: "#1D6FCA",
    bg: "#EBF4FF",
  },
  {
    icon: MessageCircle,
    title: "WA Barista",
    sub: "WhatsApp BPS Toli-Toli",
    desc: "Dapatkan data statistik Toli-Toli secara cepat melalui layanan WhatsApp BPS Kabupaten Toli-Toli.",
    label: "Chat WA",
    href: "https://wa.me/6285183287206",
    external: true,
    accent: "#16A34A",
    bg: "#DCFCE7",
  },
  {
    icon: ShieldAlert,
    title: "WBS",
    sub: "Whistle Blowing System",
    desc: "Laporkan dugaan pelanggaran integritas di lingkungan BPS secara aman, rahasia, dan terlindungi.",
    label: "Buka WBS",
    href: "https://webapp.bps.go.id/pengaduan/wbs",
    external: true,
    accent: "#DC2626",
    bg: "#FEE2E2",
  },
  {
    icon: Megaphone,
    title: "SP4N-LAPOR!",
    sub: "Layanan Pengaduan Nasional",
    desc: "Sampaikan pengaduan pelayanan publik BPS melalui sistem pengaduan nasional SP4N-LAPOR!",
    label: "Lapor",
    href: "https://www.lapor.go.id",
    external: true,
    accent: "#D97706",
    bg: "#FEF3C7",
  },
  {
    icon: ClipboardList,
    title: "Form Pengaduan",
    sub: "Pengaduan Internal BPS",
    desc: "Isi formulir pengaduan terkait layanan dan produk statistik BPS Kabupaten Toli-Toli secara online.",
    label: "Isi Form",
    href: "/pengaduan",
    external: false,
    accent: "#7C3AED",
    bg: "#EDE9FE",
  },
  {
    icon: Mail,
    title: "Email",
    sub: "bps7206@bps.go.id",
    desc: "Kirimkan pertanyaan, permintaan data, atau pengaduan ke alamat email resmi BPS Toli-Toli.",
    label: "Kirim Email",
    href: "mailto:bps7206@bps.go.id",
    external: false,
    accent: "#0C2340",
    bg: "#EBF4FF",
  },
];

export default function LayananSection() {
  return (
    <section className="bg-[#F8FAFC] py-16 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-tag mb-3">Layanan</span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0C2340] mb-2">
            Butuh Data atau Bantuan?
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            BPS Kabupaten Toli-Toli menyediakan berbagai saluran layanan untuk memenuhi
            kebutuhan data dan pengaduan Anda.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {layanan.map((item) => {
            const Icon = item.icon;
            const btnClass =
              "inline-flex items-center justify-center w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-85";
            const btnStyle = { backgroundColor: item.accent };

            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col p-5"
              >
                {/* Icon row */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.accent }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-[#0C2340] text-sm">{item.title}</p>
                    <p className="text-[11px] font-semibold" style={{ color: item.accent }}>
                      {item.sub}
                    </p>
                  </div>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">
                  {item.desc}
                </p>

                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnClass}
                    style={btnStyle}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={btnClass} style={btnStyle}>
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
