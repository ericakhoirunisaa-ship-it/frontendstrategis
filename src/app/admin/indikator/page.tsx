"use client";
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState, useRef, useMemo } from "react";
import { indikatorApi, uploadApi } from "@/lib/api";
import { Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle, X, Pencil, Search } from "lucide-react";

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
}

const KATEGORI_OPTIONS = [
  "Ekonomi",
  "Pembangunan Manusia",
  "Gender",
  "Kependudukan",
  "Kemiskinan",
  "Pertanian",
  "Lainnya",
];

const EMPTY_FORM = {
  nama: "", satuan: "", kategori: "Lainnya", tipeChart: "bar",
  deskripsi: "", definisi: "", metodologi: "", sumberData: "", interpretasi: "",
};

type EditForm = {
  nama: string; satuan: string; kategori: string; tipeChart: string;
  deskripsi: string; definisi: string; metodologi: string; sumberData: string; interpretasi: string;
};

const INPUT_CLS = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0B1120] text-[#1A1A2E] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-400 dark:placeholder:text-slate-500";

export default function AdminIndikatorPage() {
  const [indikators, setIndikators] = useState<Indikator[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ nama: "", satuan: "", kategori: "Lainnya", tipeChart: "bar", deskripsi: "", definisi: "", metodologi: "", sumberData: "", interpretasi: "" });
  const [editSaving, setEditSaving] = useState(false);

  const [uploadIndId, setUploadIndId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[]; totalRows: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => indikatorApi.getAll().then((r) => setIndikators(r.data));
  useEffect(() => { load(); }, []);

  const filteredIndikators = useMemo(() => {
    if (!search.trim()) return indikators;
    const q = search.toLowerCase();
    return indikators.filter(
      (ind) =>
        ind.nama.toLowerCase().includes(q) ||
        (ind.kategori || "").toLowerCase().includes(q) ||
        ind.satuan.toLowerCase().includes(q)
    );
  }, [indikators, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await indikatorApi.create(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus indikator "${nama}" beserta semua datanya?`)) return;
    await indikatorApi.delete(id);
    if (editId === id) setEditId(null);
    load();
  };

  const openEdit = (ind: Indikator) => {
    setEditId(ind.id);
    setEditForm({
      nama: ind.nama, satuan: ind.satuan, kategori: ind.kategori || "Lainnya", tipeChart: ind.tipeChart,
      deskripsi: ind.deskripsi || "", definisi: ind.definisi || "",
      metodologi: ind.metodologi || "", sumberData: ind.sumberData || "", interpretasi: ind.interpretasi || "",
    });
    setShowForm(false);
    setUploadIndId(null);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditSaving(true);
    try {
      await indikatorApi.update(editId, editForm);
      setEditId(null);
      load();
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
    if (!selectedFile || !uploadIndId) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await uploadApi.importCsv(selectedFile, uploadIndId);
      setUploadResult(res.data);
      setSelectedFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setUploadResult({ inserted: 0, errors: [err?.response?.data?.message || "Import gagal"] });
    }
    setUploading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-gray-500 dark:text-slate-400 text-sm flex-1">
            Kelola indikator data strategis dan upload data dari CSV.
          </p>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari indikator..."
                className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#1E2D42] text-[#1A1A2E] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 w-48 sm:w-56 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#2196F3] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Tambah Indikator
            </button>
          </div>
        </div>

        {/* Form Tambah */}
        {showForm && (
          <div className="bg-white dark:bg-[#162133] rounded-2xl p-6 border border-blue-100 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1A2E] dark:text-white">Tambah Indikator Baru</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              {[
                { label: "Nama Indikator", key: "nama", placeholder: "Pertumbuhan Ekonomi" },
                { label: "Satuan", key: "satuan", placeholder: "%, Juta Rp, Jiwa" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className={INPUT_CLS}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className={INPUT_CLS}
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Tipe Chart</label>
                <select
                  value={form.tipeChart}
                  onChange={(e) => setForm({ ...form, tipeChart: e.target.value })}
                  className={INPUT_CLS}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={2}
                  className={INPUT_CLS}
                />
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
                      <textarea
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        rows={2}
                        placeholder={placeholder}
                        className={`${INPUT_CLS} resize-none`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-sm font-medium"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Indikator */}
        <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
          {search && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Menampilkan {filteredIndikators.length} dari {indikators.length} indikator
              </p>
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#1E2D42] border-b border-gray-100 dark:border-slate-700/50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-slate-400 font-medium">Nama</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-slate-400 font-medium hidden sm:table-cell">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-slate-400 font-medium hidden md:table-cell">Satuan</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-slate-400 font-medium">Upload CSV</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filteredIndikators.map((ind) => (
                <React.Fragment key={ind.id}>
                  <tr className="border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50 dark:hover:bg-[#1E2D42]/60">
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1A1A2E] dark:text-white">{ind.nama}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{ind.slug}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-slate-400 hidden sm:table-cell text-xs">{ind.kategori || "Lainnya"}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-slate-400 hidden md:table-cell">{ind.satuan}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => { setUploadIndId(ind.id); setUploadResult(null); setPreview(null); setSelectedFile(null); setEditId(null); }}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#2196F3] hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload CSV
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => editId === ind.id ? setEditId(null) : openEdit(ind)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            editId === ind.id
                              ? "bg-blue-50 dark:bg-blue-900/30 text-[#2196F3]"
                              : "text-gray-300 dark:text-slate-600 hover:text-[#2196F3] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ind.id, ind.nama)}
                          className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Form edit inline */}
                  {editId === ind.id && (
                    <tr className="border-b border-blue-50 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
                      <td colSpan={5} className="px-6 py-5">
                        <p className="text-xs font-semibold text-[#2196F3] mb-3">Edit Indikator — {ind.nama}</p>
                        <form onSubmit={handleEditSave} className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Nama Indikator</label>
                            <input
                              value={editForm.nama}
                              onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                              required
                              className={INPUT_CLS}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Satuan</label>
                            <input
                              value={editForm.satuan}
                              onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value })}
                              required
                              className={INPUT_CLS}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Kategori</label>
                            <select
                              value={editForm.kategori}
                              onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
                              className={INPUT_CLS}
                            >
                              {KATEGORI_OPTIONS.map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Tipe Chart</label>
                            <select
                              value={editForm.tipeChart}
                              onChange={(e) => setEditForm({ ...editForm, tipeChart: e.target.value })}
                              className={INPUT_CLS}
                            >
                              <option value="bar">Bar Chart</option>
                              <option value="line">Line Chart</option>
                              <option value="area">Area Chart</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Deskripsi Singkat</label>
                            <textarea
                              value={editForm.deskripsi}
                              onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                              rows={2}
                              className={INPUT_CLS}
                            />
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
                                  <textarea
                                    value={(editForm as any)[key]}
                                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                    rows={2}
                                    placeholder={placeholder}
                                    className={`${INPUT_CLS} resize-none`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-2 flex gap-2">
                            <button
                              type="submit"
                              disabled={editSaving}
                              className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors disabled:opacity-60"
                            >
                              {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              Simpan Perubahan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditId(null)}
                              className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredIndikators.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 dark:text-slate-500">
                    {search ? `Tidak ada indikator yang cocok dengan "${search}".` : "Belum ada indikator."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Upload CSV Panel */}
        {uploadIndId !== null && (
          <div className="bg-white dark:bg-[#162133] rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1A2E] dark:text-white">
                Upload CSV — {indikators.find((i) => i.id === uploadIndId)?.nama}
              </h3>
              <button onClick={() => setUploadIndId(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
              Format CSV: kolom <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">tahun</code>,{" "}
              <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">daerah</code> (opsional),{" "}
              dan kolom numerik (mis. <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">jumlah_penduduk_jiwa</code>,{" "}
              <code className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">nilai</code>, dll).
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
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              />
            </div>

            {/* Preview */}
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

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${uploadResult.inserted > 0 ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30" : "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"}`}>
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
                className="flex items-center gap-2 bg-[#2196F3] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {uploading ? "Mengimpor..." : "Import Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
