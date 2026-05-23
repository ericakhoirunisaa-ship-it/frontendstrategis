"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState, useRef } from "react";
import { pengaduanApi } from "@/lib/api";
import { CheckCircle, Loader2, Upload, X } from "lucide-react";

interface FileFieldProps {
  label: string;
  hint: string;
  accept: string;
  name: string;
  required?: boolean;
  file: File | null;
  onChange: (f: File | null) => void;
}

function FileField({ label, hint, accept, required, file, onChange }: FileFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-5 flex items-center gap-3 cursor-pointer hover:border-[#2196F3] transition-colors"
      >
        <Upload className="w-5 h-5 text-gray-300 shrink-0" />
        <div className="flex-1 min-w-0">
          {file ? (
            <p className="text-sm text-[#1A1A2E] font-medium truncate">{file.name}</p>
          ) : (
            <>
              <p className="text-sm text-gray-400">Klik untuk pilih file</p>
              <p className="text-xs text-gray-300 mt-0.5">{hint}</p>
            </>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ""; }}
            className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}

export default function PengaduanPage() {
  const [form, setForm] = useState({
    namaLengkap: "",
    noIdentitas: "",
    alamat: "",
    noTelpon: "",
    isiPengaduan: "",
  });
  const [fotoIdentitas, setFotoIdentitas] = useState<File | null>(null);
  const [lampiran, setLampiran] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoIdentitas) { setError("Foto identitas wajib diunggah."); return; }
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("fotoIdentitas", fotoIdentitas);
      if (lampiran) fd.append("lampiran", lampiran);
      await pengaduanApi.submit(fd);
      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-[#0C2340] mb-2">Pengaduan Terkirim!</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Terima kasih telah menyampaikan pengaduan Anda. Petugas BPS Kabupaten Toli-Toli
              akan menindaklanjuti laporan ini secepatnya.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2196F3] bg-blue-50 px-3 py-1 rounded-lg mb-3">
              Pengaduan
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0C2340] mb-2">
              Form Pengaduan
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Sampaikan pengaduan terkait layanan dan produk statistik BPS Kabupaten Toli-Toli.
              Semua informasi akan dijaga kerahasiaannya.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                Nama Lengkap (sesuai KTP) <span className="text-red-500">*</span>
              </label>
              <input
                value={form.namaLengkap}
                onChange={(e) => set("namaLengkap", e.target.value)}
                required
                placeholder="Nama sesuai KTP/SIM/KK"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* No Identitas */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                No. KTP / SIM / KK <span className="text-red-500">*</span>
              </label>
              <input
                value={form.noIdentitas}
                onChange={(e) => set("noIdentitas", e.target.value)}
                required
                placeholder="16 digit nomor identitas"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Foto Identitas */}
            <FileField
              label="Lampiran Foto KTP / SIM / KK"
              hint="JPG, PNG, atau PDF · Maks. 10 MB"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              name="fotoIdentitas"
              required
              file={fotoIdentitas}
              onChange={setFotoIdentitas}
            />

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                Alamat Domisili <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.alamat}
                onChange={(e) => set("alamat", e.target.value)}
                required
                rows={3}
                placeholder="Alamat lengkap tempat tinggal saat ini"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                No. Telepon / HP / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                value={form.noTelpon}
                onChange={(e) => set("noTelpon", e.target.value)}
                required
                type="tel"
                placeholder="Contoh: 085183287206"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Isi Pengaduan */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                Isi Pengaduan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.isiPengaduan}
                onChange={(e) => set("isiPengaduan", e.target.value)}
                required
                rows={5}
                placeholder="Tuliskan pengaduan Anda secara jelas dan terperinci..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* Lampiran */}
            <FileField
              label="Upload Lampiran Pendukung"
              hint="Foto, dokumen pendukung · JPG, PNG, PDF · Maks. 10 MB"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              name="lampiran"
              file={lampiran}
              onChange={setLampiran}
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A5F] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#162d4a] transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Mengirim..." : "Kirim Pengaduan"}
              </button>
              <a
                href="/"
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Batal
              </a>
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Dengan mengirim form ini, Anda menyetujui penggunaan data untuk keperluan
              penanganan pengaduan oleh BPS Kabupaten Toli-Toli.
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
