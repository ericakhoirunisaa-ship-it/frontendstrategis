"use client";
import { useEffect, useState } from "react";

const CSS = `
  @keyframes hf1 { 0%,100%{transform:translateY(0px)}  50%{transform:translateY(-14px)} }
  @keyframes hf2 { 0%,100%{transform:translateY(0px)}  50%{transform:translateY(-9px)}  }
  @keyframes hf3 { 0%,100%{transform:translateY(0px)}  50%{transform:translateY(-18px)} }
  @keyframes hping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.25;transform:scale(2.2)} }
  @keyframes hbar  { from{transform:scaleY(0)} to{transform:scaleY(1)} }
  @keyframes harc  { from{stroke-dashoffset:154} to{stroke-dashoffset:0} }
`;

const BARS = [
  { x: 188, h: 62,  c: "#3B82F6",  l: "'20", delay: "0.1s" },
  { x: 210, h: 88,  c: "#2563EB",  l: "'21", delay: "0.2s" },
  { x: 232, h: 73,  c: "#3B82F6",  l: "'22", delay: "0.3s" },
  { x: 254, h: 100, c: "#1D4ED8",  l: "'23", delay: "0.4s" },
  { x: 276, h: 82,  c: "#60A5FA",  l: "'24", delay: "0.5s" },
];

const TREND = [197, 149, 219, 122, 241, 137, 263, 110, 285, 124];

const DOTS: [number, number, number, number][] = [
  [492, 188, 0,   0.45],
  [110, 172, 1.2, 0.45],
  [338, 362, 0.6, 0.38],
  [496, 298, 1.8, 0.40],
  [170, 362, 0.3, 0.32],
];

interface StatItem {
  id: number;
  label: string;
  nilai: string;
  satuan: string;
  tahun: number;
  warna: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function HeroIllustration() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetch(`${API}/statistik`)
      .then((r) => r.json())
      .then((data: StatItem[]) => setStats(data))
      .catch(() => {});
  }, []);

  const find = (kw: string) =>
    stats.find((s) => s.label.toLowerCase().includes(kw.toLowerCase()));

  const s1 = find("kemiskinan") ?? find("miskin");
  const s2 = find("penduduk") ?? find("jumlah penduduk") ?? stats[0];

  const card1Val   = s1 ? `${s1.nilai}${s1.satuan ? " " + s1.satuan : ""}` : "14,8%";
  const card1Label = s1 ? s1.label.toUpperCase() : "KEMISKINAN";
  const card1Year  = s1 ? String(s1.tahun) : "2024";

  const card2Val   = s2 ? s2.nilai : "222.471";
  const card2Label = s2 ? s2.label.toUpperCase() : "PENDUDUK";
  const card2Sat   = s2 ? s2.satuan.toLowerCase() + " · " + s2.tahun : "jiwa · 2024";

  return (
    <div className="relative w-full h-[220px] lg:w-[460px] lg:h-[385px] shrink-0 overflow-visible select-none">
      <style>{CSS}</style>
      <svg viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

        {/* ambient glow */}
        <ellipse cx="272" cy="215" rx="215" ry="170" fill="rgba(29,111,202,0.06)" />

        {/* ══ DATABASE CYLINDERS ══ */}
        <g style={{ animation: "hf1 7s ease-in-out infinite" }}>
          <ellipse cx="78" cy="302" rx="34" ry="11" fill="#1E3A8A" />
          <rect x="44" y="264" width="68" height="39" fill="#1E3A8A" />
          <ellipse cx="78" cy="264" rx="34" ry="11" fill="#2563EB" />
          <ellipse cx="78" cy="264" rx="21" ry="7"  fill="#93C5FD" opacity="0.28" />
          <line x1="44" y1="278" x2="112" y2="278" stroke="#2563EB" strokeWidth="1.2" opacity="0.45" />
          <line x1="44" y1="286" x2="112" y2="286" stroke="#2563EB" strokeWidth="1.2" opacity="0.45" />
          <ellipse cx="78" cy="250" rx="27" ry="9"  fill="#1D4ED8" />
          <rect x="51" y="215" width="54" height="35" fill="#1D4ED8" />
          <ellipse cx="78" cy="215" rx="27" ry="9"  fill="#3B82F6" />
          <ellipse cx="78" cy="215" rx="17" ry="5.5" fill="#93C5FD" opacity="0.28" />
          <line x1="51" y1="228" x2="105" y2="228" stroke="#3B82F6" strokeWidth="1.2" opacity="0.45" />
          <line x1="51" y1="236" x2="105" y2="236" stroke="#3B82F6" strokeWidth="1.2" opacity="0.45" />
        </g>
        <path d="M112 258 Q130 250 148 240" stroke="#1D6FCA" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.38" fill="none" />
        <circle cx="112" cy="258" r="3.5" fill="#38BDF8" style={{ animation: "hping 2.5s ease-in-out infinite" }} />

        {/* ══ MONITOR ══ */}
        <rect x="148" y="62" width="268" height="198" rx="14" fill="#0D1F3C" stroke="#1D6FCA" strokeWidth="1.5" />
        <rect x="158" y="72" width="248" height="178" rx="8" fill="#07111F" />
        <circle cx="282" cy="67" r="3" fill="#1D6FCA" opacity="0.5" />
        <rect x="274" y="260" width="16" height="26" fill="#1D4ED8" />
        <rect x="244" y="286" width="76" height="10" rx="5" fill="#1E3A8A" />

        <rect x="162" y="77" width="238" height="16" rx="4" fill="#0F2654" opacity="0.85" />
        <circle cx="170" cy="85" r="3" fill="#EF4444" opacity="0.75" />
        <circle cx="180" cy="85" r="3" fill="#F59E0B" opacity="0.75" />
        <circle cx="190" cy="85" r="3" fill="#22C55E" opacity="0.75" />
        <text x="204" y="89" fontSize="6.5" fill="#60A5FA" fontFamily="monospace" fontWeight="bold" letterSpacing="0.4">
          Data Strategis · BPS Toli-Toli
        </text>
        <line x1="162" y1="97" x2="400" y2="97" stroke="#1D6FCA" strokeWidth="0.5" opacity="0.4" />

        {[122, 142, 162, 182].map((y) => (
          <line key={y} x1="178" y1={y} x2="312" y2={y}
            stroke="#1D4ED8" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.32" />
        ))}
        <line x1="178" y1="102" x2="178" y2="204" stroke="#1D6FCA" strokeWidth="0.7" opacity="0.4" />
        <line x1="178" y1="204" x2="314" y2="204" stroke="#1D6FCA" strokeWidth="0.7" opacity="0.4" />

        {BARS.map(({ x, h, c, l, delay }) => (
          <g key={x}>
            <rect x={x} y={204 - h} width="18" height={h} rx="3" fill={c}
              style={{ transformBox: "fill-box", transformOrigin: "bottom center", animation: `hbar 1.1s cubic-bezier(0.34,1.3,0.64,1) ${delay} both` }}
            />
            <rect x={x} y={204 - h} width="4" height={Math.min(h, 22)} rx="2" fill="white" opacity="0.1"
              style={{ transformBox: "fill-box", transformOrigin: "bottom center", animation: `hbar 1.1s cubic-bezier(0.34,1.3,0.64,1) ${delay} both` }}
            />
            <text x={x + 9} y="213" fontSize="5.5" fill="#475569" textAnchor="middle" fontFamily="sans-serif">{l}</text>
          </g>
        ))}

        <polyline points={TREND.join(",")}
          stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
        {Array.from({ length: TREND.length / 2 }, (_, i) => (
          <circle key={i} cx={TREND[i * 2]} cy={TREND[i * 2 + 1]} r="2.5" fill="#38BDF8" />
        ))}

        <g transform="translate(354,152)">
          <circle cx="0" cy="0" r="36" stroke="#0F2654" strokeWidth="16" fill="none" />
          <circle cx="0" cy="0" r="36"
            stroke="#2563EB" strokeWidth="16" fill="none"
            strokeDasharray="154 72" strokeDashoffset="0"
            transform="rotate(-90)"
            style={{ animation: "harc 1.6s ease-out 0.7s both" }}
          />
          <circle cx="0" cy="0" r="36"
            stroke="#60A5FA" strokeWidth="16" fill="none"
            strokeDasharray="50 176" strokeDashoffset="-154"
            transform="rotate(-90)"
          />
          <text x="0" y="-4" fontSize="13" fill="white" textAnchor="middle" fontWeight="800" fontFamily="sans-serif">68,42</text>
          <text x="0" y="9"  fontSize="6.5" fill="#60A5FA" textAnchor="middle" fontFamily="sans-serif">IPM</text>
          <circle cx="-18" cy="52" r="4" fill="#2563EB" />
          <text x="-12" y="56" fontSize="5.5" fill="#64748B" fontFamily="sans-serif">Kab.</text>
          <circle cx="10"  cy="52" r="4" fill="#60A5FA" />
          <text x="16"  y="56" fontSize="5.5" fill="#64748B" fontFamily="sans-serif">Nasional</text>
        </g>


        {/* ══ FLOATING INFO CARDS ══ */}

        {/* Card 1 — Stat 1 (kemiskinan / first matching stat) */}
        <g style={{ animation: "hf3 7s ease-in-out infinite" }}>
          <rect x="20" y="92" width="118" height="62" rx="10" fill="#0D1F3C" stroke="#1D6FCA" strokeWidth="1" />
          <rect x="30" y="102" width="22" height="22" rx="6" fill="rgba(56,189,248,0.14)" />
          <rect x="33" y="115" width="3" height="7"  rx="1" fill="#38BDF8" />
          <rect x="38" y="112" width="3" height="10" rx="1" fill="#38BDF8" />
          <rect x="43" y="109" width="3" height="13" rx="1" fill="#38BDF8" />
          <text x="56" y="112" fontSize="6" fill="#60A5FA"  fontFamily="sans-serif" fontWeight="bold">{card1Label.slice(0, 14)}</text>
          <text x="56" y="128" fontSize="15" fill="white"   fontFamily="sans-serif" fontWeight="800">{card1Val}</text>
          <text x="56" y="144" fontSize="6.5" fill="#22C55E" fontFamily="sans-serif">· {card1Year}</text>
        </g>

        {/* Card 2 — Stat 2 (penduduk / second matching stat) */}
        <g style={{ animation: "hf1 8s ease-in-out infinite 2.5s" }}>
          <rect x="392" y="48" width="122" height="62" rx="10" fill="#0D1F3C" stroke="#1D6FCA" strokeWidth="1" />
          <rect x="402" y="58" width="22" height="22" rx="6" fill="rgba(29,111,202,0.2)" />
          <circle cx="409" cy="66" r="4"  fill="#60A5FA" />
          <path d="M405 76 Q409 72 413 76" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="418" cy="65" r="3"  fill="#93C5FD" />
          <text x="428" y="68"  fontSize="6" fill="#60A5FA"  fontFamily="sans-serif" fontWeight="bold">{card2Label.slice(0, 14)}</text>
          <text x="428" y="83"  fontSize="13" fill="white"   fontFamily="sans-serif" fontWeight="800">{card2Val}</text>
          <text x="428" y="98" fontSize="6.5" fill="#94A3B8" fontFamily="sans-serif">{card2Sat}</text>
        </g>

        {/* Card 3 — BPS badge */}
        <g style={{ animation: "hf2 6s ease-in-out infinite 1.8s" }}>
          <rect x="394" y="318" width="118" height="38" rx="9" fill="#0D1F3C" stroke="#38BDF8" strokeWidth="0.8" />
          <circle cx="412" cy="337" r="10" fill="rgba(34,197,94,0.14)" />
          <path d="M407 337 L411 341 L419 332" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="426" y="333" fontSize="7"   fill="#60A5FA" fontFamily="sans-serif" fontWeight="bold">Data Resmi BPS</text>
          <text x="426" y="346" fontSize="6.5" fill="#64748B" fontFamily="sans-serif">Terverifikasi</text>
        </g>

        {/* wires */}
        <path d="M136 250 L148 240" stroke="#1D6FCA" strokeWidth="1" strokeDasharray="3 3" opacity="0.28" fill="none" />
        <path d="M148 174 L136 162" stroke="#1D6FCA" strokeWidth="1" strokeDasharray="3 3" opacity="0.28" fill="none" />
        <path d="M416 262 L416 318" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.22" fill="none" />

        {DOTS.map(([cx, cy, d, o], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="#38BDF8" opacity={o}
            style={{ animation: `hping 3s ease-in-out infinite ${d}s` }} />
        ))}

      </svg>
    </div>
  );
}
