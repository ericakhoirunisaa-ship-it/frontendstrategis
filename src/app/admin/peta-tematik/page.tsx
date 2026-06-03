"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { petaTematikApi, indikatorApi } from "@/lib/api";
import { Map, Plus, Pencil, Trash2, X, Save, AlertCircle, Link as LinkIcon } from "lucide-react";

interface PetaTematik {
  id: number;
  judul: string;
  deskripsi?: string;
  imageUrl?: string;
  geoJsonUrl?: string;
  indikatorId?: number;
  indikator?: { id: number; nama: string; slug: string } | null;
  createdAt: string;
}

interface Indikator {
  id: number;
  nama: string;
  slug: string;
}

const EMPTY_FORM = { judul: "", deskripsi: "", imageUrl: "", geoJsonUrl: "", indikatorId: "" };

export default function AdminPetaTematikPage() {
  const [items, setItems]     = useState<PetaTematik[]>([]);
  const [indikators, setIndikators] = useState<Indikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]   = useState<number | null>(null);
  const [form, setForm]       = useState({ ...EMPTY_FORM });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [petaRes, indRes] = await Promise.all([
        petaTematikApi.getAll(),
        indikatorApi.getAll(),
      ]);
      setItems(petaRes.data);
      setIndikators(indRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: PetaTematik) => {
    setEditId(item.id);
    setForm({
      judul: item.judul,
      deskripsi: item.deskripsi || "",
      imageUrl: item.imageUrl || "",
      geoJsonUrl: item.geoJsonUrl || "",
      indikatorId: item.indikatorId ? String(item.indikatorId) : "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.judul.trim()) { setError("Judul wajib diisi."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        geoJsonUrl: form.geoJsonUrl.trim() || undefined,
        indikatorId: form.indikatorId ? Number(form.indikatorId) : undefined,
      };
      if (editId !== null) {
        await petaTematikApi.update(editId, payload);
      } else {
        await petaTematikApi.create(payload);
      }
      setShowForm(false);
      await load();
    } catch {
      setError("Gagal menyimpan. Periksa koneksi atau data yang diisi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await petaTematikApi.delete(id);
      setDeleteId(null);
      await load();
    } catch {
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">Peta Tematik</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Kelola entri peta tematik yang ditampilkan di halaman publik.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2196F3] hover:bg-[#1976D2] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Peta
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">Memuat data...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Map className="w-12 h-12 text-gray-200 dark:text-slate-700 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">Belum ada entri peta tematik.</p>
              <button onClick={openCreate} className="mt-3 text-sm text-[#2196F3] hover:underline font-semibold">
                Tambah sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700/50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Judul</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider hidden md:table-cell">Indikator Terkait</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider hidden lg:table-cell">GeoJSON</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider hidden lg:table-cell">Gambar</th>
                    <th className="px-5 py-3 w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#1A1A2E] dark:text-white leading-tight">{item.judul}</p>
                        {item.deskripsi && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.deskripsi}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {item.indikator ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-lg">
                            <LinkIcon className="w-3 h-3" /> {item.indikator.nama}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {item.geoJsonUrl ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Ada
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {item.imageUrl ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Ada
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2196F3] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── Form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white dark:bg-[#162133] rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700/50">
              <h3 className="font-bold text-[#1A1A2E] dark:text-white">
                {editId !== null ? "Edit Peta Tematik" : "Tambah Peta Tematik"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Peta Kemiskinan Kab. Toli-Toli 2024"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={2}
                  placeholder="Deskripsi singkat peta tematik..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-300 dark:placeholder:text-slate-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">URL GeoJSON</label>
                <input
                  value={form.geoJsonUrl}
                  onChange={(e) => setForm({ ...form, geoJsonUrl: e.target.value })}
                  placeholder="https://example.com/data.geojson"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">URL Gambar</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="/uploads/peta-kemiskinan.png"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">Indikator Terkait</label>
                <select
                  value={form.indikatorId}
                  onChange={(e) => setForm({ ...form, indikatorId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
                >
                  <option value="">— Tidak ada —</option>
                  {indikators.map((ind) => (
                    <option key={ind.id} value={ind.id}>{ind.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-5">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#2196F3] hover:bg-[#1976D2] text-white transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162133] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A2E] dark:text-white">Hapus Peta Tematik?</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
