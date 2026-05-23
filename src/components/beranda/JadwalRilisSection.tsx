"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { jadwalApi } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { id } from "date-fns/locale";

interface Jadwal {
  id: number;
  judul: string;
  tanggal: string;
  kategori: string;
  deskripsi?: string;
  link?: string;
  status: string;
}

const KATEGORI: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Publikasi:  { icon: BookOpen,  color: "#1D6FCA", bg: "#EBF4FF" },
  BRS:        { icon: FileText,  color: "#059669", bg: "#ECFDF5" },
  Infografis: { icon: ImageIcon, color: "#7C3AED", bg: "#F5F3FF" },
};

function MiniCalendar({ jadwals }: { jadwals: Jadwal[] }) {
  const [current, setCurrent] = useState(new Date());

  const start = startOfMonth(current);
  const end = endOfMonth(current);
  const days = eachDayOfInterval({ start, end });
  const startWeekday = getDay(start); // 0=Sun

  const releaseDates = jadwals.map((j) => new Date(j.tanggal));

  const getKategoriForDate = (date: Date) => {
    const jad = jadwals.find((j) => isSameDay(new Date(j.tanggal), date));
    return jad ? KATEGORI[jad.kategori] : null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 shrink-0 w-full lg:w-64">
      {/* Header bulan */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrent((c) => subMonths(c, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <p className="text-sm font-bold text-[#0C2340] capitalize">
          {format(current, "MMMM yyyy", { locale: id })}
        </p>
        <button
          onClick={() => setCurrent((c) => addMonths(c, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Nama hari */}
      <div className="grid grid-cols-7 mb-1">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Padding awal bulan */}
        {[...Array(startWeekday)].map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const kat = getKategoriForDate(day);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className="relative flex items-center justify-center"
            >
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  today
                    ? "bg-[#0C2340] text-white"
                    : kat
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                style={kat && !today ? { backgroundColor: kat.color } : {}}
                title={kat ? jadwals.find((j) => isSameDay(new Date(j.tanggal), day))?.judul : undefined}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 border-t border-slate-100 pt-3 space-y-1.5">
        {Object.entries(KATEGORI).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
            <span className="text-[11px] text-slate-500 font-medium">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0C2340]" />
          <span className="text-[11px] text-slate-500 font-medium">Hari ini</span>
        </div>
      </div>
    </div>
  );
}

export default function JadwalRilisSection() {
  const [items, setItems] = useState<Jadwal[]>([]);

  useEffect(() => {
    jadwalApi.getAll()
      .then((r) => setItems(r.data))
      .catch(() => {});
  }, []);

  const displayed = items.slice(0, 5);

  return (
    <section className="bg-[#F8FAFC] py-16 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="section-tag mb-3">Jadwal Rilis</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C2340]">
              Publikasi BPS Toli-Toli
            </h2>
          </div>
          <Link
            href="/jadwal-rilis"
            className="hidden sm:flex items-center gap-1.5 text-[#1D6FCA] text-sm font-semibold hover:underline"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Layout: List + Kalender */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* List jadwal */}
          <div className="flex-1 space-y-2.5">
            {displayed.length === 0
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))
              : displayed.map((item) => {
                  const kat = KATEGORI[item.kategori] || KATEGORI.BRS;
                  const Icon = kat.icon;
                  const released = item.status === "RELEASED";
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow px-4 py-3.5 flex items-center gap-4"
                    >
                      {/* Tanggal */}
                      <div className="shrink-0 w-12 text-center">
                        <p className="text-xl font-extrabold text-[#0C2340] leading-none">
                          {format(new Date(item.tanggal), "d")}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          {format(new Date(item.tanggal), "MMM yy", { locale: id })}
                        </p>
                      </div>

                      <div className="w-px h-10 bg-slate-100 shrink-0" />

                      {/* Ikon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: kat.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: kat.color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0C2340] truncate">{item.judul}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: kat.bg, color: kat.color }}
                          >
                            {item.kategori}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              released ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {released ? "✓ Sudah Rilis" : "⏱ Akan Rilis"}
                          </span>
                        </div>
                      </div>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 btn-outline text-xs px-3 py-1.5"
                        >
                          Unduh
                        </a>
                      )}
                    </div>
                  );
                })}

            <div className="sm:hidden mt-2 text-center">
              <Link href="/jadwal-rilis" className="btn-outline text-sm inline-flex">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mini Calendar */}
          <MiniCalendar jadwals={items} />
        </div>
      </div>
    </section>
  );
}
