"use client";
import { useState, useEffect, useRef } from "react";
import { Accessibility } from "lucide-react";

type FontSize = "sm" | "md" | "lg";

const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "14px",
  md: "16px",
  lg: "19px",
};

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [highContrast, setHighContrast] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSize = (localStorage.getItem("a11y-font") as FontSize) || "md";
    const savedContrast = localStorage.getItem("a11y-contrast") === "1";
    setFontSize(savedSize);
    setHighContrast(savedContrast);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize];
    localStorage.setItem("a11y-font", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("a11y-contrast", highContrast ? "1" : "0");
  }, [highContrast]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const reset = () => {
    setFontSize("md");
    setHighContrast(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`p-2 rounded-lg transition-colors ${
          open || fontSize !== "md" || highContrast
            ? "bg-blue-50 dark:bg-blue-900/30 text-[#1D6FCA]"
            : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        aria-label="Pengaturan Aksesibilitas"
        title="Aksesibilitas"
      >
        <Accessibility className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#0F1825] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 p-4 z-50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Aksesibilitas
          </p>

          {/* Ukuran Teks */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Ukuran Teks
            </p>
            <div className="flex gap-2">
              {(
                [
                  { key: "sm", label: "A", size: "13px", keterangan: "Kecil" },
                  { key: "md", label: "A", size: "15px", keterangan: "Normal" },
                  { key: "lg", label: "A", size: "18px", keterangan: "Besar" },
                ] as const
              ).map(({ key, label, size, keterangan }) => (
                <button
                  key={key}
                  onClick={() => setFontSize(key)}
                  title={keterangan}
                  className={`flex-1 py-2 rounded-xl border font-bold transition-colors ${
                    fontSize === key
                      ? "bg-[#1D6FCA] text-white border-[#1D6FCA]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1D6FCA] hover:text-[#1D6FCA]"
                  }`}
                  style={{ fontSize: size }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              {["Kecil", "Normal", "Besar"].map((t) => (
                <span key={t} className="text-[10px] text-slate-400 dark:text-slate-500">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Kontras Tinggi */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Kontras Tinggi
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Warna lebih jelas & terang
              </p>
            </div>
            <button
              onClick={() => setHighContrast((v) => !v)}
              role="switch"
              aria-checked={highContrast}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                highContrast ? "bg-[#1D6FCA]" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  highContrast ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Reset */}
          {(fontSize !== "md" || highContrast) && (
            <button
              onClick={reset}
              className="mt-4 w-full text-[11px] font-semibold text-slate-400 hover:text-[#1D6FCA] dark:hover:text-blue-400 transition-colors border-t border-slate-100 dark:border-slate-700/50 pt-3"
            >
              Reset ke default
            </button>
          )}
        </div>
      )}
    </div>
  );
}
