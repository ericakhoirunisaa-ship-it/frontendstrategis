import { CheckCircle2, ExternalLink } from "lucide-react";

const fitur = [
  "Data resmi dan terpercaya langsung dari BPS Kabupaten Toli-Toli",
  "Indikator strategis mencakup ekonomi, sosial, dan kependudukan",
  "Visualisasi interaktif — grafik dinamis dan peta tematik per kecamatan",
  "Diperbarui secara berkala sesuai kalender rilis publikasi BPS",
];

const angka = [
  { nilai: "10", satuan: "Kecamatan" },
  { nilai: "20+", satuan: "Indikator" },
  { nilai: "5+", satuan: "Tahun Data" },
  { nilai: "100%", satuan: "Data BPS" },
];

export default function TentangSection() {
  return (
    <section className="py-16" style={{ background: "#0C2340" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: Angka */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              {angka.map((item) => (
                <div
                  key={item.satuan}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
                >
                  <p className="text-4xl font-extrabold leading-none mb-1 text-[#38BDF8]">
                    {item.nilai}
                  </p>
                  <p className="text-white/50 text-sm font-medium">{item.satuan}</p>
                </div>
              ))}
            </div>

            {/* Official badge */}
            <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex h-5 w-8 overflow-hidden rounded shadow-sm shrink-0">
                <div className="w-1/2 bg-red-500" />
                <div className="w-1/2 bg-white" />
              </div>
              <p className="text-sm text-white/80 font-semibold">
                SITARA — Resmi BPS Kabupaten Toli-Toli
              </p>
              <a
                href="https://tolitolikab.bps.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-white/50 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 bg-white/10 text-[#38BDF8] border border-white/15">
              Sistem Informasi Indikator Strategis (SITARA)
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              SITARA<br />Kabupaten Toli-Toli
            </h2>
            <p className="text-white/55 text-sm leading-relaxed mb-6">
              SITARA adalah platform resmi BPS Toli-Toli yang menyajikan data dan
              indikator statistik strategis daerah secara digital, transparan, dan mudah
              diakses oleh masyarakat, pemerintah daerah, maupun peneliti.
            </p>
            <ul className="space-y-3">
              {fitur.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: "#38BDF8" }}
                    strokeWidth={2.5}
                  />
                  <span className="text-white/70 text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
