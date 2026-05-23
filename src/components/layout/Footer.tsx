import Link from "next/link";
import { MapPin, Phone, MessageCircle, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: "#0C2340" }}>
      {/* Divider stripe */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1D6FCA 0%, #38BDF8 50%, #1D6FCA 100%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">

          {/* Branding */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow"
                style={{ background: "linear-gradient(135deg, #1D6FCA 0%, #0C4A9E 100%)" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <rect x="3" y="12" width="4" height="9" rx="1" />
                  <rect x="10" y="7" width="4" height="14" rx="1" />
                  <rect x="17" y="3" width="4" height="18" rx="1" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-[15px] leading-tight">Portal Data Strategis</p>
                <p className="text-slate-400 text-xs leading-tight mt-0.5">BPS Kabupaten Toli-Toli</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Portal resmi data statistik dan indikator strategis Kabupaten Toli-Toli,
              Provinsi Sulawesi Tengah. Data bersumber dari Badan Pusat Statistik.
            </p>
          </div>

          {/* Navigasi */}
          <div className="md:col-span-3">
            <p className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Navigasi</p>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Beranda" },
                { href: "/data-strategis", label: "Data Strategis" },
                { href: "/peta-tematik", label: "Peta Tematik" },
                { href: "/layanan-konsultasi", label: "Layanan Konsultasi" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="md:col-span-5">
            <p className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Kontak & Lokasi</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <span className="text-slate-400 text-sm leading-relaxed">
                  Jl. Magamu No.111, Tuweley, Kec. Baolan,<br />Kabupaten Toli-Toli, Sulawesi Tengah 94515
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <span className="text-slate-400 text-sm">(0453) 21351</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <a
                  href="https://wa.me/6285183287206"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  085183287206 (WA BPS)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <a href="mailto:bps7206@bps.go.id" className="text-slate-400 hover:text-white text-sm transition-colors">
                  bps7206@bps.go.id
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  <p>Senin – Kamis: 07.30 – 16.00 WITA</p>
                  <p>Jumat: 07.30 – 16.30 WITA</p>
                  <p className="text-slate-500 text-xs mt-1">*Sabtu, Minggu &amp; Hari Libur Nasional Tutup</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs text-center">
            © {new Date().getFullYear()} BPS Kabupaten Toli-Toli · Hak Cipta Dilindungi Undang-Undang
          </p>
          <div className="flex items-center gap-4">
            <a href="https://tolitolikab.bps.go.id" target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-white text-xs transition-colors">
              tolitolikab.bps.go.id ↗
            </a>
            <a href="https://www.bps.go.id" target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-white text-xs transition-colors">
              bps.go.id ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
