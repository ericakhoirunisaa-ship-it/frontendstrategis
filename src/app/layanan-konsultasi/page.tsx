import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Building2, MessageCircle, ShieldAlert, Megaphone, ClipboardList, Mail, Phone, Clock, MapPin } from "lucide-react";

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

export default function LayananKonsultasiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block px-4 py-1 bg-blue-50 text-[#2196F3] text-sm font-semibold rounded-full mb-3">
            Layanan Konsultasi
          </span>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Layanan &amp; Konsultasi BPS Toli-Toli</h1>
          <p className="text-gray-500 mt-2 max-w-2xl text-sm">
            BPS Kabupaten Toli-Toli menyediakan berbagai saluran layanan untuk memenuhi kebutuhan
            data, konsultasi statistik, dan pengaduan masyarakat.
          </p>
        </div>

        {/* Info Kontak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-4 flex items-start gap-3 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 text-[#2196F3]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Alamat</p>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                Jl. Magamu No.111, Tuweley, Kec. Baolan,<br />
                Kabupaten Toli-Toli, Sulawesi Tengah 94515
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex items-start gap-3 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="w-5 h-5 text-[#2196F3]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Telepon</p>
              <p className="text-sm text-gray-700 font-medium">(0453) 21351</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex items-start gap-3 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-[#2196F3]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Jam Layanan</p>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                Senin – Kamis: 07.30 – 16.00 WITA<br />
                Jumat: 07.30 – 16.30 WITA
              </p>
              <p className="text-xs text-gray-400 mt-1">*Sabtu, Minggu &amp; Hari Libur Nasional Tutup</p>
            </div>
          </div>
        </div>

        {/* Layanan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {layanan.map((item) => {
            const Icon = item.icon;
            const btnClass =
              "inline-flex items-center justify-center w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-85 mt-auto";

            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col p-5"
              >
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

                <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-4">
                  {item.desc}
                </p>

                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnClass}
                    style={{ backgroundColor: item.accent }}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={btnClass} style={{ backgroundColor: item.accent }}>
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
