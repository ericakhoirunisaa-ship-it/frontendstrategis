"use client";
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { statistikApi } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";

interface Stat {
  id: number;
  label: string;
  nilai: string;
  satuan: string;
  tahun: number;
  icon?: string;
  warna: string;
  urutan: number;
}

const ICON_OPTIONS = ["BarChart2", "Users", "TrendingUp", "Award", "Activity", "Globe", "Home", "Briefcase"];

const EMPTY_FORM = {
  label: "",
  nilai: "",
  satuan: "",
  tahun: new Date().getFullYear(),
  icon: "BarChart2",
  warna: "#1D6FCA",
  urutan: 0,
};

type FormState = typeof EMPTY_FORM;

function StatForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  onSave: (f: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="grid grid-cols-2 gap-3"
    >
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
        <input
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          required
          placeholder="Jumlah Penduduk"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nilai</label>
        <input
          value={form.nilai}
          onChange={(e) => set("nilai", e.target.value)}
          required
          placeholder="236.020"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Satuan</label>
        <input
          value={form.satuan}
          onChange={(e) => set("satuan", e.target.value)}
          required
          placeholder="Jiwa, %, Poin"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
        <input
          type="number"
          value={form.tahun}
          onChange={(e) => set("tahun", Number(e.target.value))}
          required
          min={1900}
          max={2100}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ikon</label>
        <select
          value={form.icon}
          onChange={(e) => set("icon", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {ICON_OPTIONS.map((ic) => (
            <option key={ic} value={ic}>{ic}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Urutan</label>
        <input
          type="number"
          value={form.urutan}
          onChange={(e) => set("urutan", Number(e.target.value))}
          min={0}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="col-span-2 flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

export default function AdminStatistikPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => statistikApi.getAll().then((r) => setStats(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async (form: FormState) => {
    setSaving(true);
    try {
      await statistikApi.create(form);
      setShowAdd(false);
      load();
    } catch {}
    setSaving(false);
  };

  const handleEdit = async (form: FormState) => {
    if (editId === null) return;
    setSaving(true);
    try {
      await statistikApi.update(editId, form);
      setEditId(null);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number, label: string) => {
    if (!confirm(`Hapus statistik "${label}"?`)) return;
    setDeletingId(id);
    try {
      await statistikApi.delete(id);
      load();
    } catch {}
    setDeletingId(null);
  };

  const editingInitial = (stat: Stat): FormState => ({
    label: stat.label,
    nilai: stat.nilai,
    satuan: stat.satuan,
    tahun: stat.tahun,
    icon: stat.icon || "BarChart2",
    warna: stat.warna,
    urutan: stat.urutan,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Kelola data statistik utama beranda. Di beranda tampil 4 kotak yang berganti setiap 5 detik.
          </p>
          <button
            onClick={() => { setShowAdd(true); setEditId(null); }}
            className="flex items-center gap-2 bg-[#2196F3] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Statistik
          </button>
        </div>

        {/* Form Tambah */}
        {showAdd && (
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1A2E]">Tambah Statistik Baru</h3>
              <button onClick={() => setShowAdd(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <StatForm
              initial={{ ...EMPTY_FORM, urutan: stats.length }}
              onSave={handleAdd}
              onCancel={() => setShowAdd(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Tabel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">#</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Label</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">Satuan</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Tahun</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Ikon</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <React.Fragment key={stat.id}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-400 text-xs">{stat.urutan}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stat.warna }} />
                        <span className="font-medium text-[#1A1A2E]">{stat.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1D6FCA]">{stat.nilai}</td>
                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">{stat.satuan}</td>
                    <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{stat.tahun}</td>
                    <td className="py-3 px-4 text-gray-400 hidden md:table-cell text-xs">{stat.icon || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditId(editId === stat.id ? null : stat.id); setShowAdd(false); }}
                          className={`p-1.5 rounded-lg transition-colors ${editId === stat.id ? "bg-blue-50 text-[#2196F3]" : "text-gray-300 hover:text-[#2196F3] hover:bg-blue-50"}`}
                        >
                          {editId === stat.id ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(stat.id, stat.label)}
                          disabled={deletingId === stat.id}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {deletingId === stat.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Form edit inline */}
                  {editId === stat.id && (
                    <tr className="border-b border-blue-50 bg-blue-50/40">
                      <td colSpan={7} className="px-6 py-5">
                        <StatForm
                          initial={editingInitial(stat)}
                          onSave={handleEdit}
                          onCancel={() => setEditId(null)}
                          saving={saving}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Belum ada data statistik. Klik &ldquo;Tambah Statistik&rdquo; untuk mulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400">
          Total {stats.length} statistik — beranda menampilkan 4 kotak sekaligus, berganti setiap 5 detik.
        </p>
      </div>
    </AdminLayout>
  );
}
