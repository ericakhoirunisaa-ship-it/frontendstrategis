"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Star, Users, CheckCircle2, BarChart2, FileDown } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const USABILITY = [
  { pernyataan: "Website mudah dinavigasi",                        ss: "10 (43,5%)", s: "12 (52,2%)", ts: "1 (4,3%)", rerata: 4.39 },
  { pernyataan: "Tampilan antarmuka menarik dan profesional",      ss: "11 (47,8%)", s: "11 (47,8%)", ts: "1 (4,3%)", rerata: 4.43 },
  { pernyataan: "Informasi yang disajikan mudah dipahami",         ss: "9 (39,1%)",  s: "13 (56,5%)", ts: "1 (4,3%)", rerata: 4.35 },
  { pernyataan: "Fitur pencarian/filter mudah digunakan",          ss: "8 (34,8%)",  s: "14 (60,9%)", ts: "1 (4,3%)", rerata: 4.30 },
  { pernyataan: "Website dapat diakses dengan cepat",              ss: "9 (39,1%)",  s: "12 (52,2%)", ts: "2 (8,7%)", rerata: 4.30 },
];

const KONTEN = [
  { pernyataan: "Data indikator yang disajikan lengkap",           ss: "8 (34,8%)",  s: "13 (56,5%)", ts: "2 (8,7%)", rerata: 4.26 },
  { pernyataan: "Grafik dan visualisasi membantu pemahaman",       ss: "12 (52,2%)", s: "10 (43,5%)", ts: "1 (4,3%)", rerata: 4.48 },
  { pernyataan: "Infografis yang disajikan informatif",            ss: "11 (47,8%)", s: "11 (47,8%)", ts: "1 (4,3%)", rerata: 4.43 },
  { pernyataan: "Fitur unduh data sangat membantu",                ss: "14 (60,9%)", s: "9 (39,1%)",  ts: "0 (0%)",   rerata: 4.61 },
  { pernyataan: "Peta tematik mempermudah analisis spasial",       ss: "10 (43,5%)", s: "11 (47,8%)", ts: "2 (8,7%)", rerata: 4.35 },
];

const KEPUASAN = [
  { pertanyaan: "Kepuasan terhadap tampilan website",  sp: "12 (52,2%)", p: "9 (39,1%)",  c: "2 (8,7%)", kp: "0" },
  { pertanyaan: "Kepuasan terhadap kelengkapan data",  sp: "10 (43,5%)", p: "11 (47,8%)", c: "2 (8,7%)", kp: "0" },
  { pertanyaan: "Kepuasan terhadap fitur unduh",       sp: "14 (60,9%)", p: "8 (34,8%)",  c: "1 (4,3%)", kp: "0" },
  { pertanyaan: "Kepuasan keseluruhan",                sp: "11 (47,8%)", p: "11 (47,8%)", c: "1 (4,3%)", kp: "0" },
];

const avgUsability = (USABILITY.reduce((s, r) => s + r.rerata, 0) / USABILITY.length).toFixed(2);
const avgKonten    = (KONTEN.reduce((s, r) => s + r.rerata, 0) / KONTEN.length).toFixed(2);
const avgAll       = ((+avgUsability + +avgKonten) / 2).toFixed(2);

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreBar({ value }: { value: number }) {
  const pct = ((value - 1) / 4) * 100;
  const color = value >= 4.5 ? "#059669" : value >= 4.2 ? "#2196F3" : "#F59E0B";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}

function SurveyTable({
  title, no, color, headers, rows, showScore,
}: {
  title: string; no: string; color: string;
  headers: string[];
  rows: { label: string; cols: string[]; score?: number }[];
  showScore: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#0F1825] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0"
          style={{ backgroundColor: color }}>{no}</span>
        <h3 className="font-semibold text-[#1A1A2E] dark:text-white text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-[#162133]">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400 w-1/3">
                {headers[0]}
              </th>
              {headers.slice(1).map((h) => (
                <th key={h} className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                <td className="py-3 px-4 text-gray-700 dark:text-slate-300 text-xs leading-snug">{row.label}</td>
                {row.cols.map((c, j) => (
                  <td key={j} className="py-3 px-3 text-center text-xs text-gray-600 dark:text-slate-400 whitespace-nowrap">
                    {c}
                  </td>
                ))}
                {showScore && row.score !== undefined && (
                  <td className="py-3 px-4 min-w-[100px]">
                    <ScoreBar value={row.score} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KepuasanPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">Hasil Survei Kepuasan Pengguna SITARA</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Evaluasi website SITARA BPS Kabupaten Toli-Toli · 23 responden (Pegawai BPS)
            </p>
          </div>
        </div>

        {/* Ringkasan skor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Rerata Kemudahan Penggunaan", value: avgUsability, color: "#2196F3", icon: BarChart2 },
            { label: "Rerata Kelengkapan & Konten",  value: avgKonten,    color: "#059669", icon: FileDown },
            { label: "Rerata Keseluruhan",            value: avgAll,       color: "#F59E0B", icon: Star },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-[#0F1825] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-snug">{label}</p>
              </div>
              <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">dari skala 5,00</p>
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${((+value - 1) / 4) * 100}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Kuesioner intro */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Pengantar Kuesioner</p>
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed space-y-2">
            <p>Kepada Yth. <strong className="text-gray-800 dark:text-white">Bapak/Ibu Pegawai BPS Kabupaten Toli-Toli</strong></p>
            <p>
              Dalam rangka pelaksanaan kegiatan aktualisasi dengan topik{" "}
              <em>"Pengembangan Sistem Informasi Indikator Strategis (SITARA) BPS Kabupaten Toli-Toli"</em>,
              kami melakukan evaluasi terhadap website SITARA sebagai media penyediaan informasi data indikator strategis Kabupaten Toli-Toli.
            </p>
            <p>
              Sebelum mengisi kuesioner, mohon Bapak/Ibu mengakses dan mencoba website SITARA melalui:{" "}
              <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">
                http://s.bps.go.id/SITARA7206
              </span>{" "}
              atau{" "}
              <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">
                https://strategis7206.zeabur.app/
              </span>
            </p>
            <p className="text-gray-400 dark:text-slate-500 italic">
              Tidak terdapat jawaban benar atau salah. Mohon memberikan penilaian secara objektif sesuai pengalaman penggunaan website.
            </p>
          </div>
        </div>

        {/* 3.1 Kemudahan Penggunaan */}
        <SurveyTable
          no="3.1" title="Kemudahan Penggunaan (Usability)" color="#2196F3"
          headers={["Pernyataan", "Sangat Setuju", "Setuju", "Tidak Setuju", "Rerata Skor"]}
          showScore
          rows={USABILITY.map((r) => ({ label: r.pernyataan, cols: [r.ss, r.s, r.ts], score: r.rerata }))}
        />

        {/* 3.2 Kelengkapan & Konten */}
        <SurveyTable
          no="3.2" title="Kelengkapan dan Kualitas Konten" color="#059669"
          headers={["Pernyataan", "Sangat Setuju", "Setuju", "Tidak Setuju", "Rerata Skor"]}
          showScore
          rows={KONTEN.map((r) => ({ label: r.pernyataan, cols: [r.ss, r.s, r.ts], score: r.rerata }))}
        />

        {/* 3.3 Kepuasan Keseluruhan */}
        <SurveyTable
          no="3.3" title="Kepuasan Keseluruhan" color="#F59E0B"
          headers={["Pertanyaan", "Sangat Puas", "Puas", "Cukup", "Kurang Puas"]}
          showScore={false}
          rows={KEPUASAN.map((r) => ({ label: r.pertanyaan, cols: [r.sp, r.p, r.c, r.kp] }))}
        />

        {/* Catatan */}
        <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-green-700 dark:text-green-400">
            Skala penilaian: <strong>5</strong> = Sangat Setuju/Sangat Puas &nbsp;·&nbsp;
            <strong>4</strong> = Setuju/Puas &nbsp;·&nbsp;
            <strong>3</strong> = Netral/Cukup &nbsp;·&nbsp;
            <strong>2</strong> = Tidak Setuju/Kurang Puas &nbsp;·&nbsp;
            <strong>1</strong> = Sangat Tidak Setuju &nbsp;·&nbsp;
            Total responden: <strong>23 orang</strong>
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}
