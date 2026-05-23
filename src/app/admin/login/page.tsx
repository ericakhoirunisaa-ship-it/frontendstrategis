"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Panel kiri — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[#0C2340]">
        {/* Dekorasi grid dots */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <rect x="3" y="12" width="4" height="9" rx="1" />
              <rect x="10" y="7" width="4" height="14" rx="1" />
              <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Portal Data Strategis</p>
            <p className="text-white/50 text-xs">BPS Kabupaten Toli-Toli</p>
          </div>
        </div>

        {/* Tengah */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 mb-6">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-white/70 text-xs font-semibold">Panel Administrasi</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Kelola Data<br />Statistik Daerah
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Masuk untuk mengelola indikator, data statistik, infografis,
            dan konten portal Data Strategis Kabupaten Toli-Toli.
          </p>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { label: "Indikator Aktif", nilai: "20+" },
              { label: "Kategori Data", nilai: "6" },
              { label: "Tahun Data", nilai: "5+" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur">
                <p className="text-white font-extrabold text-lg leading-none">{s.nilai}</p>
                <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer kiri */}
        <p className="text-white/30 text-xs relative z-10">
          © {new Date().getFullYear()} BPS Kabupaten Toli-Toli
        </p>
      </div>

      {/* ── Panel kanan — form login ── */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F8FC] px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Header mobile (hanya tampil di layar kecil) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0C2340]">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <rect x="3" y="12" width="4" height="9" rx="1" />
                <rect x="10" y="7" width="4" height="14" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
              </svg>
            </div>
            <div>
              <p className="text-[#0C2340] font-bold text-sm">Portal Data Strategis</p>
              <p className="text-gray-400 text-xs">BPS Kabupaten Toli-Toli</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1D6FCA] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>

          <h1 className="text-2xl font-extrabold text-[#0C2340] mb-1">Masuk ke Admin</h1>
          <p className="text-gray-400 text-sm mb-8">Gunakan akun yang telah didaftarkan.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@bps.go.id"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D6FCA]/30 focus:border-[#1D6FCA] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D6FCA]/30 focus:border-[#1D6FCA] transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#1D6FCA" }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi...</>
                : "Masuk ke Dashboard"
              }
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-300 mt-8">
            Portal Data Strategis · BPS Kabupaten Toli-Toli
          </p>
        </div>
      </div>
    </div>
  );
}
