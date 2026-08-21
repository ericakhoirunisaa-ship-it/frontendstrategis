import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import KepuasanSection from "@/components/beranda/KepuasanSection";

export const metadata = {
  title: "Survei Kepuasan Pengguna – SITARA",
  description: "Bantu kami meningkatkan SITARA dengan mengisi survei kepuasan pengguna.",
};

export default function SurveiKepuasanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#0C2340] py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#38BDF8] text-xs font-semibold uppercase tracking-widest mb-2">Evaluasi Pengguna</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
            Survei Kepuasan Pengguna SITARA
          </h1>
          <p className="text-white/50 text-sm">
            Penilaian website SITARA BPS Kabupaten Toli-Toli · Skala Likert 1–5
          </p>
        </div>
      </div>

      <div className="flex-1">
        <KepuasanSection hideHeader />
      </div>

      <Footer />
    </div>
  );
}
