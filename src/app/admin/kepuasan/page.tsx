"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Star, Users, BarChart2, FileDown, RefreshCw, Inbox, Trash2, Pencil, X, Check, FileSpreadsheet } from "lucide-react";
import { kepuasanApi } from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Label pertanyaan ─────────────────────────────────────────
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

// ── Helper ───────────────────────────────────────────────────
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
            <div className="w-40 shrink-0"><ScoreBar value={values[i] ?? 0} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Star display (read-only) ─────────────────────────────────
function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className="w-3 h-3"
          fill={i <= value ? "#F59E0B" : "none"}
          stroke={i <= value ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────────
type Respons = Record<string, any>;

function EditModal({ row, onClose, onSaved }: { row: Respons; onClose: () => void; onSaved: () => void }) {
  const [nama, setNama] = useState(row.nama ?? "");
  const [saran, setSaran] = useState(row.saran ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await kepuasanApi.update(row.id, { nama: nama.trim() || null, saran: saran.trim() || null });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-[#162133] rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1A1A2E] dark:text-white text-sm">Edit Respons #{row.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Nama</label>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="—"
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-[#0F1825] px-3 py-2 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D6FCA]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Saran & Masukan</label>
            <textarea
              value={saran}
              onChange={(e) => setSaran(e.target.value)}
              rows={4}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-[#0F1825] px-3 py-2 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D6FCA] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            Batal
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D6FCA] hover:bg-[#1558a8] disabled:opacity-50 text-white text-xs font-semibold transition-colors">
            {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────
type Stats = {
  total: number; avgU: number; avgK: number; avgS: number;
  usability: Record<string, number>;
  konten: Record<string, number>;
  kepuasan: Record<string, number>;
} | null;

// ── Page ─────────────────────────────────────────────────────
export default function KepuasanPage() {
  const [stats, setStats]       = useState<Stats>(null);
  const [rows, setRows]         = useState<Respons[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editRow, setEditRow]   = useState<Respons | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [tab, setTab]           = useState<"stats" | "responden">("stats");

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, allRes] = await Promise.all([
        kepuasanApi.getStats(),
        kepuasanApi.getAll(),
      ]);
      setStats(statsRes.data.total === 0 ? null : statsRes.data);
      setRows(allRes.data);
    } catch {
      setStats(null); setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus respons ini?")) return;
    setDeleting(id);
    try {
      await kepuasanApi.delete(id);
      await load();
    } finally {
      setDeleting(null);
    }
  };

  const avgRow = (row: Respons) => {
    const vals = ['u1','u2','u3','u4','u5','k1','k2','k3','k4','k5','s1','s2','s3','s4']
      .map((k) => Number(row[k]));
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const tglExport = () => new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1 – Ringkasan
    const summary: any[][] = [
      ["HASIL SURVEI KEPUASAN PENGGUNA SITARA"],
      ["Tanggal Export", tglExport()],
      ["Total Responden", rows.length],
      [],
      ["RATA-RATA PER ASPEK"],
      ["Aspek", "Rata-rata (dari 5,00)"],
      ["Kemudahan Penggunaan (Usability)", stats ? Number(stats.avgU.toFixed(2)) : "-"],
      ["Kelengkapan & Kualitas Konten",    stats ? Number(stats.avgK.toFixed(2)) : "-"],
      ["Kepuasan Keseluruhan",             stats ? Number(stats.avgS.toFixed(2)) : "-"],
      [],
      ["DETAIL RATA-RATA PER PERTANYAAN"],
      ["Kode", "Pertanyaan", "Rata-rata"],
      ...U_LABELS.map((l, i) => [`U${i+1}`, l, stats ? Number((stats.usability[`u${i+1}`] ?? 0).toFixed(2)) : "-"]),
      ...K_LABELS.map((l, i) => [`K${i+1}`, l, stats ? Number((stats.konten[`k${i+1}`] ?? 0).toFixed(2)) : "-"]),
      ...S_LABELS.map((l, i) => [`S${i+1}`, l, stats ? Number((stats.kepuasan[`s${i+1}`] ?? 0).toFixed(2)) : "-"]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Ringkasan");

    // Sheet 2 – Data Responden
    const header = ["No","Nama","U1","U2","U3","U4","U5","K1","K2","K3","K4","K5","S1","S2","S3","S4","Avg Usability","Avg Konten","Avg Kepuasan","Avg Total","Saran","Tanggal"];
    const dataRows = rows.map((r, i) => [
      i + 1,
      r.nama || "",
      r.u1, r.u2, r.u3, r.u4, r.u5,
      r.k1, r.k2, r.k3, r.k4, r.k5,
      r.s1, r.s2, r.s3, r.s4,
      Number(((r.u1+r.u2+r.u3+r.u4+r.u5)/5).toFixed(2)),
      Number(((r.k1+r.k2+r.k3+r.k4+r.k5)/5).toFixed(2)),
      Number(((r.s1+r.s2+r.s3+r.s4)/4).toFixed(2)),
      Number(avgRow(r)),
      r.saran || "",
      new Date(r.createdAt).toLocaleDateString("id-ID"),
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header, ...dataRows]), "Data Responden");

    XLSX.writeFile(wb, `survei-kepuasan-sitara-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Hasil Survei Kepuasan Pengguna SITARA", 14, 16);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Tanggal export: ${tglExport()}  ·  Total responden: ${rows.length}`, 14, 22);
    if (stats) {
      doc.text(
        `Usability: ${stats.avgU.toFixed(2)}   Konten: ${stats.avgK.toFixed(2)}   Kepuasan: ${stats.avgS.toFixed(2)}`,
        14, 27,
      );
    }
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 32,
      head: [["No","Nama","Avg Usability","Avg Konten","Avg Kepuasan","Avg Total","Saran","Tanggal"]],
      body: rows.map((r, i) => [
        i + 1,
        r.nama || "—",
        ((r.u1+r.u2+r.u3+r.u4+r.u5)/5).toFixed(2),
        ((r.k1+r.k2+r.k3+r.k4+r.k5)/5).toFixed(2),
        ((r.s1+r.s2+r.s3+r.s4)/4).toFixed(2),
        avgRow(r),
        r.saran || "—",
        new Date(r.createdAt).toLocaleDateString("id-ID"),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [29, 111, 202], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 6: { cellWidth: 60 } },
    });

    doc.save(`survei-kepuasan-sitara-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <AdminLayout>
      {editRow && (
        <EditModal row={editRow} onClose={() => setEditRow(null)} onSaved={() => { setEditRow(null); load(); }} />
      )}

      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">Hasil Survei Kepuasan Pengguna SITARA</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Rekapitulasi hasil survei dari website · {rows.length} responden
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {rows.length > 0 && (
              <>
                <button
                  onClick={exportExcel}
                  title="Ekspor Excel"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel
                </button>
                <button
                  onClick={exportPDF}
                  title="Ekspor PDF"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  PDF
                </button>
              </>
            )}
            <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
          {([["stats", "Ringkasan Skor"], ["responden", "Data Responden"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === key ? "bg-white dark:bg-[#162133] text-[#1D6FCA] shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Memuat data...</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-slate-600" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">Belum ada responden</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs">
              Share link <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">/survei-kepuasan</span> kepada pengguna untuk mulai mengumpulkan respons.
            </p>
          </div>
        ) : tab === "stats" ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Responden",      value: String(rows.length), unit: "orang",    color: "#6366F1", icon: Users },
                { label: "Kemudahan Penggunaan", value: stats ? stats.avgU.toFixed(2) : "—", unit: "dari 5,00", color: "#2196F3", icon: BarChart2 },
                { label: "Kelengkapan & Konten", value: stats ? stats.avgK.toFixed(2) : "—", unit: "dari 5,00", color: "#059669", icon: FileDown },
                { label: "Kepuasan Keseluruhan", value: stats ? stats.avgS.toFixed(2) : "—", unit: "dari 5,00", color: "#F59E0B", icon: Star },
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

            {stats && (
              <>
                <ScoreTable no="3.1" title="Kemudahan Penggunaan (Usability)" color="#2196F3"
                  labels={U_LABELS} values={["u1","u2","u3","u4","u5"].map((k) => stats.usability[k] ?? 0)} />
                <ScoreTable no="3.2" title="Kelengkapan dan Kualitas Konten" color="#059669"
                  labels={K_LABELS} values={["k1","k2","k3","k4","k5"].map((k) => stats.konten[k] ?? 0)} />
                <ScoreTable no="3.3" title="Kepuasan Keseluruhan" color="#F59E0B"
                  labels={S_LABELS} values={["s1","s2","s3","s4"].map((k) => stats.kepuasan[k] ?? 0)} />
              </>
            )}
          </>
        ) : (
          /* Tab Responden */
          <div className="bg-white dark:bg-[#0F1825] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-[#162133]">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-slate-400">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-slate-400">Nama</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-500 dark:text-slate-400">Usability</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-500 dark:text-slate-400">Konten</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-500 dark:text-slate-400">Kepuasan</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-500 dark:text-slate-400">Rerata</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-slate-400">Saran</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-slate-400">Tanggal</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const avgU = ((row.u1+row.u2+row.u3+row.u4+row.u5)/5).toFixed(1);
                    const avgK = ((row.k1+row.k2+row.k3+row.k4+row.k5)/5).toFixed(1);
                    const avgS = ((row.s1+row.s2+row.s3+row.s4)/4).toFixed(1);
                    return (
                      <tr key={row.id} className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="py-3 px-4 text-gray-400 dark:text-slate-500">{i + 1}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-slate-300 font-medium">
                          {row.nama || <span className="text-gray-400 dark:text-slate-500 italic">—</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-[#2196F3]">{avgU}</span>
                          <div className="flex justify-center mt-0.5"><Stars value={Math.round(+avgU)} /></div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-[#059669]">{avgK}</span>
                          <div className="flex justify-center mt-0.5"><Stars value={Math.round(+avgK)} /></div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-[#F59E0B]">{avgS}</span>
                          <div className="flex justify-center mt-0.5"><Stars value={Math.round(+avgS)} /></div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-gray-700 dark:text-slate-200">
                          {avgRow(row)}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-slate-400 max-w-[180px]">
                          {row.saran
                            ? <span title={row.saran} className="line-clamp-2 leading-snug">{row.saran}</span>
                            : <span className="italic text-gray-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-400 dark:text-slate-500 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditRow(row)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#1D6FCA] dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              disabled={deleting === row.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                              title="Hapus"
                            >
                              {deleting === row.id
                                ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin block" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
