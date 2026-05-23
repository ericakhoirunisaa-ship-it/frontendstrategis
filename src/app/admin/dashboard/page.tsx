"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { indikatorApi, jadwalApi, statistikApi } from "@/lib/api";
import { Database, Calendar, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({ indikator: 0, jadwal: 0, statistik: 0 });

  useEffect(() => {
    Promise.all([
      indikatorApi.getAll(),
      jadwalApi.getAll(),
      statistikApi.getAll(),
    ]).then(([ind, jad, stat]) => {
      setStats({ indikator: ind.data.length, jadwal: jad.data.length, statistik: stat.data.length });
    }).catch(() => {});
  }, []);

  const cards = [
    { icon: BarChart2, label: "Statistik Beranda", count: stats.statistik, href: "/admin/statistik", color: "#2196F3" },
    { icon: Database, label: "Indikator Data", count: stats.indikator, href: "/admin/indikator", color: "#4CAF50" },
    { icon: Calendar, label: "Jadwal Rilis", count: stats.jadwal, href: "/admin/jadwal-rilis", color: "#FF9800" },
  ];

  return (
    <AdminLayout>
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Selamat Datang di Admin Panel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.color + "20" }}>
                    <Icon className="w-6 h-6" style={{ color: card.color }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-3xl font-bold text-[#1A1A2E] mb-1">{card.count}</p>
                <p className="text-gray-500 text-sm">{card.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-[#1A1A2E] mb-3">Panduan Cepat</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Pergi ke <Link href="/admin/statistik" className="text-[#2196F3] hover:underline">Statistik Beranda</Link> untuk mengubah 4 kotak indikator di halaman beranda.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Pergi ke <Link href="/admin/indikator" className="text-[#2196F3] hover:underline">Indikator & Data</Link> untuk menambah indikator baru atau upload data dari CSV.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Pergi ke <Link href="/admin/jadwal-rilis" className="text-[#2196F3] hover:underline">Jadwal Rilis</Link> untuk menambah atau mengupdate jadwal publikasi BPS.</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
