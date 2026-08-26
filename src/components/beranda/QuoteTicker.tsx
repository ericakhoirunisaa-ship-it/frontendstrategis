"use client";
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { quotesApi } from "@/lib/api";

interface QuoteItem { id?: number; teks: string; penulis: string; }

export default function QuoteTicker() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    quotesApi.getAll().then((r) => {
      if (r.data?.length) setQuotes(r.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % quotes.length);
        setVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes]);

  const q = quotes[idx] ?? quotes[0];
  if (!q) return null;

  return (
    <div className="bg-[#0A1E35] border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <Quote className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 opacity-70" />
        <p
          className="text-white/55 text-xs leading-relaxed transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <span className="text-white/80 italic">&ldquo;{q.teks}&rdquo;</span>
          <span className="text-white/30 ml-2">— {q.penulis}</span>
        </p>
        <div className="ml-auto flex gap-1 shrink-0">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 300); }}
              className="w-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i === idx ? "#38BDF8" : "rgba(255,255,255,0.2)" }}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
