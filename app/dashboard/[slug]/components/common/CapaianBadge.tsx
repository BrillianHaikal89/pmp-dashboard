// components/common/CapaianBadge.tsx
import { CheckCircle, XCircle, Minus } from "lucide-react";
import { capaianStatusFn } from "../../utils/helpers";

export function CapaianBadge({ status }: { status?: string }) {
  if (!status || status === "Data Tidak Tersedia") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">
        <Minus size={11} />Data Tidak Tersedia
      </span>
    );
  }
  if (status === "Meningkat Sesuai Standar") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500 text-white shadow-sm">
        <CheckCircle size={11} />Meningkat Sesuai Standar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-400 text-white shadow-sm">
      <XCircle size={11} />Belum Meningkat Sesuai Standar
    </span>
  );
}