"use client";
import { useEffect, useRef } from "react";

const SPOTS = [
  { nama: "Kota Tolitoli",  lat: 1.030, lng: 120.830, capital: true  },
  { nama: "Galang",         lat: 0.950, lng: 120.930, capital: false },
  { nama: "Dondo",          lat: 0.760, lng: 121.050, capital: false },
  { nama: "Dampal Selatan", lat: 0.550, lng: 121.150, capital: false },
  { nama: "Dampal Utara",   lat: 0.650, lng: 121.250, capital: false },
  { nama: "Tolitoli Utara", lat: 1.150, lng: 120.730, capital: false },
  { nama: "Lampasio",       lat: 0.850, lng: 120.550, capital: false },
  { nama: "Ogodeide",       lat: 0.760, lng: 120.470, capital: false },
  { nama: "Basidondo",      lat: 0.630, lng: 120.420, capital: false },
  { nama: "Dako Pemean",    lat: 1.180, lng: 120.620, capital: false },
];

const MAP_STYLE = `
  @keyframes heroMapRing {
    0%   { transform: scale(1);   opacity: 0.7; }
    70%  { transform: scale(3);   opacity: 0; }
    100% { transform: scale(1);   opacity: 0; }
  }
  .hm-ring { animation: heroMapRing 2.2s ease-out infinite; }
  .leaflet-attribution-flag { display: none !important; }
  .leaflet-control-attribution {
    background: rgba(12,35,64,0.55) !important;
    color: rgba(255,255,255,0.25) !important;
    font-size: 8px !important;
    border-radius: 4px !important;
    padding: 2px 6px !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    backdrop-filter: blur(4px);
  }
  .leaflet-control-attribution a { color: rgba(56,189,248,0.5) !important; }
  .hm-tip .leaflet-tooltip {
    background: rgba(12,35,64,0.88) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.88) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    border-radius: 7px !important;
    padding: 4px 9px !important;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4) !important;
    white-space: nowrap !important;
  }
  .hm-tip .leaflet-tooltip::before { border-top-color: rgba(255,255,255,0.12) !important; }
`;

export default function HeroMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    if (!document.querySelector("link[href*='leaflet']")) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const styleEl = document.createElement("style");
    styleEl.textContent = MAP_STYLE;
    document.head.appendChild(styleEl);

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current, {
        zoomControl:       false,
        attributionControl: true,
        dragging:          false,
        touchZoom:         false,
        scrollWheelZoom:   false,
        doubleClickZoom:   false,
        keyboard:          false,
        boxZoom:           false,
      }).setView([0.87, 120.82], 9);
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution: '© <a href="https://openstreetmap.org">OSM</a> © <a href="https://carto.com">CARTO</a>',
          subdomains:  "abcd",
          maxZoom:     20,
        }
      ).addTo(map);

      SPOTS.forEach((spot) => {
        const tipOpts = {
          permanent:  false,
          direction:  "top" as const,
          offset:     [0, spot.capital ? -10 : -5] as [number, number],
          className:  "hm-tip",
        };

        if (spot.capital) {
          const icon = L.divIcon({
            className: "",
            html: `
              <div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center">
                <div class="hm-ring" style="position:absolute;inset:0;border-radius:50%;background:rgba(56,189,248,0.35)"></div>
                <div style="width:11px;height:11px;border-radius:50%;background:#38BDF8;border:2px solid #fff;box-shadow:0 0 10px rgba(56,189,248,0.9);position:relative;z-index:2"></div>
              </div>`,
            iconSize:   [22, 22],
            iconAnchor: [11, 11],
          });
          L.marker([spot.lat, spot.lng], { icon }).addTo(map).bindTooltip(spot.nama, tipOpts);
        } else {
          L.circleMarker([spot.lat, spot.lng], {
            radius:      4.5,
            fillColor:   "#60A5FA",
            color:       "rgba(255,255,255,0.55)",
            weight:      1.5,
            fillOpacity: 0.85,
          }).addTo(map).bindTooltip(spot.nama, tipOpts);
        }
      });
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <div
      className="relative w-full h-[220px] lg:w-[430px] lg:h-[330px] shrink-0 rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5)" }}
    >
      {/* Leaflet canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(12,35,64,0.6) 100%)",
          zIndex: 400,
        }}
      />

      {/* Bottom fade into hero bg */}
      <div
        className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0C2340 0%, transparent 100%)", zIndex: 401 }}
      />

      {/* Right fade */}
      <div
        className="absolute inset-y-0 right-0 w-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(12,35,64,0.35))", zIndex: 401 }}
      />

      {/* ── Location chip ── */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
        style={{
          background:     "rgba(12,35,64,0.78)",
          backdropFilter: "blur(8px)",
          border:         "1px solid rgba(255,255,255,0.13)",
          zIndex: 500,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0"
          style={{ boxShadow: "0 0 5px #38BDF8", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
        />
        <span className="text-white/90 text-[11px] font-bold tracking-wide">Kab. Toli-Toli</span>
        <span className="text-white/35 text-[10px]">· Sulteng</span>
      </div>

      {/* ── Stats chip ── */}
      <div
        className="absolute bottom-4 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
        style={{
          background:     "rgba(12,35,64,0.72)",
          backdropFilter: "blur(8px)",
          border:         "1px solid rgba(255,255,255,0.08)",
          zIndex: 500,
        }}
      >
        <span className="text-white/55 text-[10px] font-medium">10 Kecamatan</span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className="text-white/55 text-[10px] font-medium">4.079 km²</span>
      </div>

      {/* ── Coordinates ── */}
      <div
        className="absolute bottom-4 right-3 px-2 py-1 rounded-lg"
        style={{
          background: "rgba(12,35,64,0.55)",
          border:     "1px solid rgba(255,255,255,0.07)",
          zIndex: 500,
        }}
      >
        <span className="text-white/30 text-[9px] font-mono">0°51′N · 120°49′E</span>
      </div>
    </div>
  );
}
