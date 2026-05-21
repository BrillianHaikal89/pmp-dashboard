// components/common/KpiCard.tsx
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: string;
  accent?: string;
}

export function KpiCard({ title, value, sub, icon: Icon, color, accent }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4 ${accent ?? "border-slate-100"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}