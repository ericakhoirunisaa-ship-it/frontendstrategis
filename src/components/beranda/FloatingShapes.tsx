"use client";

export default function FloatingShapes() {
  return (
    <div className="relative w-full h-[200px] lg:w-[420px] lg:h-[320px] shrink-0 overflow-hidden">
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-22px) rotate(4deg); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(22px) rotate(-4deg); }
        }
        @keyframes floatSide {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50%       { transform: translateX(18px) rotate(6deg); }
        }
      `}</style>

      {/* Kotak besar kiri atas */}
      <div style={{
        position: "absolute", width: 148, height: 148, borderRadius: 28,
        background: "rgba(255,255,255,0.07)",
        top: "8%", left: "4%",
        animation: "floatUp 7s ease-in-out infinite",
      }} />

      {/* Kotak sedang kanan atas */}
      <div style={{
        position: "absolute", width: 88, height: 88, borderRadius: 20,
        background: "rgba(255,255,255,0.05)",
        top: "4%", right: "8%",
        animation: "floatDown 9s ease-in-out infinite 1.2s",
      }} />

      {/* Lingkaran besar kanan bawah */}
      <div style={{
        position: "absolute", width: 110, height: 110, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        bottom: "6%", right: "4%",
        animation: "floatUp 8s ease-in-out infinite 2s",
      }} />

      {/* Kotak kecil tengah */}
      <div style={{
        position: "absolute", width: 56, height: 56, borderRadius: 14,
        background: "rgba(56,189,248,0.10)",
        bottom: "28%", left: "52%",
        animation: "floatSide 10s ease-in-out infinite 0.8s",
      }} />

      {/* Kotak kecil kiri bawah */}
      <div style={{
        position: "absolute", width: 46, height: 46, borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
        bottom: "12%", left: "18%",
        animation: "floatDown 6s ease-in-out infinite 0.4s",
      }} />

      {/* Dot sedang */}
      <div style={{
        position: "absolute", width: 18, height: 18, borderRadius: "50%",
        background: "rgba(255,255,255,0.18)",
        top: "42%", left: "38%",
        animation: "floatSide 5s ease-in-out infinite 1.6s",
      }} />

      {/* Dot kecil */}
      <div style={{
        position: "absolute", width: 9, height: 9, borderRadius: "50%",
        background: "rgba(255,255,255,0.28)",
        bottom: "38%", left: "10%",
        animation: "floatUp 4s ease-in-out infinite 2.5s",
      }} />

      {/* Dot aksen biru */}
      <div style={{
        position: "absolute", width: 12, height: 12, borderRadius: "50%",
        background: "rgba(56,189,248,0.35)",
        top: "22%", right: "30%",
        animation: "floatDown 5.5s ease-in-out infinite 3s",
      }} />
    </div>
  );
}
