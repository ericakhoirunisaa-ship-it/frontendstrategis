"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "@/lib/api";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    api.post("/stats/kunjungan")
      .then((r) => setCount(r.data.pengunjung))
      .catch(() => {
        api.get("/stats").then((r) => setCount(r.data.pengunjung)).catch(() => {});
      });
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2">
      <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
      <span className="text-white/40 text-xs font-medium">
        {count.toLocaleString("id-ID")}+ Pengunjung
      </span>
    </div>
  );
}
