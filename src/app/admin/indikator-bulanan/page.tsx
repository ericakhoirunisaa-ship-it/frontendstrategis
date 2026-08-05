"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { indikatorBulananApi } from "@/lib/api";
import { Plus, Pencil, Trash2, X, Check, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight, Zap, Info } from "lucide-react";

interface IndikatorBulanan {
  id: number;
  judul: string;
  nilai: string;
  satuan?: string;
  perubahan?: string;
  arahPerubahan?: string;
  keterangan?: string;
  periode?: string;
  warna: string;
  urutan: number;
  bulan: number;
  tahun: number;
  aktif: boolean;
}

const BULAN_LABEL = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const WARNA_OPTIONS = [
  { value: "biru",   label: "Biru",   color: "#1D6FCA" },
  { value: "hijau",  label: "Hijau",  color: "#059669" },
  { value: "oranye", label: "Oranye", color: "#EA580C" },
  { value: "merah",  label: "Merah",  color: "#DC2626" },
  { value: "ungu",   label: "Ungu",   color: "#7C3AED" },
  { value: "kuning", label: "Kuning", color: "#D97706" },
];

const ARAH_OPTIONS = [
  { value: "naik",   label: "Naik ▲",   icon: TrendingUp },
  { value: "turun",  label: "Turun ▼",  icon: TrendingDown },
  { value: "tetap",  label: "Tetap —",  icon: Minus },
];

const EMPTY: Omit<IndikatorBulanan, "id" | "aktif"> = {
  judul: "", nilai: "", satuan: "", perubahan: "", arahPerubahan: "",
  keterangan: "", periode: "", warna: "biru", urutan: 0,
  bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(),
};

export default function AdminIndikatorBulananPage() {
  const [items, setItems] = useState<IndikatorBulanan[]>([]);
  const [strategisYears, setStrategisYears] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IndikatorBulanan | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const load = () =>
    indikatorBulananApi.getAllAdmin()
      .then((r) => {
        const data: IndikatorBulanan[] = r.data;
        setItems(data);
        // Auto-expand the most recent group
        if (data.length > 0) {
          const key = `${data[0].tahun}-${data[0].bulan}`;
          setExpandedGroups(new Set([key]));
        }
      })
      .catch(() => {});

  useEffect(() => {
    load();
    indikatorBulananApi.getStrategisYears()
      .then((r) => setStrategisYears(r.data?.years ?? []))
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (item: IndikatorBulanan) => {
    setEditing(item);
    setForm({
      judul: item.judul, nilai: item.nilai, satuan: item.satuan ?? "",
      perubahan: item.perubahan ?? "", arahPerubahan: item.arahPerubahan ?? "",
      keterangan: item.keterangan ?? "", periode: item.periode ?? "",
      warna: item.warna, urutan: item.urutan, bulan: item.bulan, tahun: item.tahun,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      urutan: +form.urutan,
      bulan: +form.bulan,
      tahun: +form.tahun,
      satuan: form.satuan || undefined,
      perubahan: form.perubahan || undefined,
      arahPerubahan: form.arahPerubahan || undefined,
      keterangan: form.keterangan || undefined,
      periode: form.periode || undefined,
    };
    try {
      if (editing) {
        await indikatorBulananApi.update(editing.id, payload);
      } else {
        await indikatorBulananApi.create(payload);
      }
      setShowForm(false);
      await load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (item: IndikatorBulanan) => {
    if (!confirm(`Hapus "${item.judul}"?`)) return;
    await indikatorBulananApi.delete(item.id);
    load();
  };

  const handleToggleAktif = async (item: IndikatorBulanan) => {
    await indikatorBulananApi.update(item.id, { aktif: !item.aktif });
    load();
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const groupMap = new Map<string, IndikatorBulanan[]>();
  for (const item of items) {
    const key = `${item.tahun}-${item.bulan}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(item);
  }
  const sortedGroups = [...groupMap.entries()]
    .map(([key, grpItems]) => {
      const [t, b] = key.split("-").map(Number);
      return { key, tahun: t, bulan: b, items: grpItems };
    })
    .sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);

  const f = (field: keyof typeof EMPTY, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Kelola data indikator statistik bulanan yang ditampilkan di halaman publik.
          </p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#1D6FCA] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1558a8] transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        </div>

        {/* Auto-derivation info banner */}
        {strategisYears.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl">
            <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Data otomatis aktif</span>
              <span className="text-blue-600 dark:text-blue-400"> — Semua data Indikator Strategis untuk tahun </span>
              <span className="font-semibold">{strategisYears.join(", ")}</span>
              <span className="text-blue-600 dark:text-blue-400"> otomatis muncul di halaman publik untuk setiap bulan pada tahun tersebut. Naik/turun dihitung otomatis dari tahun sebelumnya. Gunakan form di bawah untuk menambah data manual (misalnya indikator tambahan yang tidak ada di Strategis).</span>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0C2340] dark:text-white text-sm">
                {editing ? "Edit Data Indikator Bulanan" : "Tambah Data Indikator Bulanan"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Row 1: Judul */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Nama Indikator *</label>
                <input
                  required
                  value={form.judul}
                  onChange={(e) => f("judul", e.target.value)}
                  placeholder="contoh: Tingkat Pengangguran Terbuka"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
                />
              </div>

              {/* Row 2: Nilai, Satuan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Nilai *</label>
                  <input
                    required
                    value={form.nilai}
                    onChange={(e) => f("nilai", e.target.value)}
                    placeholder="4,52"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Satuan</label>
                  <input
                    value={form.satuan}
                    onChange={(e) => f("satuan", e.target.value)}
                    placeholder="%"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Row 3: Perubahan, Arah */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Perubahan</label>
                  <input
                    value={form.perubahan}
                    onChange={(e) => f("perubahan", e.target.value)}
                    placeholder="+0,12 poin"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Arah Perubahan</label>
                  <select
                    value={form.arahPerubahan}
                    onChange={(e) => f("arahPerubahan", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">— Tidak ada —</option>
                    {ARAH_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Keterangan, Periode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Keterangan</label>
                  <input
                    value={form.keterangan}
                    onChange={(e) => f("keterangan", e.target.value)}
                    placeholder="dibanding bulan lalu"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Periode (referensi)</label>
                  <input
                    value={form.periode}
                    onChange={(e) => f("periode", e.target.value)}
                    placeholder="Feb 2025"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Row 5: Bulan, Tahun, Urutan, Warna */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Bulan *</label>
                  <select
                    required
                    value={form.bulan}
                    onChange={(e) => f("bulan", +e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {BULAN_LABEL.slice(1).map((label, i) => (
                      <option key={i + 1} value={i + 1}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Tahun *</label>
                  <input
                    required
                    type="number"
                    value={form.tahun}
                    onChange={(e) => f("tahun", +e.target.value)}
                    min="2000"
                    max="2099"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Urutan</label>
                  <input
                    type="number"
                    value={form.urutan}
                    onChange={(e) => f("urutan", +e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Warna</label>
                  <select
                    value={form.warna}
                    onChange={(e) => f("warna", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#0F1825] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {WARNA_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warna preview */}
              <div className="flex items-center gap-2 flex-wrap">
                {WARNA_OPTIONS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => f("warna", w.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${form.warna === w.value ? "border-[#0C2340] scale-125" : "border-transparent"}`}
                    style={{ background: w.color }}
                    title={w.label}
                  />
                ))}
                <span className="text-xs text-slate-400 ml-1">
                  {WARNA_OPTIONS.find((w) => w.value === form.warna)?.label}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1D6FCA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 hover:bg-[#1558a8] transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Data"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grouped list */}
        {sortedGroups.length === 0 ? (
          <div className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 py-16 text-center">
            <TrendingUp className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-slate-500 text-sm">Belum ada data. Klik "Tambah Data" untuk mulai.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedGroups.map((group) => {
              const isOpen = expandedGroups.has(group.key);
              return (
                <div key={group.key} className="bg-white dark:bg-[#162133] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="font-semibold text-[#0C2340] dark:text-white text-sm">
                        {BULAN_LABEL[group.bulan]} {group.tahun}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {group.items.length} indikator
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setForm({ ...EMPTY, bulan: group.bulan, tahun: group.tahun }); setEditing(null); setShowForm(true); }}
                      className="flex items-center gap-1 text-xs text-[#1D6FCA] hover:underline font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Tambah
                    </button>
                  </button>

                  {/* Items */}
                  {isOpen && (
                    <div className="border-t border-gray-50 dark:border-slate-700/50">
                      {group.items.map((item) => {
                        const warna = WARNA_OPTIONS.find((w) => w.value === item.warna);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-slate-700/30 last:border-0 ${!item.aktif ? "opacity-50" : ""}`}
                          >
                            {/* Color dot */}
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: warna?.color ?? "#94A3B8" }}
                            />

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#0C2340] dark:text-white truncate">{item.judul}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">{item.nilai}</span>
                                {item.satuan && <span> {item.satuan}</span>}
                                {item.perubahan && (
                                  <span className={`ml-2 ${item.arahPerubahan === "naik" ? "text-emerald-600" : item.arahPerubahan === "turun" ? "text-red-500" : "text-slate-400"}`}>
                                    {item.arahPerubahan === "naik" ? "▲" : item.arahPerubahan === "turun" ? "▼" : "—"} {item.perubahan}
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleToggleAktif(item)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.aktif ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}
                              >
                                {item.aktif ? "Aktif" : "Nonaktif"}
                              </button>
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-[#1D6FCA] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
