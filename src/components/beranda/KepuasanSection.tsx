"use client";
import { useState } from "react";
import { Star, Send, CheckCircle, ChevronRight, Users } from "lucide-react";
import { kepuasanApi } from "@/lib/api";

const USABILITY = [
  { key: "u1", label: "Website mudah dinavigasi" },
  { key: "u2", label: "Tampilan antarmuka menarik dan profesional" },
  { key: "u3", label: "Informasi yang disajikan mudah dipahami" },
  { key: "u4", label: "Fitur pencarian/filter mudah digunakan" },
  { key: "u5", label: "Website dapat diakses dengan cepat" },
];

const KONTEN = [
  { key: "k1", label: "Data indikator yang disajikan lengkap" },
  { key: "k2", label: "Grafik dan visualisasi membantu pemahaman" },
  { key: "k3", label: "Infografis yang disajikan informatif" },
  { key: "k4", label: "Fitur unduh data sangat membantu" },
  { key: "k5", label: "Peta tematik mempermudah analisis spasial" },
];

const KEPUASAN = [
  { key: "s1", label: "Kepuasan terhadap tampilan website" },
  { key: "s2", label: "Kepuasan terhadap kelengkapan data" },
  { key: "s3", label: "Kepuasan terhadap fitur unduh" },
  { key: "s4", label: "Kepuasan keseluruhan terhadap SITARA" },
];

const LABELS_SETUJU = ["Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju"];
const LABELS_PUAS   = ["Sangat Tidak Puas", "Kurang Puas", "Cukup", "Puas", "Sangat Puas"];

function StarInput({
  value, onChange, labels,
}: { value: number; onChange: (v: number) => void; labels: string[] }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i} type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            className="w-6 h-6 transition-colors"
            fill={active >= i ? "#F59E0B" : "none"}
            stroke={active >= i ? "#F59E0B" : "#D1D5DB"}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium hidden sm:inline">
          {labels[value - 1]}
        </span>
      )}
    </div>
  );
}

function SatisfactionInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i} type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            className="w-6 h-6 transition-colors"
            fill={active >= i ? "#10B981" : "none"}
            stroke={active >= i ? "#10B981" : "#D1D5DB"}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
          {LABELS_PUAS[value - 1]}
        </span>
      )}
    </div>
  );
}

function QuestionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-gray-50 dark:border-slate-700/30 last:border-0">
      <p className="text-xs text-gray-700 dark:text-slate-300 flex-1 leading-snug">{label}</p>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ no, title, color, children }: {
  no: string; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: color }}>{no}</span>
        <h3 className="text-sm font-semibold text-[#0C2340] dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function KepuasanSection({ hideHeader = false }: { hideHeader?: boolean }) {
  const [nama, setNama] = useState("");
  const [values, setValues] = useState<Record<string, number>>({});
  const [saran, setSaran] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const allKeys = [...USABILITY, ...KONTEN, ...KEPUASAN].map((q) => q.key);
  const answered = allKeys.filter((k) => (values[k] ?? 0) > 0).length;
  const total = allKeys.length;

  const handleChange = (k: string, v: number) => setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (answered < total) { setError("Mohon isi semua pertanyaan sebelum mengirim."); return; }
    setError("");
    setLoading(true);
    try {
      await kepuasanApi.submit({
        ...values,
        nama: nama.trim() || undefined,
        saran: saran.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setError("Gagal mengirim survei. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="bg-white dark:bg-[#0F1825] border-t border-slate-100 dark:border-slate-700/50 py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#0C2340] dark:text-white mb-2">Terima Kasih!</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            Respons Anda telah berhasil dikirim. Masukan Anda sangat berarti untuk pengembangan SITARA ke depan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-[#0F1825] border-t border-slate-100 dark:border-slate-700/50 py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {!hideHeader && (
          <div className="text-center mb-8">
            <span className="section-tag mb-2">Evaluasi Pengguna</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C2340] dark:text-white mb-2">
              Survei Kepuasan Pengguna SITARA
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Bantu kami meningkatkan SITARA dengan mengisi survei singkat ini.
            </p>
          </div>
        )}

        {/* Intro */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl px-5 py-4 mb-6 text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
          <p className="mb-1">
            Dalam rangka aktualisasi Latsar CPNS BPS Kabupaten Toli-Toli, kami memohon kesediaan Bapak/Ibu untuk menilai website SITARA.
            Tidak ada jawaban benar atau salah — mohon berikan penilaian sesuai pengalaman penggunaan Anda.
          </p>
          <p className="text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-1">
            <Users className="w-3.5 h-3.5 shrink-0" />
            Sebelum mengisi, pastikan Anda telah mencoba fitur-fitur yang tersedia di website ini.
          </p>
        </div>

        {/* Nama — di paling atas */}
        <div className="bg-gray-50 dark:bg-[#162133] rounded-xl border border-gray-100 dark:border-slate-700/50 px-5 py-4 mb-5">
          <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
            Nama <span className="font-normal text-gray-400">(opsional)</span>
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama Anda"
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] px-3 py-2 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D6FCA]"
          />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D6FCA] rounded-full transition-all duration-300"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">{answered}/{total} dijawab</span>
        </div>

        <div className="space-y-4 mb-4">
          {/* 3.1 Kemudahan Penggunaan */}
          <SectionCard no="3.1" title="Kemudahan Penggunaan (Usability)" color="#1D6FCA">
            {USABILITY.map((q) => (
              <QuestionRow key={q.key} label={q.label}>
                <StarInput value={values[q.key] ?? 0} onChange={(v) => handleChange(q.key, v)} labels={LABELS_SETUJU} />
              </QuestionRow>
            ))}
          </SectionCard>

          {/* 3.2 Kelengkapan Konten */}
          <SectionCard no="3.2" title="Kelengkapan dan Kualitas Konten" color="#059669">
            {KONTEN.map((q) => (
              <QuestionRow key={q.key} label={q.label}>
                <StarInput value={values[q.key] ?? 0} onChange={(v) => handleChange(q.key, v)} labels={LABELS_SETUJU} />
              </QuestionRow>
            ))}
          </SectionCard>

          {/* 3.3 Kepuasan Keseluruhan */}
          <SectionCard no="3.3" title="Kepuasan Keseluruhan" color="#F59E0B">
            {KEPUASAN.map((q) => (
              <QuestionRow key={q.key} label={q.label}>
                <SatisfactionInput value={values[q.key] ?? 0} onChange={(v) => handleChange(q.key, v)} />
              </QuestionRow>
            ))}
          </SectionCard>

          {/* 3.4 Saran */}
          <SectionCard no="3.4" title="Saran dan Masukan" color="#6366F1">
            <div className="px-5 py-4">
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-2 leading-snug">
                Saran dan masukan lainnya untuk pengembangan SITARA ke depan
              </p>
              <textarea
                value={saran}
                onChange={(e) => setSaran(e.target.value)}
                placeholder="Tuliskan saran atau masukan Anda di sini (opsional)..."
                rows={4}
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] px-3 py-2 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1] resize-none"
              />
            </div>
          </SectionCard>
        </div>

        {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1D6FCA] hover:bg-[#1558a8] disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Mengirim..." : "Kirim Survei"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
          Skala: 1 = Sangat Tidak Setuju/Puas &nbsp;·&nbsp; 5 = Sangat Setuju/Puas
        </p>
      </div>
    </section>
  );
}
