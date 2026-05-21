// components/common/TrendBadge.tsx
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getLabelScore } from "../../utils/helpers";

export function TrendBadge({ val24, val25 }: { val24: string; val25: string }) {
  const s24 = getLabelScore(val24);
  const s25 = getLabelScore(val25);
  if (!s24 || !s25) return null;
  if (s25 > s24) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
      <TrendingUp size={10} />Naik
    </span>
  );
  if (s25 < s24) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
      <TrendingDown size={10} />Turun
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
      <Minus size={10} />Sama
    </span>
  );
}