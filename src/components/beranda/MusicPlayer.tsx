"use client";
import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, X, Volume2 } from "lucide-react";
import { musikApi } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface MusikItem { id: number; judul: string; audioUrl: string; }

export default function MusicPlayer() {
  const [track, setTrack] = useState<MusikItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    musikApi.getAll().then((r) => {
      if (r.data?.length) setTrack(r.data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!track) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(`${API_BASE}${track.audioUrl}`);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = `${API_BASE}${track.audioUrl}`;
    }
    return () => {
      audioRef.current?.pause();
    };
  }, [track]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!track || dismissed) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {expanded && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
          style={{
            background: "rgba(12,35,64,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          <Volume2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate max-w-[140px]">{track.judul}</p>
            <p className="text-white/40 text-[10px]">{playing ? "Sedang diputar" : "Dijeda"}</p>
          </div>
          <button onClick={toggle} className="w-8 h-8 rounded-full bg-[#38BDF8] flex items-center justify-center hover:bg-[#7DD3FC] transition-colors shrink-0">
            {playing ? <Pause className="w-3.5 h-3.5 text-[#0C2340]" /> : <Play className="w-3.5 h-3.5 text-[#0C2340] ml-0.5" />}
          </button>
          <button onClick={() => { audioRef.current?.pause(); setDismissed(true); }} className="text-white/30 hover:text-white/60 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toggle bubble */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        style={{
          background: playing ? "linear-gradient(135deg,#38BDF8,#1D6FCA)" : "rgba(12,35,64,0.85)",
          border: "1px solid rgba(56,189,248,0.35)",
          backdropFilter: "blur(8px)",
        }}
        title="Musik Latar"
      >
        <Music className="w-4 h-4 text-white" style={{ animation: playing ? "pulse 2s infinite" : "none" }} />
      </button>
    </div>
  );
}
