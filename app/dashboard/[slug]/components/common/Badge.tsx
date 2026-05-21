// components/common/Badge.tsx
import { LABEL_BG } from "../../utils/constants";

export function Badge({ label }: { label: string }) {
  const cls = LABEL_BG[label] ?? "bg-slate-100 text-slate-500 border border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label || "—"}
    </span>
  );
}