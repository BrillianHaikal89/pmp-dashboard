// components/common/SpmCompare.tsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { DashData } from "../../types";

export function SpmCompare({ d24, d25 }: { d24: DashData; d25: DashData }) {
  const spm24 = parseFloat((d24.spm_value ?? "0").replace(",", ".")) || 0;
  const spm25 = parseFloat((d25.spm_value ?? "0").replace(",", ".")) || 0;
  const delta = spm25 - spm24;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">📅 SPM Tahun 2024</p>
        <p className="text-4xl font-black">{d24.spm_value}</p>
        <p className="text-blue-200 text-xs mt-2">Indeks SPM {d24.tahun || "Kab. Bandung"}</p>
      </div>
      <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-1">📅 SPM Tahun 2025</p>
        <p className="text-4xl font-black">{d25.spm_value}</p>
        <p className="text-violet-200 text-xs mt-2">Indeks SPM {d25.tahun || "Kab. Bandung"}</p>
      </div>
      <div className={`rounded-2xl p-5 text-white shadow-lg ${delta >= 0 ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-red-600 to-red-700"}`}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">📊 Perubahan</p>
        <p className="text-4xl font-black flex items-center gap-2">
          {delta >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
        </p>
        <p className="text-white/70 text-xs mt-2">{delta >= 0 ? "Meningkat" : "Menurun"} dari 2024 ke 2025</p>
      </div>
    </div>
  );
}