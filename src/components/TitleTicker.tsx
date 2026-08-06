"use client";
import { useEffect } from "react";

const TEXT = "SITARA — Portal Data Strategis BPS Kabupaten Toli-Toli   ✦   ";

export default function TitleTicker() {
  useEffect(() => {
    let pos = 0;
    const id = setInterval(() => {
      document.title = TEXT.slice(pos) + TEXT.slice(0, pos);
      pos = (pos + 1) % TEXT.length;
    }, 180);
    return () => clearInterval(id);
  }, []);

  return null;
}
