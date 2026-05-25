"use client";
import { useEffect, useRef, useState } from "react";
import { Users, TrendingUp, BarChart2, Award, Activity, Globe, Home, Briefcase } from "lucide-react";
import { statistikApi } from "@/lib/api";

const ICON_MAP: Record<string, React.ElementType> = {
  Users, TrendingUp, BarChart2, Award, Activity, Globe, Home, Briefcase,
};

const BOX_COLORS = [
  "#1D6FCA",
  "#059669",
  "#D97706",
  "#7C3AED",
];

interface Stat {
  id: number;
  label: string;
  nilai: string;
  satuan: string;
  tahun: number;
  icon?: string;
  warna: string;
  urutan: number;
}

export default function StatBoxCarousel() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [offset, setOffset] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    statistikApi.getAll().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (stats.length < 2) return;

    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setOffset((prev) => (prev + 1) % stats.length);
        setFading(false);
      }, 350);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats]);

  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  // Sliding window: 4 kotak selalu tampil, setiap 3 detik geser +1
  const visible = [0, 1, 2, 3].map((pos) => stats[(offset + pos) % stats.length]);

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 0.35s ease" }}
    >
      {visible.map((stat, i) => {
        const Icon = ICON_MAP[stat.icon || "BarChart2"] || BarChart2;
        const bg = BOX_COLORS[i];

        return (
          <div
            key={`${stat.id}-${i}`}
            className="relative rounded-2xl p-5 overflow-hidden flex flex-col"
            style={{ backgroundColor: bg }}
          >
            {/* Dekorasi lingkaran */}
            <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/5" />

            {/* Icon */}
            <div className="relative w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Icon className="w-4.5 h-4.5" color="white" strokeWidth={2.5} />
            </div>

            {/* Label */}
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-white/70">
              {stat.label}
            </p>

            {/* Nilai */}
            <p className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none mb-1 text-white">
              {stat.nilai}
            </p>

            {/* Satuan + tahun */}
            <p className="text-[11px] font-medium mt-auto text-white/60">
              {stat.satuan}&nbsp;·&nbsp;{stat.tahun}
            </p>
          </div>
        );
      })}
    </div>
  );
}
