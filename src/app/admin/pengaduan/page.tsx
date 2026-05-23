"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { pengaduanApi } from "@/lib/api";
import { Eye, Trash2, Loader2, X, ExternalLink } from "lucide-react";

interface Pengaduan {
  id: number;
  namaLengkap: string;
  noIdentitas: string;
  fotoIdentitas: string;
  alamat: string;
  noTelpon: string;
  isiPengaduan: string;
  lampiran?: string;
  status: string;
  catatan?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  BARU: { bg: "#DBEAFE", text: "#1D6FCA" },
  DIPROSES: { bg: "#FEF3C7", text: "#D97706" },
  SELESAI: { bg: "#DCFCE7", text: "#16A34A" },
  DITOLAK: { bg: "#FEE2E2", text: "#DC2626" },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

export default function AdminPengaduanPage() {
  const [list, setList] = useState<Pengaduan[]>([]);
  const [detail, setDetail] = useState<Pengaduan | null>(null);
  const [status, setStatus] = useState("");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => pengaduanApi.getAll().then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openDetail = (p: Pengaduan) => {
    setDetail(p);
    setStatus(p.status);
    setCatatan(p.catatan || "");
  };

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await pengaduanApi.update(detail.id, { status, catatan });
      load();
      setDetail((prev) => prev ? { ...prev, status, catatan } : null);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus pengaduan dari "${nama}"?`)) return;
    setDeletingId(id);
    try {
      await pengaduanApi.delete(id);
      if (detail?.id === id) setDetail(null);
      load();
    } catch {}
    setDeletingId(null);
  };

  const badge = (s: string) => {
    const c = STATUS_COLORS[s] || { bg: "#F1F5F9", text: "#64748B" };
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>
        {s}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-gray-500 text-sm">
          Kelola dan tindaklanjuti pengaduan yang masuk dari masyarakat. Total: {list.length} pengaduan.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Nama</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">No. Identitas</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Tanggal</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A1A2E]">{p.namaLengkap}</p>
                    <p className="text-xs text-gray-400">{p.noTelpon}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden sm:table-cell text-xs">{p.noIdentitas}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">
                    {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4">{badge(p.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openDetail(p)}
                        className="p-1.5 text-gray-300 hover:text-[#2196F3] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.namaLengkap)}
                        disabled={deletingId === p.id}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deletingId === p.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-gray-400">Belum ada pengaduan masuk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Detail */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-[#0C2340]">{detail.namaLengkap}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(detail.createdAt).toLocaleDateString("id-ID", { dateStyle: "full" })}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5 text-sm">
              {/* Info */}
              {[
                { label: "No. Identitas", value: detail.noIdentitas },
                { label: "Alamat Domisili", value: detail.alamat },
                { label: "No. Telepon/WA", value: detail.noTelpon },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-[#1A1A2E]">{value}</p>
                </div>
              ))}

              {/* Isi Pengaduan */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Isi Pengaduan</p>
                <p className="text-[#1A1A2E] leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
                  {detail.isiPengaduan}
                </p>
              </div>

              {/* Lampiran */}
              <div className="flex gap-3">
                <a
                  href={`${API_BASE}${detail.fotoIdentitas}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#2196F3] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Lihat Foto Identitas
                </a>
                {detail.lampiran && (
                  <a
                    href={`${API_BASE}${detail.lampiran}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-[#2196F3] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Lihat Lampiran
                  </a>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {["BARU", "DIPROSES", "SELESAI", "DITOLAK"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Catatan */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan / Tindak Lanjut</p>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan tindak lanjut..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-[#1E3A5F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d4a] transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
