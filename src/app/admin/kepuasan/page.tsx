"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Star, Users, BarChart2, FileDown, RefreshCw, Inbox } from "lucide-react";
import { kepuasanApi } from "@/lib/api";

const U_LABELS = [
  "Website mudah dinavigasi",
  "Tampilan antarmuka menarik dan profesional",
  "Informasi yang disajikan mudah dipahami",
  "Fitur pencarian/filter mudah digunakan",
  "Website dapat diakses dengan cepat",
];
const K_LABELS = [
  "Data indikator yang disajikan lengkap",
  "Grafik dan visualisasi membantu pemahaman",
  "Infografis yang disajikan informatif",
  "Fitur unduh data sangat membantu",
  "Peta tematik mempermudah analisis spasial",
];
const S_LABELS = [
  "Kepuasan terhadap tampilan website",
  "Kepuasan terhadap kelengkapan data",
  "Kepuasan terhadap fitur unduh",
  "Kepuasan keseluruhan terhadap SITARA",
];

function ScoreBar({ value }: { value: number }) {
  const pct = ((value - 1) / 4) * 100;
  const color = value >= 4.5 ? "#059669" : value >= 4.0 ? "#2196F3" : "#F59E0B";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}

function ScoreTable({ title, no, color, labels, values }: {
  title: string; no: string; color: string; labels: string[]; values: number[];
}) {
  return (
    <div className="bg-white dark:bg-[#0F1825] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0" style={{ backgroundColor: color }}>{no}</span>
        <h3 className="font-semibold text-[#1A1A2E] dark:text-white text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-slate-700/30">
        {labels.map((label, i) => (
          <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-xs text-gray-600 dark:text-slate-300 flex-1 leading-snug">{label}</p>
            <div className="w-40 shrink-0">
              <ScoreBar value={values[i] ?? 0} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Stats = {
  total: number;
  avgU: number; avgK: number; avgS: number;
  usability: Record<string, number>;
  konten: Record<string, number>;
  kepuasan: Record<string, number>;
} | null;

export default function KepuasanPage() {
  const [stats, setStats] = useState<Stats>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await kepuasanApi.getStats();
      setStats(res.data.total === 0 ? { total: 0, avgU: 0, avgK: 0, avgS: 0, usability: {}, konten: {}, kepuasan: {} } : res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">Hasil Survei Kepuasan Pengguna SITARA</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Rekapitulasi hasil survei yang diisi melalui website
              </p>
            </div>
          </div>
          <button onClick={load} className="shrink-0 p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-slate-500 text-sm">
            Memuat data...
          </div>
        ) : !stats || stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-slate-600" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">Belum ada responden</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs">
              Survei kepuasan tersedia di halaman beranda. Hasil akan muncul di sini setelah ada yang mengisi.
            </p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Responden", value: String(stats.total), unit: "orang", color: "#6366F1", icon: Users },
                { label: "Kemudahan Penggunaan", value: stats.avgU.toFixed(2), unit: "dari 5,00", color: "#2196F3", icon: BarChart2 },
                { label: "Kelengkapan & Konten", value: stats.avgK.toFixed(2), unit: "dari 5,00", color: "#059669", icon: FileDown },
                { label: "Kepuasan Keseluruhan", value: stats.avgS.toFixed(2), unit: "dari 5,00", color: "#F59E0B", icon: Star },
              ].map(({ label, value, unit, color, icon: Icon }) => (
                <div key={label} className="bg-white dark:bg-[#0F1825] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-snug">{label}</p>
                  </div>
                  <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{unit}</p>
                </div>
              ))}
            </div>

            {/* Detail tables */}
            <ScoreTable
              no="3.1" title="Kemudahan Penggunaan (Usability)" color="#2196F3"
              labels={U_LABELS}
              values={["u1","u2","u3","u4","u5"].map((k) => stats.usability[k] ?? 0)}
            />
            <ScoreTable
              no="3.2" title="Kelengkapan dan Kualitas Konten" color="#059669"
              labels={K_LABELS}
              values={["k1","k2","k3","k4","k5"].map((k) => stats.konten[k] ?? 0)}
            />
            <ScoreTable
              no="3.3" title="Kepuasan Keseluruhan" color="#F59E0B"
              labels={S_LABELS}
              values={["s1","s2","s3","s4"].map((k) => stats.kepuasan[k] ?? 0)}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
