// components/prioritas/LabelDistCard.tsx
import { useState } from "react";
import { CheckCircle, XCircle, Minus } from "lucide-react";
import { SatdikTrenRow } from "../../types";
import { INDIKATOR_INFO } from "../../utils/constants";
import { SekolahLabelModal } from "./SekolahLabelModal";

interface LabelDistCardProps {
  indikatorKey: string;
  dist: { baik: SatdikTrenRow[]; sedang: SatdikTrenRow[]; kurang: SatdikTrenRow[]; total: number };
  tahun?: string;
}

export function LabelDistCard({ indikatorKey, dist, tahun }: LabelDistCardProps) {
  const [modal, setModal] = useState<{ label: string; sekolah: SatdikTrenRow[] } | null>(null);
  const { baik, sedang, kurang, total } = dist;
  const pctBaik = total > 0 ? (baik.length / total) * 100 : 0;
  const pctSedang = total > 0 ? (sedang.length / total) * 100 : 0;
  const pctKurang = total > 0 ? (kurang.length / total) * 100 : 0;

  const accentBorder = tahun === "2025" ? "border-violet-100" : "border-blue-100";
  const info = INDIKATOR_INFO[indikatorKey];

  return (
    <>
      {modal && (
        <SekolahLabelModal
          indikator={indikatorKey}
          label={modal.label}
          sekolah={modal.sekolah}
          onClose={() => setModal(null)}
        />
      )}
      <div className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow ${accentBorder}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm font-mono ${tahun === "2025" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
            {indikatorKey}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 text-sm leading-tight">{info?.nama ?? indikatorKey}</p>
            {info?.deskripsi && <p className="text-xs text-slate-400 mt-0.5 leading-snug">{info.deskripsi}</p>}
          </div>
          <span className="text-xs text-slate-400 font-semibold flex-shrink-0">{total} sekolah</span>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden flex">
          <div className="bg-emerald-400 h-full transition-all" style={{ width: `${pctBaik}%` }} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${pctSedang}%` }} />
          <div className="bg-red-400 h-full transition-all" style={{ width: `${pctKurang}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setModal({ label: "Baik", sekolah: baik })}
            className="group flex flex-col items-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-3 transition-all cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95">
            <span className="text-3xl font-black text-emerald-700 leading-none">{pctBaik.toFixed(0)}<span className="text-lg">%</span></span>
            <span className="text-[11px] font-bold text-emerald-600 mt-1">Baik</span>
            <span className="text-[10px] text-emerald-400 mt-0.5">{baik.length} sekolah</span>
          </button>
          <button onClick={() => setModal({ label: "Sedang", sekolah: sedang })}
            className="group flex flex-col items-center bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl p-3 transition-all cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95">
            <span className="text-3xl font-black text-amber-700 leading-none">{pctSedang.toFixed(0)}<span className="text-lg">%</span></span>
            <span className="text-[11px] font-bold text-amber-600 mt-1">Sedang</span>
            <span className="text-[10px] text-amber-400 mt-0.5">{sedang.length} sekolah</span>
          </button>
          <button onClick={() => setModal({ label: "Kurang", sekolah: kurang })}
            className="group flex flex-col items-center bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-3 transition-all cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95">
            <span className="text-3xl font-black text-red-700 leading-none">{pctKurang.toFixed(0)}<span className="text-lg">%</span></span>
            <span className="text-[11px] font-bold text-red-600 mt-1">Kurang</span>
            <span className="text-[10px] text-red-400 mt-0.5">{kurang.length} sekolah</span>
          </button>
        </div>
      </div>
    </>
  );
}