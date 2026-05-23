"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { jadwalApi } from "@/lib/api";
import { Plus, Trash2, Edit2, Loader2, X, Check } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Jadwal {
  id: number;
  judul: string;
  tanggal: string;
  kategori: string;
  deskripsi?: string;
  link?: string;
  status: string;
}

const EMPTY_FORM = {
  judul: "", tanggal: "", kategori: "Publikasi", deskripsi: "", link: "", status: "UPCOMING",
};

export default function AdminJadwalRilisPage() {
  const [items, setItems] = useState<Jadwal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => jadwalApi.getAll().then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await jadwalApi.update(editId, form);
      } else {
        await jadwalApi.create(form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      load();
    } catch {}
    setSaving(false);
  };

  const handleEdit = (item: Jadwal) => {
    setForm({
      judul: item.judul,
      tanggal: item.tanggal.split("T")[0],
      kategori: item.kategori,
      deskripsi: item.deskripsi || "",
      link: item.link || "",
      status: item.status,
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Hapus jadwal "${judul}"?`)) return;
    await jadwalApi.delete(id);
    load();
  };

  const STATUS_BADGE: Record<string, string> = {
    RELEASED: "bg-green-100 text-green-700",
    UPCOMING: "bg-orange-100 text-orange-700",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">Kelola jadwal rilis publikasi BPS Toli-Toli.</p>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-[#2196F3] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500"
          >
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1A2E]">{editId ? "Edit Jadwal" : "Tambah Jadwal Baru"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Judul Publikasi</label>
                <input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  required
                  placeholder="Kabupaten Toli-Toli Dalam Angka 2025"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Rilis</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option>Publikasi</option>
                  <option>BRS</option>
                  <option>Infografis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="UPCOMING">Akan Rilis</option>
                  <option value="RELEASED">Sudah Rilis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Link Unduh (opsional)</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-sm font-medium">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Update" : "Simpan"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Publikasi</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">Tanggal</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A1A2E] line-clamp-1">{item.judul}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden sm:table-cell text-xs">
                    {format(new Date(item.tanggal), "d MMM yyyy", { locale: id })}
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{item.kategori}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE[item.status] || "bg-gray-100 text-gray-600"}`}>
                      {item.status === "RELEASED" ? "Sudah Rilis" : "Akan Rilis"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-300 hover:text-[#2196F3] hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.judul)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada jadwal rilis.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
