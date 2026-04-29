// app/page.tsx
"use client";

import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">

      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial amber glow center */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div style={{
          width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.02) 40%, transparent 70%)",
        }} />
      </div>

      {/* Scanning line */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)",
          animation: "scan 6s linear infinite",
        }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes scan {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .fade-up-1 { animation: fade-up 0.7s 0.0s ease forwards; opacity: 0; }
        .fade-up-2 { animation: fade-up 0.7s 0.15s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fade-up 0.7s 0.3s ease forwards; opacity: 0; }
        .fade-up-4 { animation: fade-up 0.7s 0.45s ease forwards; opacity: 0; }
        .fade-up-5 { animation: fade-up 0.7s 0.6s ease forwards; opacity: 0; }
        .mono  { font-family: 'DM Mono', monospace; }
        .serif { font-family: 'Playfair Display', serif; }
        .sans  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <Image src="/LOGO_TUTWURI.png" alt="Logo" width={38} height={38} className="object-contain opacity-80" />
          <div>
            <p className="mono text-[10px] text-slate-500 uppercase tracking-widest">BBPMP Jawa Barat</p>
            <p className="mono text-[9px] text-slate-600">Balai Besar Penjaminan Mutu Pendidikan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", animation: "blink 1.4s ease-in-out infinite" }} />
          <span className="mono text-[10px] text-amber-500 uppercase tracking-widest">Maintenance</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">

          {/* Animated cog */}
          <div className="fade-up-1 flex justify-center mb-10">
            <div className="relative" style={{ width: 80, height: 80 }}>
              {[0, 1].map(i => (
                <div key={i} style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "1px solid rgba(251,191,36,0.3)",
                  animation: `pulse-ring 2.5s ${i * 0.9}s ease-out infinite`,
                }} />
              ))}
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "float 4s ease-in-out infinite",
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  style={{ animation: "rotate-slow 8s linear infinite" }}>
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-2l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 19.48 18 20 18 20l2-2-1.484-1.75 1.106-2.718L22 13v-2l-2.378-.605Z"
                    stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="fade-up-2 mb-4">
            <span className="mono text-[11px] text-amber-600/80 uppercase tracking-[0.2em] border border-amber-800/30 bg-amber-950/30 px-4 py-1.5 rounded-full">
              503 · Scheduled Downtime
            </span>
          </div>

          {/* Heading */}
          <h1 className="fade-up-3 serif text-4xl font-bold text-white leading-tight mb-4">
            Sedang dalam<br />
            <span style={{ color: "#f59e0b" }}>Pemeliharaan</span>
          </h1>

          {/* Description */}
          <p className="fade-up-4 sans text-slate-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            Dashboard PMP Jawa Barat sedang dalam proses pemeliharaan dan peningkatan sistem.
            Kami akan segera kembali online.
          </p>

          {/* Divider */}
          <div className="fade-up-4 flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="mono text-[10px] text-slate-600 uppercase tracking-widest">Info Kontak</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Contact cards */}
          <div className="fade-up-5 grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
            {[
              { label: "Email", value: "bbpmp.jabar@kemdikbud.go.id", icon: "✉" },
              { label: "Website", value: "bbpmpjabar.kemdikbud.go.id", icon: "🌐" },
            ].map(c => (
              <div key={c.label} className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <p className="mono text-[9px] text-slate-600 uppercase tracking-widest mb-1.5">{c.icon} {c.label}</p>
                <p className="mono text-[10px] text-slate-400 break-all leading-relaxed">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Terminal status */}
          <div className="fade-up-5 p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-left max-w-sm mx-auto">
            <p className="mono text-[10px] text-slate-600 mb-3">$ system_status --check</p>
            <div className="space-y-2">
              {[
                { label: "database",      status: "ok" },
                { label: "api_gateway",   status: "ok" },
                { label: "web_interface", status: "maintenance" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center gap-3">
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: status === "ok" ? "#10b981" : "#f59e0b",
                    animation: status !== "ok" ? "blink 1.4s ease-in-out infinite" : undefined,
                  }} />
                  <span className="mono text-[10px] text-slate-500 flex-1">{label}</span>
                  <span className="mono text-[10px]" style={{ color: status === "ok" ? "#10b981" : "#f59e0b" }}>
                    [{status}]
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-800/60 px-8 py-4 flex items-center justify-between">
        <p className="mono text-[10px] text-slate-600">© 2026 BBPMP Jawa Barat</p>
        <p className="mono text-[10px] text-slate-700">Rapor Pendidikan · 2024–2025</p>
      </div>
    </div>
  );
}