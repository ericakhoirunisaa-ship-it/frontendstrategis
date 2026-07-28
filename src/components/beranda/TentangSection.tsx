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
    <section className="bg-white dark:bg-[#0F1825] py-16 border-t border-slate-100 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: Angka */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              {angka.map((item) => (
                <div
                  key={item.satuan}
                  className="rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-[#F8FAFC] dark:bg-[#162133] p-6 text-center"
                >
                  <p
                    className="text-4xl font-extrabold leading-none mb-1"
                    style={{ color: "#1D6FCA" }}
                  >
                    {item.nilai}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.satuan}</p>
                </div>
              ))}
            </div>

            {/* Official badge */}
            <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-[#EBF4FF] dark:bg-blue-900/20 border border-[#BFDBFE] dark:border-blue-800/30">
              <div className="flex h-5 w-8 overflow-hidden rounded shadow-sm shrink-0">
                <div className="w-1/2 bg-red-500" />
                <div className="w-1/2 bg-white" />
              </div>
              <p className="text-sm text-[#1D6FCA] dark:text-blue-400 font-semibold">
                SITARA — Resmi BPS Kabupaten Toli-Toli
              </p>
              <a
                href="https://tolitolikab.bps.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[#1D6FCA] hover:opacity-70"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <span className="section-tag mb-4">Sistem Informasi Indikator Strategis (SITARA)</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C2340] dark:text-white mb-4 leading-tight">
              SITARA<br />Kabupaten Toli-Toli
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              SITARA adalah platform resmi BPS Toli-Toli yang menyajikan data dan
              indikator statistik strategis daerah secara digital, transparan, dan mudah
              diakses oleh masyarakat, pemerintah daerah, maupun peneliti.
            </p>
            <ul className="space-y-3">
              {fitur.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: "#1D6FCA" }}
                    strokeWidth={2.5}
                  />
                  <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
