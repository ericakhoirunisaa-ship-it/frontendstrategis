"use client";
import { useState, useEffect } from "react";
import { BookOpen, List, Info, Database, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { indikatorApi } from "@/lib/api";

// ── Markdown renderer ─────────────────────────────────────────────────────────

const MD_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => (
    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#1A1A2E] dark:text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-500 dark:text-slate-400">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 space-y-1 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 space-y-1 ml-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children, ...props }) => {
    const isOrdered = (props as any).ordered;
    return isOrdered ? (
      <li className="text-sm text-gray-600 dark:text-slate-400">{children}</li>
    ) : (
      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-500 shrink-0 mt-[7px]" />
        <span>{children}</span>
      </li>
    );
  },
  code: ({ children }) => (
    <code className="font-mono text-xs bg-blue-50 dark:bg-blue-900/20 text-[#2196F3] px-1.5 py-0.5 rounded">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-50 dark:bg-[#162133] rounded-xl px-4 py-3 my-2 overflow-x-auto text-sm font-mono text-gray-700 dark:text-slate-300">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#2196F3] hover:underline">
      {children}
    </a>
  ),
  h1: ({ children }) => <h1 className="text-base font-bold text-[#1A1A2E] dark:text-white mb-2 mt-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold text-[#1A1A2E] dark:text-white mb-1.5 mt-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 mt-1">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-blue-200 dark:border-blue-700/50 pl-3 my-2 text-sm text-gray-500 dark:text-slate-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-gray-100 dark:border-slate-700/50" />,
};

// ── Kamus sections config ─────────────────────────────────────────────────────

const KAMUS_SECTIONS = [
  { key: "definisi",     label: "Definisi",                  icon: BookOpen },
  { key: "metodologi",   label: "Metodologi / Cara Hitung",  icon: List },
  { key: "interpretasi", label: "Interpretasi",              icon: Info },
  { key: "sumberData",   label: "Sumber Data",               icon: Database },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface KamusEntry {
  nama?: string;
  definisi?: string;
  metodologi?: string;
  interpretasi?: string;
  sumberData?: string;
  [key: string]: unknown;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function KamusStatikPanel({
  slug,
  color = "#059669",
}: {
  slug: string;
  color?: string;
}) {
  const [entry, setEntry] = useState<KamusEntry | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setEntry(null);
    indikatorApi.getBySlug(slug).then((r) => {
      const data = r.data;
      if (data) setEntry(data);
    }).catch(() => {
      // Entry doesn't exist — render nothing
    });
  }, [slug]);

  if (!entry) return null;

  const sections = KAMUS_SECTIONS.filter((s) => !!(entry as any)[s.key]);
  if (!sections.length) return null;

  return (
    <div className="bg-white dark:bg-[#0F1825] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
      {/* Accordion header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: color + "20" }}
          >
            <BookOpen className="w-4 h-4" style={{ color }} />
          </span>
          <span className="font-semibold text-[#1A1A2E] dark:text-white text-sm">Kamus Indikator</span>
          {entry.nama && (
            <span className="text-xs text-gray-400 dark:text-slate-500 font-normal">{entry.nama}</span>
          )}
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-50 dark:border-slate-700/50 divide-y divide-gray-50 dark:divide-slate-700/30">
          {sections.map(({ key, label, icon: Icon }) => (
            <div key={key} className="px-5 py-4">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color + "15" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </span>
                <span className="text-sm font-semibold text-[#1A1A2E] dark:text-white">{label}</span>
              </div>
              {/* Markdown content */}
              <div className="pl-8">
                <ReactMarkdown components={MD_COMPONENTS}>
                  {(entry as any)[key] as string}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
