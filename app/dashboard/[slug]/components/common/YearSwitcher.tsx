// components/common/YearSwitcher.tsx
import { Calendar, GitCompare } from "lucide-react";
import { TahunFilter } from "../../types";

export function YearSwitcher({ tahun, setTahun }: { tahun: TahunFilter; setTahun: (t: TahunFilter) => void }) {
  const tabs: { id: TahunFilter; label: string; icon: any; color: string }[] = [
    { id: "2024", label: "Tahun 2024", icon: Calendar, color: "bg-blue-600 text-white shadow-blue-200 shadow-md" },
    { id: "2025", label: "Tahun 2025", icon: Calendar, color: "bg-violet-600 text-white shadow-violet-200 shadow-md" },
    { id: "banding", label: "Perbandingan", icon: GitCompare, color: "bg-rose-500 text-white shadow-rose-200 shadow-md" },
  ];
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTahun(t.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${tahun === t.id ? t.color : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}>
          <t.icon size={13} />{t.label}
        </button>
      ))}
    </div>
  );
}