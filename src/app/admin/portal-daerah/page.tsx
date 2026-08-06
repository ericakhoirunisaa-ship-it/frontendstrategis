"use client";
import { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { portalDaerahApi } from "@/lib/api";
import {
  Plus, Pencil, Trash2, Eye, Upload, X, CheckCircle,
  Loader2, Table2, FileText, ChevronDown, ChevronUp,
  AlertCircle, RefreshCw, ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ──── Icon options ────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: "Users2",     label: "Kependudukan",  bg: "#DBEAFE", color: "#1D6FCA" },
  { value: "Heart",      label: "Kesehatan",     bg: "#FEE2E2", color: "#DC2626" },
  { value: "BookOpen",   label: "Pendidikan",    bg: "#FEF3C7", color: "#D97706" },
  { value: "Leaf",       label: "Pertanian",     bg: "#DCFCE7", color: "#16A34A" },
  { value: "Users",      label: "Sosial",        bg: "#EDE9FE", color: "#7C3AED" },
  { value: "Fish",       label: "Perikanan",     bg: "#CCFBF1", color: "#0D9488" },
  { value: "Wrench",     label: "Infrastruktur", bg: "#FFEDD5", color: "#EA580C" },
  { value: "Camera",     label: "Pariwisata",    bg: "#E0F2FE", color: "#0284C7" },
  { value: "TrendingUp", label: "Keuangan",      bg: "#D1FAE5", color: "#059669" },
  { value: "Wifi",       label: "Komunikasi",    bg: "#EEF2FF", color: "#4F46E5" },
];

const DINAS_OPTIONS = [
  "Dinas Kependudukan dan Pencatatan Sipil",
  "Dinas Kesehatan",
  "Dinas Pendidikan dan Kebudayaan",
  "Dinas Pertanian dan Ketahanan Pangan",
  "Dinas Sosial",
  "Dinas Kelautan dan Perikanan",
  "Dinas Pekerjaan Umum dan Penataan Ruang",
  "Dinas Pariwisata dan Ekonomi Kreatif",
  "Badan Perencanaan Pembangunan Daerah (BAPPEDA)",
  "Dinas Komunikasi dan Informatika",
  "Dinas Perdagangan dan Perindustrian",
  "Dinas Lingkungan Hidup",
  "Dinas Perhubungan",
  "Dinas Tenaga Kerja",
  "Sekretariat Daerah",
];

const TOPIK_OPTIONS = [
  "Kependudukan", "Kesehatan", "Pendidikan", "Pertanian",
  "Sosial", "Perikanan", "Infrastruktur", "Pariwisata",
  "Keuangan", "Komunikasi", "Lingkungan", "Perdagangan",
  "Transportasi", "Ketenagakerjaan",
];

// ──── Types ───────────────────────────────────────────────────
interface Dataset {
  id: number;
  judul: string;
  dinas: string;
  bidang: string;
  topik: string;
  tahunMulai: number;
  tahunAkhir: number;
  deskripsi?: string;
  tanggalUpdate: string;
  dilihat: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  columns: string[];
  aktif: boolean;
  createdAt: string;
  _count: { rows: number };
}

const EMPTY_FORM = {
  judul: "",
  dinas: "",
  bidang: "",
  topik: "",
  tahunMulai: new Date().getFullYear(),
  tahunAkhir: new Date().getFullYear(),
  tanggalUpdate: "",
  deskripsi: "",
  icon: "Users2",
  iconBg: "#DBEAFE",
  iconColor: "#1D6FCA",
};

// ──── CSV parser ──────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { columns: string[]; rows: Record<string, string | number>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { columns: [], rows: [] };
  const columns = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const row: Record<string, string | number> = {};
    columns.forEach((col, i) => {
      const v = vals[i] ?? "";
      const num = Number(v.replace(/[,.]/g, (m) => (m === "." ? "." : "")));
      row[col] = v !== "" && !isNaN(num) ? num : v;
    });
    return row;
  });
  return { columns, rows };
}

// ──── Main component ──────────────────────────────────────────
export default function AdminPortalDaerahPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [csvData, setCsvData] = useState<{ columns: string[]; rows: Record<string, string | number>[] } | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await portalDaerahApi.getAll({ admin: true });
      setDatasets(res.data);
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleIconSelect = (iconValue: string) => {
    const opt = ICON_OPTIONS.find((o) => o.value === iconValue);
    setForm((f) => ({
      ...f,
      icon: iconValue,
      iconBg: opt?.bg ?? f.iconBg,
      iconColor: opt?.color ?? f.iconColor,
    }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setShowPreview(true);
    };
    reader.readAsText(file, "UTF-8");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setCsvData(null);
    setCsvFileName("");
    setShowPreview(false);
    setError("");
    setShowForm(true);
  };

  const openEdit = (ds: Dataset) => {
    setEditingId(ds.id);
    setForm({
      judul: ds.judul,
      dinas: ds.dinas,
      bidang: ds.bidang,
      topik: ds.topik,
      tahunMulai: ds.tahunMulai,
      tahunAkhir: ds.tahunAkhir,
      tanggalUpdate: ds.tanggalUpdate,
      deskripsi: ds.deskripsi ?? "",
      icon: ds.icon,
      iconBg: ds.iconBg,
      iconColor: ds.iconColor,
    });
    setCsvData(null);
    setCsvFileName("");
    setShowPreview(false);
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.dinas || !form.bidang || !form.topik) {
      setError("Judul, Dinas, Bidang, dan Topik wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId !== null) {
        await portalDaerahApi.update(editingId, form);
        if (csvData) {
          await portalDaerahApi.replaceRows(editingId, { columns: csvData.columns, rows: csvData.rows });
        }
        setSuccess("Dataset berhasil diperbarui!");
      } else {
        if (!csvData || csvData.rows.length === 0) {
          setError("Upload file CSV terlebih dahulu untuk menambah data tabel.");
          setSaving(false);
          return;
        }
        await portalDaerahApi.create({
          ...form,
          columns: csvData.columns,
          rows: csvData.rows,
        });
        setSuccess("Dataset berhasil ditambahkan!");
      }
      setShowForm(false);
      setEditingId(null);
      load();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Gagal menyimpan. Periksa koneksi atau login kembali.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Hapus dataset "${judul}"?\n\nSemua baris data ikut terhapus.`)) return;
    try {
      await portalDaerahApi.delete(id);
      setSuccess("Dataset dihapus.");
      load();
      setTimeout(() => setSuccess(""), 2500);
    } catch {
      setError("Gagal menghapus.");
    }
  };

  const handleToggle = async (ds: Dataset) => {
    await portalDaerahApi.update(ds.id, { aktif: !ds.aktif });
    load();
  };

  const selectedIconOpt = ICON_OPTIONS.find((o) => o.value === form.icon);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-gray-500 text-sm">
          Kelola dataset yang berasal dari Organisasi Perangkat Daerah (OPD) Kabupaten Toli-Toli.
        </p>

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button className="ml-auto" onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── Form tambah/edit ── */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <h3 className="font-semibold text-[#0C2340] text-base">
                {editingId !== null ? "Edit Dataset" : "Tambah Dataset Baru"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Metadata grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Judul Dataset *</label>
                  <input
                    required
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    placeholder="Jumlah Penduduk per Kecamatan di Kabupaten Toli-Toli Tahun 2025"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Dinas / OPD *</label>
                  <select
                    required
                    value={form.dinas}
                    onChange={(e) => setForm({ ...form, dinas: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="">-- Pilih Dinas --</option>
                    {DINAS_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bidang *</label>
                  <input
                    required
                    value={form.bidang}
                    onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                    placeholder="Bidang Pelayanan Kesehatan"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Topik *</label>
                  <select
                    required
                    value={form.topik}
                    onChange={(e) => setForm({ ...form, topik: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="">-- Pilih Topik --</option>
                    {TOPIK_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal Update</label>
                  <input
                    value={form.tanggalUpdate}
                    onChange={(e) => setForm({ ...form, tanggalUpdate: e.target.value })}
                    placeholder="15 Juli 2025"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tahun Mulai</label>
                  <input
                    type="number"
                    value={form.tahunMulai}
                    onChange={(e) => setForm({ ...form, tahunMulai: parseInt(e.target.value) || 2025 })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tahun Akhir</label>
                  <input
                    type="number"
                    value={form.tahunAkhir}
                    onChange={(e) => setForm({ ...form, tahunAkhir: parseInt(e.target.value) || 2025 })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ikon Kategori</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg shrink-0"
                      style={{ backgroundColor: selectedIconOpt?.bg ?? "#DBEAFE" }}
                    />
                    <select
                      value={form.icon}
                      onChange={(e) => handleIconSelect(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Deskripsi</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    rows={3}
                    placeholder="Dataset ini berisi informasi tentang..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                </div>
              </div>

              {/* CSV Upload */}
              <div className="border border-dashed border-blue-300 rounded-xl p-5 bg-blue-50/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0C2340]">
                      {editingId !== null ? "Ganti Data Tabel (CSV)" : "Upload Data Tabel (CSV) *"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Baris pertama CSV dijadikan nama kolom. Semua baris data sebelumnya akan digantikan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D6FCA] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih CSV
                  </button>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
                </div>

                {csvFileName && (
                  <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{csvFileName}</span>
                    {csvData && (
                      <span className="text-blue-500">
                        — {csvData.columns.length} kolom, {csvData.rows.length} baris
                      </span>
                    )}
                    <button
                      type="button"
                      className="ml-auto text-blue-400 hover:text-blue-600"
                      onClick={() => {
                        setCsvData(null);
                        setCsvFileName("");
                        setShowPreview(false);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {csvData && csvData.rows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPreview((p) => !p)}
                    className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    {showPreview ? "Sembunyikan" : "Lihat"} Pratinjau Data
                    {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {showPreview && csvData && (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-blue-200">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="bg-[#1D6FCA] text-white">
                          {csvData.columns.map((col) => (
                            <th key={col} className="px-3 py-2 text-left whitespace-nowrap font-semibold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            {csvData.columns.map((col) => (
                              <td key={col} className="px-3 py-1.5 whitespace-nowrap text-slate-600">
                                {String(row[col] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.rows.length > 10 && (
                      <p className="text-xs text-gray-400 px-3 py-2">
                        Menampilkan 10 dari {csvData.rows.length} baris...
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1D6FCA] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? "Menyimpan..." : editingId !== null ? "Simpan Perubahan" : "Tambah Dataset"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Action bar ── */}
        {!showForm && (
          <div className="flex items-center justify-between">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1D6FCA] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Dataset
            </button>
            <button
              onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        )}

        {/* ── Dataset table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0C2340]">
              Daftar Dataset{" "}
              <span className="text-gray-400 font-normal text-sm">({datasets.length})</span>
            </h3>
            <Link
              href="/portal-daerah"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#1D6FCA] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Lihat Halaman Publik
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Table2 className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Belum ada dataset. Klik "Tambah Dataset" untuk mulai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Judul</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Dinas</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Topik</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Baris</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Dilihat</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Aktif</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((ds, i) => (
                    <tr
                      key={ds.id}
                      className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${
                        i === datasets.length - 1 ? "border-none" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#1A1A2E] line-clamp-2 max-w-xs leading-snug">
                          {ds.judul}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{ds.bidang}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-gray-600 max-w-[180px] leading-snug">{ds.dinas}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                          {ds.topik}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs text-gray-500 font-medium">
                        {ds._count.rows.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3.5 h-3.5" />
                          {ds.dilihat.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggle(ds)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            ds.aktif ? "bg-green-500" : "bg-gray-300"
                          }`}
                          title={ds.aktif ? "Aktif — klik untuk nonaktifkan" : "Nonaktif — klik untuk aktifkan"}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              ds.aktif ? "left-[22px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/portal-daerah/${ds.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEdit(ds)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ds.id, ds.judul)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
