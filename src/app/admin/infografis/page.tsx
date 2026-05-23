"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { infografisApi } from "@/lib/api";
import { Upload, Trash2, Loader2, X, CheckCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface Infografis {
  id: number;
  judul: string;
  deskripsi?: string;
  imageUrl: string;
  urutan: number;
  aktif: boolean;
}

export default function AdminInfografisPage() {
  const [items, setItems] = useState<Infografis[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ judul: "", deskripsi: "", urutan: "0" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => infografisApi.getAll(true).then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.judul) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("judul", form.judul);
    if (form.deskripsi) fd.append("deskripsi", form.deskripsi);
    fd.append("urutan", form.urutan);
    try {
      await infografisApi.create(fd);
      setSuccess(true);
      setForm({ judul: "", deskripsi: "", urutan: "0" });
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
      setTimeout(() => setSuccess(false), 2500);
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Hapus infografis "${judul}"?`)) return;
    await infografisApi.delete(id);
    load();
  };

  const handleToggle = async (item: Infografis) => {
    await infografisApi.update(item.id, { aktif: !item.aktif });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-gray-500 text-sm">Upload dan kelola infografis yang ditampilkan di halaman beranda.</p>

        {/* Form Upload */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-[#0C2340] mb-4">Upload Infografis Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Judul *</label>
                <input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  required
                  placeholder="Infografis Kependudukan 2025"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Urutan Tampil</label>
                <input
                  type="number"
                  value={form.urutan}
                  onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Deskripsi (opsional)</label>
                <input
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5 hover:border-[#1D6FCA] transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-24 h-32 object-cover rounded-xl border border-gray-200" />
              ) : (
                <div className="w-24 h-32 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-slate-300" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-[#0C2340]">
                  {file ? file.name : "Klik atau seret file gambar"}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — maks. 5 MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file || !form.judul}
              className="flex items-center gap-2 bg-[#1D6FCA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
                : success
                ? <><CheckCircle className="w-4 h-4" /> Berhasil!</>
                : <><Upload className="w-4 h-4" /> Upload Infografis</>
              }
            </button>
          </form>
        </div>

        {/* Grid infografis */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`relative rounded-2xl overflow-hidden border shadow-sm ${item.aktif ? "border-slate-100" : "border-slate-200 opacity-50"}`}>
              <img
                src={`${API_BASE}${item.imageUrl}`}
                alt={item.judul}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="p-3 bg-white">
                <p className="text-xs font-semibold text-[#0C2340] line-clamp-1">{item.judul}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Urutan: {item.urutan}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.aktif ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                  >
                    {item.aktif ? "Aktif" : "Nonaktif"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.judul)}
                    className="ml-auto p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm">
              Belum ada infografis. Upload di atas.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
