"use client";
import { useEffect, useRef, useState } from "react";

const INDICATORS = [
  { key: "penduduk", label: "Jumlah Penduduk", satuan: "jiwa", tahun: "2024" },
  { key: "luas",     label: "Luas Wilayah",    satuan: "km²",  tahun: "2023" },
  { key: "kepadatan",label: "Kepadatan Penduduk", satuan: "jiwa/km²", tahun: "2024" },
  { key: "miskin",   label: "Penduduk Miskin", satuan: "%",    tahun: "2024" },
];

const KECAMATAN = [
  { nama: "Baolan",         lat: 1.030, lng: 120.830, penduduk: 73950,  luas: 143.8, kepadatan: 514, miskin: 10.2 },
  { nama: "Galang",         lat: 0.950, lng: 120.930, penduduk: 39820,  luas: 178.4, kepadatan: 223, miskin: 13.8 },
  { nama: "Dondo",          lat: 0.760, lng: 121.050, penduduk: 24310,  luas: 289.6, kepadatan: 84,  miskin: 15.4 },
  { nama: "Dampal Selatan", lat: 0.550, lng: 121.150, penduduk: 22780,  luas: 247.3, kepadatan: 92,  miskin: 17.1 },
  { nama: "Dampal Utara",   lat: 0.650, lng: 121.250, penduduk: 14650,  luas: 198.5, kepadatan: 74,  miskin: 16.3 },
  { nama: "Tolitoli Utara", lat: 1.150, lng: 120.730, penduduk: 19870,  luas: 312.4, kepadatan: 64,  miskin: 14.7 },
  { nama: "Lampasio",       lat: 0.850, lng: 120.550, penduduk: 14020,  luas: 286.7, kepadatan: 49,  miskin: 18.5 },
  { nama: "Ogodeide",       lat: 0.760, lng: 120.470, penduduk: 13210,  luas: 243.8, kepadatan: 54,  miskin: 19.2 },
  { nama: "Basidondo",      lat: 0.630, lng: 120.420, penduduk: 11430,  luas: 221.5, kepadatan: 52,  miskin: 20.1 },
  { nama: "Dako Pemean",    lat: 1.180, lng: 120.620, penduduk: 10840,  luas: 189.3, kepadatan: 57,  miskin: 16.8 },
];

const PALETTE = ["#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E3A5F"];

function getColor(nilai: number, min: number, max: number): string {
  const ratio = (nilai - min) / (max - min || 1);
  const idx = Math.min(Math.floor(ratio * PALETTE.length), PALETTE.length - 1);
  return PALETTE[idx];
}

function fmt(n: number, satuan: string) {
  if (satuan === "jiwa") return n.toLocaleString("id-ID") + " jiwa";
  if (satuan === "km²")  return n.toLocaleString("id-ID") + " km²";
  if (satuan === "%")    return n.toFixed(1) + "%";
  return n.toLocaleString("id-ID") + " " + satuan;
}

export default function MapView() {
  const mapRef    = useRef<any>(null);
  const layerRef  = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState("penduduk");
  const [hovered, setHovered]     = useState<string | null>(null);

  const ind = INDICATORS.find((i) => i.key === activeKey)!;
  const values = KECAMATAN.map((k) => (k as any)[activeKey] as number);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const sorted = [...KECAMATAN].sort((a, b) => (b as any)[activeKey] - (a as any)[activeKey]);

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current, { zoomControl: false }).setView([0.85, 120.82], 9);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        opacity: 0.6,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Update markers when indicator changes
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      layerRef.current.forEach((l) => l.remove());
      layerRef.current = [];

      KECAMATAN.forEach((kec) => {
        const nilai = (kec as any)[activeKey] as number;
        const color = getColor(nilai, minV, maxV);
        const ratio = (nilai - minV) / (maxV - minV || 1);
        const radius = 10 + ratio * 22;

        const marker = L.circleMarker([kec.lat, kec.lng], {
          radius,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(mapRef.current);

        const popup = L.popup({ closeButton: false, offset: [0, -radius] }).setContent(`
          <div style="min-width:180px;font-family:sans-serif">
            <p style="font-weight:700;font-size:14px;color:#0C2340;margin:0 0 4px">${kec.nama}</p>
            <p style="font-size:11px;color:#94A3B8;margin:0 0 8px">Kec. Kab. Toli-Toli</p>
            <div style="background:#F0F9FF;border-radius:8px;padding:8px 10px">
              <p style="font-size:10px;color:#64748B;margin:0">${ind.label}</p>
              <p style="font-size:18px;font-weight:800;color:#1D6FCA;margin:2px 0 0">${fmt(nilai, ind.satuan)}</p>
            </div>
            <p style="font-size:10px;color:#CBD5E1;margin:6px 0 0">Sumber: BPS Kab. Toli-Toli ${ind.tahun}</p>
          </div>
        `);

        marker.on("mouseover", () => {
          marker.openPopup();
          setHovered(kec.nama);
        });
        marker.on("mouseout", () => {
          marker.closePopup();
          setHovered(null);
        });
        marker.bindPopup(popup);

        layerRef.current.push(marker);
      });
    });
  }, [activeKey, minV, maxV, ind]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">

      {/* ── Panel kiri ── */}
      <div className="lg:w-64 shrink-0 flex flex-col gap-4">

        {/* Pilih Indikator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pilih Indikator</p>
          <div className="space-y-1">
            {INDICATORS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveKey(item.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeKey === item.key
                    ? "bg-[#1D6FCA] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="block font-semibold leading-tight">{item.label}</span>
                <span className={`text-[11px] ${activeKey === item.key ? "text-blue-100" : "text-gray-400"}`}>
                  Satuan: {item.satuan} · {item.tahun}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Legenda</p>
          <div className="flex gap-1 mb-1.5">
            {PALETTE.map((c) => (
              <div key={c} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{fmt(minV, ind.satuan)}</span>
            <span>{fmt(maxV, ind.satuan)}</span>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-1 overflow-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Peringkat Kecamatan</p>
          <div className="space-y-1">
            {sorted.map((kec, i) => {
              const nilai = (kec as any)[activeKey] as number;
              const ratio = (nilai - minV) / (maxV - minV || 1);
              return (
                <div
                  key={kec.nama}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                    hovered === kec.nama ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{kec.nama}</p>
                    <div className="mt-0.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${ratio * 100}%`, backgroundColor: getColor(nilai, minV, maxV) }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#1D6FCA] shrink-0">
                    {ind.satuan === "jiwa"  ? (nilai / 1000).toFixed(1) + "k"
                     : ind.satuan === "%" ? nilai.toFixed(1) + "%"
                     : nilai.toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Peta ── */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
          style={{ height: "600px" }}
        />

        {/* Overlay title */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-[#0C2340]">{ind.label}</p>
          <p className="text-[10px] text-gray-400">per Kecamatan · {ind.tahun}</p>
        </div>

        {/* Sumber */}
        <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] text-gray-400 border border-gray-100">
          Sumber: BPS Kabupaten Toli-Toli
        </div>
      </div>
    </div>
  );
}
