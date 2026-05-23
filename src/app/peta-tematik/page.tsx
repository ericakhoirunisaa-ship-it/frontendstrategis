"use client";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const MapView = dynamic(() => import("@/components/peta/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 border border-gray-100">
      <div className="w-8 h-8 border-2 border-[#1D6FCA]/30 border-t-[#1D6FCA] rounded-full animate-spin" />
      <span className="text-sm">Memuat peta interaktif...</span>
    </div>
  ),
});

export default function PetaTematikPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1D6FCA] text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            Peta Tematik
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0C2340] mb-1">
            Peta Tematik Kabupaten Toli-Toli
          </h1>
          <p className="text-gray-400 text-sm">
            Visualisasi spasial data statistik per kecamatan secara interaktif. Pilih indikator untuk melihat sebarannya.
          </p>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <MapView />
      </div>

      <Footer />
    </div>
  );
}
