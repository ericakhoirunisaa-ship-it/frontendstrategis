"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { quotesApi, musikApi } from "@/lib/api";
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle, Upload, Music, Quote, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface QuoteItem { id: number; teks: string; penulis: string; urutan: number; aktif: boolean; }
interface MusikItem  { id: number; judul: string; audioUrl: string; aktif: boolean; }

export default function AdminKontenPage() {
  const [tab, setTab] = useState<"quotes" | "musik">("quotes");

  /* ── QUOTES STATE ── */
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [qForm, setQForm] = useState({ teks: "", penulis: "BPS Kab. Toli-Toli", urutan: "0" });
  const [qEditing, setQEditing] = useState<QuoteItem | null>(null);
  const [qModalOpen, setQModalOpen] = useState(false);
  const [qLoading, setQLoading] = useState(false);
  const [qMsg, setQMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* ── MUSIK STATE ── */
  const [musik, setMusik] = useState<MusikItem[]>([]);
  const [mForm, setMForm] = useState({ judul: "" });
  const [mFile, setMFile] = useState<File | null>(null);
  const [mLoading, setMLoading] = useState(false);
  const [mMsg, setMMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const mFileRef = useRef<HTMLInputElement>(null);

  const loadQuotes = () => quotesApi.getAll(true).then((r) => setQuotes(r.data)).catch(() => {});
  const loadMusik  = () => musikApi.getAll(true).then((r) => setMusik(r.data)).catch(() => {});

  useEffect(() => { loadQuotes(); loadMusik(); }, []);

  const flash = (setter: typeof setQMsg, type: "ok" | "err", text: string) => {
    setter({ type, text });
    setTimeout(() => setter(null), 3000);
  };

  /* ── QUOTES HANDLERS ── */
  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qForm.teks.trim()) return;
    setQLoading(true);
    try {
      await quotesApi.create({ teks: qForm.teks, penulis: qForm.penulis, urutan: Number(qForm.urutan) });
      setQForm({ teks: "", penulis: "BPS Kab. Toli-Toli", urutan: "0" });
      loadQuotes();
      flash(setQMsg, "ok", "Quote berhasil ditambahkan");
    } catch { flash(setQMsg, "err", "Gagal menambah quote"); }
    setQLoading(false);
  };

  const handleUpdateQuote = async (q: QuoteItem, data: Partial<QuoteItem>) => {
    try {
      await quotesApi.update(q.id, data);
      loadQuotes();
    } catch { flash(setQMsg, "err", "Gagal mengupdate"); }
  };

  const openEditModal = (q: QuoteItem) => {
    setQEditing({ ...q });
    setQModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!qEditing) return;
    setQLoading(true);
    try {
      await quotesApi.update(qEditing.id, {
        teks: qEditing.teks,
        penulis: qEditing.penulis,
        urutan: qEditing.urutan,
      });
      loadQuotes();
      setQModalOpen(false);
      flash(setQMsg, "ok", "Quote berhasil diupdate");
    } catch {
      flash(setQMsg, "err", "Gagal mengupdate quote");
    }
    setQLoading(false);
  };

  const handleDeleteQuote = async (id: number) => {
    if (!confirm("Hapus quote ini?")) return;
    await quotesApi.delete(id);
    loadQuotes();
  };

  /* ── MUSIK HANDLERS ── */
  const handleAddMusik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mFile || !mForm.judul) return;
    setMLoading(true);
    const fd = new FormData();
    fd.append("file", mFile);
    fd.append("judul", mForm.judul);
    try {
      await musikApi.create(fd);
      setMForm({ judul: "" });
      setMFile(null);
      if (mFileRef.current) mFileRef.current.value = "";
      loadMusik();
      flash(setMMsg, "ok", "Musik berhasil diupload");
    } catch (err: any) {
      flash(setMMsg, "err", err?.response?.data?.message || "Gagal upload musik");
    }
    setMLoading(false);
  };

  const handleToggleMusik = async (m: MusikItem) => {
    await musikApi.update(m.id, { aktif: !m.aktif });
    loadMusik();
  };

  const handleDeleteMusik = async (m: MusikItem) => {
    if (!confirm(`Hapus musik "${m.judul}"?`)) return;
    await musikApi.delete(m.id);
    loadMusik();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-gray-500 text-sm">Kelola quotes yang berputar di header website dan musik latar halaman.</p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          {([["quotes", Quote, "Quotes"], ["musik", Music, "Musik Latar"]] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? "bg-white dark:bg-[#1E3A5F] text-[#0C2340] dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── QUOTES TAB ── */}
        {tab === "quotes" && (
          <div className="space-y-5">
            {/* Add Form */}
            <div className="bg-white dark:bg-[#162133] rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
              <h3 className="font-semibold text-[#0C2340] dark:text-white mb-4">Tambah Quote Baru</h3>
              <form onSubmit={handleAddQuote} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Teks Quote *</label>
                  <textarea
                    value={qForm.teks}
                    onChange={(e) => setQForm({ ...qForm, teks: e.target.value })}
                    required
                    rows={2}
                    placeholder="Data adalah fondasi dari setiap keputusan yang bijak."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Penulis / Sumber</label>
                    <input
                      value={qForm.penulis}
                      onChange={(e) => setQForm({ ...qForm, penulis: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Urutan Tampil</label>
                    <input
                      type="number"
                      value={qForm.urutan}
                      onChange={(e) => setQForm({ ...qForm, urutan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <button
                    type="submit"
                    disabled={qLoading || !qForm.teks.trim()}
                    className="flex items-center gap-2 bg-[#1D6FCA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {qLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Tambah Quote
                  </button>
                  {qMsg && (
                    <div className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border ${
                      qMsg.type === "ok"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }`}>
                      {qMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {qMsg.text}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Quote List */}
            <div className="space-y-2">
              {quotes.length === 0 && (
                <div className="py-10 text-center text-gray-400 text-sm bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  Belum ada quote. Tambah di atas.
                </div>
              )}
              {quotes.map((q) => (
                <div key={q.id} className={`bg-white dark:bg-[#162133] rounded-xl border px-4 py-3 flex items-start gap-3 transition-all ${q.aktif ? "border-gray-100 dark:border-slate-700/50" : "border-slate-200 opacity-50"}`}>
                  <Quote className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0C2340] dark:text-white italic">&ldquo;{q.teks}&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-0.5">— {q.penulis} · Urutan: {q.urutan}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleUpdateQuote(q, { aktif: !q.aktif })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.aktif ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      {q.aktif ? "Aktif" : "Nonaktif"}
                    </button>
                    <button onClick={() => openEditModal(q)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteQuote(q.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MUSIK TAB ── */}
        {tab === "musik" && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#162133] rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
              <h3 className="font-semibold text-[#0C2340] dark:text-white mb-1">Upload Musik Latar</h3>
              <p className="text-xs text-gray-400 mb-4">Musik yang diaktifkan akan muncul sebagai floating player di website. Format: MP3, WAV, OGG (maks. 20 MB).</p>
              <form onSubmit={handleAddMusik} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Judul Musik *</label>
                  <input
                    value={mForm.judul}
                    onChange={(e) => setMForm({ judul: e.target.value })}
                    required
                    placeholder="Musik Latar SITARA"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-[#1D6FCA] transition-colors cursor-pointer"
                  onClick={() => mFileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setMFile(f); }}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#0C2340] dark:text-white">
                      {mFile ? mFile.name : "Klik atau seret file audio"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">MP3, WAV, OGG, AAC — maks. 20 MB</p>
                  </div>
                  <input
                    ref={mFileRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setMFile(e.target.files[0]); }}
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="submit"
                    disabled={mLoading || !mFile || !mForm.judul}
                    className="flex items-center gap-2 bg-[#1D6FCA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {mLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Musik
                  </button>
                  {mMsg && (
                    <div className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border ${
                      mMsg.type === "ok"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }`}>
                      {mMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {mMsg.text}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Musik list */}
            <div className="space-y-2">
              {musik.length === 0 && (
                <div className="py-10 text-center text-gray-400 text-sm bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  Belum ada musik. Upload di atas.
                </div>
              )}
              {musik.map((m) => (
                <div key={m.id} className={`bg-white dark:bg-[#162133] rounded-xl border px-4 py-3 flex items-center gap-3 ${m.aktif ? "border-[#38BDF8]/30" : "border-gray-100 dark:border-slate-700/50"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.aktif ? "bg-[#38BDF8]/15" : "bg-slate-100"}`}>
                    <Music className={`w-4 h-4 ${m.aktif ? "text-[#38BDF8]" : "text-slate-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C2340] dark:text-white truncate">{m.judul}</p>
                    <audio controls src={`${API_BASE}${m.audioUrl}`} className="mt-1 h-7 w-full max-w-xs" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleMusik(m)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                        m.aktif ? "bg-[#38BDF8]/15 text-[#0EA5E9]" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.aktif ? "Aktif" : "Nonaktif"}
                    </button>
                    <button onClick={() => handleDeleteMusik(m)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* ── MODAL EDIT QUOTE ── */}
      <Dialog open={qModalOpen} onOpenChange={setQModalOpen}>
        <DialogContent className="max-w-lg dark:bg-[#162133]">
          <DialogHeader>
            <DialogTitle className="text-[#0C2340] dark:text-white">Edit Quote</DialogTitle>
          </DialogHeader>
          {qEditing && (
            <div className="space-y-4 py-1">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teks Quote *</label>
                <textarea
                  value={qEditing.teks}
                  onChange={(e) => setQEditing({ ...qEditing, teks: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Penulis / Sumber</label>
                  <input
                    value={qEditing.penulis}
                    onChange={(e) => setQEditing({ ...qEditing, penulis: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    value={qEditing.urutan}
                    onChange={(e) => setQEditing({ ...qEditing, urutan: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t-0 bg-transparent px-0 pb-0">
            <button
              onClick={() => setQModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={qLoading || !qEditing?.teks?.trim()}
              className="flex items-center gap-2 bg-[#1D6FCA] text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {qLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Simpan Perubahan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
