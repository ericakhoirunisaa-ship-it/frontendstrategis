"use client";
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState, useRef, useMemo } from "react";
import { indikatorApi, uploadApi, dataPointApi } from "@/lib/api";
import {
  Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle, X,
  Pencil, Search, MessageSquare, Save, ChevronDown, ChevronRight,
  Database, Settings, FileSpreadsheet,
} from "lucide-react";

interface Indikator {
  id: number;
  nama: string;
  slug: string;
  satuan: string;
  kategori: string;
  tipeChart: string;
  deskripsi?: string;
  definisi?: string;
  metodologi?: string;
  sumberData?: string;
  interpretasi?: string;
  aktif: boolean;
  filterTahun: boolean;
  filterDaerah: boolean;
  filterKolom: boolean;
}

interface DataPointRow {
  id: number;
  tahun: number;
  daerah: string;
  kolom: string;
  nilai: number;
  keterangan?: string | null;
}

const CATEGORY_DEFS = [
  { key: "A", label: "Kependudukan",                     color: "#1D6FCA", kategori: "Kependudukan" },
  { key: "B", label: "Ekonomi",                          color: "#059669", kategori: "Ekonomi" },
  { key: "C", label: "Kemiskinan",                       color: "#D97706", kategori: "Kemiskinan" },
  { key: "D", label: "Ketenagakerjaan",                  color: "#7C3AED", kategori: "Ketenagakerjaan" },
  { key: "E", label: "Indeks Pembangunan Manusia (IPM)", color: "#DC2626", kategori: "Indeks Pembangunan Manusia (IPM)" },
  { key: "F", label: "Pendidikan",                       color: "#16A34A", kategori: "Pendidikan" },
  { key: "G", label: "Lainnya",                          color: "#64748B", kategori: "Lainnya" },
] as const;

const KATEGORI_OPTIONS = CATEGORY_DEFS.map((c) => c.kategori);

const EMPTY_FORM = {
  nama: "", satuan: "", kategori: "Lainnya", tipeChart: "bar",
  deskripsi: "", definisi: "", metodologi: "", sumberData: "", interpretasi: "",
  filterTahun: true, filterDaerah: true, filterKolom: true,
};

type EditForm = {
  nama: string; satuan: string; kategori: string; tipeChart: string;
  deskripsi: string; definisi: string; metodologi: string; sumberData: string; interpretasi: string;
  filterTahun: boolean; filterDaerah: boolean; filterKolom: boolean;
};

type Tab = "upload" | "edit" | "keterangan";

const INPUT_CLS = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0B1120] text-[#1A1A2E] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-400 dark:placeholder:text-slate-500";

// ── Sidebar Category Group ────────────────────────────────────────────────────

function SidebarCategoryGroup({
  cat,
  indikators,
  selectedId,
  onSelect,
}: {
  cat: typeof CATEGORY_DEFS[number];
  indikators: Indikator[];
  selectedId: number | null;
  onSelect: (ind: Indikator) => void;
}) {
  const [open, setOpen] = useState(indikators.some((i) => i.id === selectedId));

  useEffect(() => {
    if (indikators.some((i) => i.id === selectedId)) setOpen(true);
  }, [selectedId, indikators]);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
            style={{ backgroundColor: cat.color }}
          >
            {cat.key}
          </span>
          <span className="text-[12px] font-semibold text-gray-700 dark:text-slate-300 text-left leading-tight">{cat.label}</span>
          {indikators.length > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-slate-500">({indikators.length})</span>
          )}
        </span>
        {open
          ? <ChevronDown className="w-3 h-3 text-gray-400 dark:text-slate-500 shrink-0" />
          : <ChevronRight className="w-3 h-3 text-gray-400 dark:text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="ml-3 pl-3 border-l-2 mt-0.5 mb-1 space-y-0.5" style={{ borderColor: cat.color + "40" }}>
          {indikators.length === 0 ? (
            <p className="px-2 py-1.5 text-[11px] text-gray-300 dark:text-slate-600 italic">Belum ada indikator</p>
          ) : (
            indikators.map((ind) => (
              <button
                key={ind.id}
                onClick={() => onSelect(ind)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] transition-colors leading-snug ${
                  selectedId === ind.id
                    ? "font-semibold text-white"
                    : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 font-medium"
                }`}
                style={selectedId === ind.id ? { backgroundColor: cat.color } : undefined}
              >
                {ind.nama}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminIndikatorPage() {
  const [indikators, setIndikators] = useState<Indikator[]>([]);
  const [search, setSearch] = useState("");
  const [selectedInd, setSelectedInd] = useState<Indikator | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  // Tambah indikator
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);

  // Edit indikator
  const [editForm, setEditForm] = useState<EditForm>({
    nama: "", satuan: "", kategori: "Lainnya", tipeChart: "bar",
    deskripsi: "", definisi: "", metodologi: "", sumberData: "", interpretasi: "",
    filterTahun: true, filterDaerah: true, filterKolom: true,
  });
  const [editSaving, setEditSaving] = useState(false);

  // Upload CSV
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[]; totalRows: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keterangan
  const [keteranganRows, setKeteranganRows] = useState<DataPointRow[]>([]);
  const [keteranganEdits, setKeteranganEdits] = useState<Record<number, string>>({});
  const [keteranganLoading, setKeteranganLoading] = useState(false);
  const [keteranganSaving, setKeteranganSaving] = useState<number | null>(null);

  const load = () => indikatorApi.getAll().then((r) => setIndikators(r.data));
  useEffect(() => { load(); }, []);

  // Sync editForm when selectedInd changes
  useEffect(() => {
    if (!selectedInd) return;
    setEditForm({
      nama: selectedInd.nama, satuan: selectedInd.satuan,
      kategori: selectedInd.kategori || "Lainnya", tipeChart: selectedInd.tipeChart,
      deskripsi: selectedInd.deskripsi || "", definisi: selectedInd.definisi || "",
      metodologi: selectedInd.metodologi || "", sumberData: selectedInd.sumberData || "",
      interpretasi: selectedInd.interpretasi || "",
      filterTahun: selectedInd.filterTahun ?? true,
      filterDaerah: selectedInd.filterDaerah ?? true,
      filterKolom: selectedInd.filterKolom ?? true,
    });
  }, [selectedInd]);

  const kategoriGroups = useMemo(() => {
    const map = new Map<string, Indikator[]>(CATEGORY_DEFS.map((c) => [c.kategori, []]));
    for (const ind of indikators) {
      const key = CATEGORY_DEFS.find((c) => c.kategori === ind.kategori) ? ind.kategori : "Lainnya";
      map.get(key)?.push(ind);
    }
    return map;
  }, [indikators]);

  const filteredKategoriGroups = useMemo(() => {
    if (!search.trim()) return kategoriGroups;
    const q = search.toLowerCase();
    const result = new Map<string, Indikator[]>();
    for (const [kat, inds] of kategoriGroups) {
      const filtered = inds.filter(
        (i) => i.nama.toLowerCase().includes(q) || i.satuan.toLowerCase().includes(q)
      );
      result.set(kat, filtered);
    }
    return result;
  }, [kategoriGroups, search]);

  const handleSelectInd = (ind: Indikator) => {
    setSelectedInd(ind);
    setActiveTab("upload");
    setUploadResult(null);
    setPreview(null);
    setSelectedFile(null);
    setShowAddForm(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAddCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    try {
      await indikatorApi.create(addForm);
      setShowAddForm(false);
      setAddForm(EMPTY_FORM);
      await load();
    } catch {}
    setAddSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedInd) return;
    if (!confirm(`Hapus indikator "${selectedInd.nama}" beserta semua datanya?`)) return;
    await indikatorApi.delete(selectedInd.id);
    setSelectedInd(null);
    load();
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInd) return;
    setEditSaving(true);
    try {
      await indikatorApi.update(selectedInd.id, editForm);
      await load();
      setSelectedInd((prev) => prev ? { ...prev, ...editForm } : null);
    } catch {}
    setEditSaving(false);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setPreview(null);
    setUploadResult(null);
    try {
      const res = await uploadApi.preview(file);
      setPreview(res.data);
    } catch {}
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedInd) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await uploadApi.importCsv(selectedFile, selectedInd.id);
      setUploadResult(res.data);
      setSelectedFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setUploadResult({ inserted: 0, errors: [err?.response?.data?.message || "Import gagal"] });
    }
    setUploading(false);
  };

  const openKeterangan = async () => {
    if (!selectedInd) return;
    setKeteranganRows([]);
    setKeteranganEdits({});
    setKeteranganLoading(true);
    try {
      const res = await indikatorApi.getBySlug(selectedInd.slug);
      const rows: DataPointRow[] = res.data.data || [];
      setKeteranganRows(rows);
      const edits: Record<number, string> = {};
      for (const r of rows) edits[r.id] = r.keterangan || "";
      setKeteranganEdits(edits);
    } finally {
      setKeteranganLoading(false);
    }
  };

  const saveKeterangan = async (id: number) => {
    setKeteranganSaving(id);
    try {
      await dataPointApi.updateKeterangan(id, keteranganEdits[id] || "");
      setKeteranganRows((prev) =>
        prev.map((r) => r.id === id ? { ...r, keterangan: keteranganEdits[id] || null } : r)
      );
    } finally {
      setKeteranganSaving(null);
    }
  };

  const activeCat = CATEGORY_DEFS.find((c) => c.kategori === selectedInd?.kategori);

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "upload",     label: "Upload Data CSV",    icon: FileSpreadsheet },
    { key: "edit",       label: "Edit Info Indikator", icon: Settings },
    { key: "keterangan", label: "Keterangan Data",    icon: MessageSquare },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-gray-500 dark:text-slate-400 text-sm flex-1">
            Pilih indikator di panel kiri, lalu kelola data dan pengaturannya.
          </p>
          <button
            onClick={() => { setShowAddForm(true); setSelectedInd(null); }}
            className="flex items-center gap-2 bg-[#2196F3] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Indikator
          </button>
        </div>

        {/* Form Tambah Indikator */}
        {showAddForm && (
          <div className="bg-white dark:bg-[#162133] rounded-2xl p-6 border border-blue-100 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1A2E] dark:text-white">Tambah Indikator Baru</h3>
              <button onClick={() => setShowAddForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddCreate} className="grid grid-cols-2 gap-3">
              {[
                { label: "Nama Indikator", key: "nama", placeholder: "Pertumbuhan Ekonomi" },
                { label: "Satuan", key: "satuan", placeholder: "%, Juta Rp, Jiwa" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{label}</label>
                  <input
                    value={(addForm as any)[key]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className={INPUT_CLS}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Kategori</label>
                <select value={addForm.kategori} onChange={(e) => setAddForm({ ...addForm, kategori: e.target.value })} className={INPUT_CLS}>
                  {KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Tipe Chart</label>
                <select value={addForm.tipeChart} onChange={(e) => setAddForm({ ...addForm, tipeChart: e.target.value })} className={INPUT_CLS}>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Deskripsi Singkat</label>
                <textarea value={addForm.deskripsi} onChange={(e) => setAddForm({ ...addForm, deskripsi: e.target.value })} rows={2} className={INPUT_CLS} />
              </div>
              <div className="col-span-2 border-t border-gray-100 dark:border-slate-700/50 pt-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Kamus Indikator (opsional)</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { label: "Definisi", key: "definisi", placeholder: "Pengertian atau definisi indikator ini..." },
                    { label: "Metodologi / Cara Hitung", key: "metodologi", placeholder: "Rumus atau metode penghitungan..." },
                    { label: "Sumber Data", key: "sumberData", placeholder: "Contoh: Survei Sosial Ekonomi Nasional (Susenas)" },
                    { label: "Interpretasi", key: "interpretasi", placeholder: "Cara membaca nilai indikator ini..." },
                  ] as const).map(({ label, key, placeholder }) => (
                    <div key={key} className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{label}</label>
                      <textarea value={(addForm as any)[key]} onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })} rows={2} placeholder={placeholder} className={`${INPUT_CLS} resize-none`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 border-t border-gray-100 dark:border-slate-700/50 pt-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Pengaturan Filter</p>
                <div className="flex flex-wrap gap-5">
                  {([
                    { key: "filterTahun", label: "Tampilkan filter Tahun" },
                    { key: "filterDaerah", label: "Tampilkan filter Daerah" },
                    { key: "filterKolom", label: "Tampilkan filter Kolom" },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(addForm as any)[key]} onChange={(e) => setAddForm({ ...addForm, [key]: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex gap-2">
                <button type="submit" disabled={addSaving} className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                  {addSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Simpan
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1">

          {/* ── Sidebar Indikator ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm sticky top-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="p-3 border-b border-gray-100 dark:border-slate-700/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari indikator..."
                    className="w-full pl-8 pr-7 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0B1120] text-[#1A1A2E] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2">
                {CATEGORY_DEFS.map((cat) => (
                  <SidebarCategoryGroup
                    key={cat.key}
                    cat={cat}
                    indikators={filteredKategoriGroups.get(cat.kategori) || []}
                    selectedId={selectedInd?.id ?? null}
                    onSelect={handleSelectInd}
                  />
                ))}
                {indikators.length === 0 && (
                  <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-6">
                    Belum ada indikator. Klik "Tambah Indikator" di atas.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Panel Kanan ── */}
          <div className="lg:col-span-3">
            {!selectedInd ? (
              <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center justify-center h-72">
                <div className="text-center">
                  <Database className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-slate-500 text-sm">Pilih indikator di panel kiri untuk mengelola datanya.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header indikator terpilih */}
                <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {activeCat && (
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                          style={{ backgroundColor: activeCat.color }}
                        >
                          {activeCat.key}
                        </span>
                      )}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-0.5">
                          {selectedInd.kategori}
                        </p>
                        <h2 className="text-base font-bold text-[#1A1A2E] dark:text-white leading-tight">{selectedInd.nama}</h2>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                          {selectedInd.satuan} &nbsp;·&nbsp; {selectedInd.tipeChart} chart &nbsp;·&nbsp;
                          <span className="text-gray-300 dark:text-slate-600 font-mono">{selectedInd.slug}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/40 text-xs font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-[#0B1120] p-1 rounded-xl w-fit">
                    {TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveTab(key);
                          if (key === "keterangan") openKeterangan();
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          activeTab === key
                            ? "bg-white dark:bg-[#162133] text-[#2196F3] shadow-sm"
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab: Upload CSV */}
                {activeTab === "upload" && (
                  <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
                    <h3 className="font-semibold text-[#1A1A2E] dark:text-white mb-1">Upload Data CSV</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
                      Format kolom: <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">tahun</code>,{" "}
                      <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">daerah</code> (opsional),{" "}
                      dan kolom numerik (mis. <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">nilai</code>,{" "}
                      <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">jumlah_penduduk_jiwa</code>, dll).
                    </p>

                    <div
                      className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl p-8 text-center hover:border-[#2196F3] dark:hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileSelect(file);
                      }}
                    >
                      <Upload className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {selectedFile ? selectedFile.name : "Klik atau seret file CSV ke sini"}
                      </p>
                      <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">Format: .csv</p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                      />
                    </div>

                    {preview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Preview ({preview.totalRows} baris ditemukan):
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 dark:bg-[#1E2D42]">
                              <tr>
                                {preview.headers.map((h) => (
                                  <th key={h} className="px-3 py-2 text-left text-gray-500 dark:text-slate-400 font-medium">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {preview.rows.map((row, i) => (
                                <tr key={i} className="border-t border-gray-100 dark:border-slate-700/50">
                                  {preview.headers.map((h) => (
                                    <td key={h} className="px-3 py-1.5 text-gray-600 dark:text-slate-300">{row[h] ?? "—"}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {uploadResult && (
                      <div className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${
                        uploadResult.inserted > 0
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30"
                          : "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
                      }`}>
                        {uploadResult.inserted > 0
                          ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                          : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                        <div>
                          <p className={`text-sm font-medium ${uploadResult.inserted > 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                            {uploadResult.inserted > 0 ? `${uploadResult.inserted} data berhasil diimpor.` : "Import gagal."}
                          </p>
                          {uploadResult.errors.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {uploadResult.errors.map((e, i) => (
                                <li key={i} className="text-xs text-red-600 dark:text-red-400">{e}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleImport}
                        disabled={!selectedFile || uploading}
                        className="flex items-center gap-2 bg-[#2196F3] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-500 transition-colors"
                      >
                        {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {uploading ? "Mengimpor..." : "Import Sekarang"}
                      </button>
                      {selectedFile && (
                        <button
                          onClick={() => { setSelectedFile(null); setPreview(null); setUploadResult(null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Edit Info Indikator */}
                {activeTab === "edit" && (
                  <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
                    <h3 className="font-semibold text-[#1A1A2E] dark:text-white mb-4">Edit Info Indikator</h3>
                    <form onSubmit={handleEditSave} className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Nama Indikator</label>
                        <input value={editForm.nama} onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })} required className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Satuan</label>
                        <input value={editForm.satuan} onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value })} required className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Kategori</label>
                        <select value={editForm.kategori} onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })} className={INPUT_CLS}>
                          {KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Tipe Chart</label>
                        <select value={editForm.tipeChart} onChange={(e) => setEditForm({ ...editForm, tipeChart: e.target.value })} className={INPUT_CLS}>
                          <option value="bar">Bar Chart</option>
                          <option value="line">Line Chart</option>
                          <option value="area">Area Chart</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Deskripsi Singkat</label>
                        <textarea value={editForm.deskripsi} onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })} rows={2} className={INPUT_CLS} />
                      </div>
                      <div className="col-span-2 border-t border-gray-100 dark:border-slate-700/50 pt-3">
                        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Kamus Indikator</p>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { label: "Definisi", key: "definisi", placeholder: "Pengertian atau definisi indikator ini..." },
                            { label: "Metodologi / Cara Hitung", key: "metodologi", placeholder: "Rumus atau metode penghitungan..." },
                            { label: "Sumber Data", key: "sumberData", placeholder: "Contoh: Survei Sosial Ekonomi Nasional (Susenas)" },
                            { label: "Interpretasi", key: "interpretasi", placeholder: "Cara membaca nilai indikator ini..." },
                          ] as const).map(({ label, key, placeholder }) => (
                            <div key={key} className="col-span-2 md:col-span-1">
                              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{label}</label>
                              <textarea value={(editForm as any)[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} rows={2} placeholder={placeholder} className={`${INPUT_CLS} resize-none`} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2 border-t border-gray-100 dark:border-slate-700/50 pt-3">
                        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Pengaturan Filter</p>
                        <div className="flex flex-wrap gap-5">
                          {([
                            { key: "filterTahun", label: "Tampilkan filter Tahun" },
                            { key: "filterDaerah", label: "Tampilkan filter Daerah" },
                            { key: "filterKolom", label: "Tampilkan filter Kolom" },
                          ] as const).map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={(editForm as any)[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                              <span className="text-sm text-gray-600 dark:text-slate-300">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button type="submit" disabled={editSaving} className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors disabled:opacity-60">
                          {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab: Keterangan per Data */}
                {activeTab === "keterangan" && (
                  <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
                    <h3 className="font-semibold text-[#1A1A2E] dark:text-white mb-1">Keterangan / Interpretasi per Data</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
                      Klik ikon simpan per baris. Keterangan akan tampil di tabel Data Strategis publik saat hover.
                    </p>

                    {keteranganLoading ? (
                      <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Memuat data...
                      </div>
                    ) : keteranganRows.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-12">Belum ada data untuk indikator ini.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-100 dark:border-slate-700/50">
                              <th className="text-left py-2 px-2 text-gray-500 dark:text-slate-400 font-medium whitespace-nowrap">Tahun</th>
                              <th className="text-left py-2 px-2 text-gray-500 dark:text-slate-400 font-medium whitespace-nowrap">Daerah</th>
                              <th className="text-left py-2 px-2 text-gray-500 dark:text-slate-400 font-medium whitespace-nowrap">Kolom</th>
                              <th className="text-right py-2 px-2 text-gray-500 dark:text-slate-400 font-medium whitespace-nowrap">Nilai</th>
                              <th className="text-left py-2 px-2 text-gray-500 dark:text-slate-400 font-medium">Keterangan / Interpretasi</th>
                              <th className="py-2 px-2 w-10" />
                            </tr>
                          </thead>
                          <tbody>
                            {keteranganRows.map((row) => (
                              <tr key={row.id} className="border-b border-gray-50 dark:border-slate-700/30">
                                <td className="py-2 px-2 text-gray-600 dark:text-slate-300 whitespace-nowrap">{row.tahun}</td>
                                <td className="py-2 px-2 text-gray-600 dark:text-slate-300 whitespace-nowrap">{row.daerah}</td>
                                <td className="py-2 px-2 text-gray-400 dark:text-slate-500 whitespace-nowrap text-xs">{row.kolom}</td>
                                <td className="py-2 px-2 text-right font-semibold text-[#1A1A2E] dark:text-white whitespace-nowrap">
                                  {Number(row.nilai).toLocaleString("id-ID")}
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    value={keteranganEdits[row.id] ?? ""}
                                    onChange={(e) => setKeteranganEdits((prev) => ({ ...prev, [row.id]: e.target.value }))}
                                    placeholder="Tulis interpretasi angka ini..."
                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0B1120] text-[#1A1A2E] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-700 placeholder:text-gray-300"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <button
                                    onClick={() => saveKeterangan(row.id)}
                                    disabled={keteranganSaving === row.id}
                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors"
                                    title="Simpan"
                                  >
                                    {keteranganSaving === row.id
                                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      : <Save className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
