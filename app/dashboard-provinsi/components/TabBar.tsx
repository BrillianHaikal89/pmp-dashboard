import React from "react";
import { BookMarked, BarChart3, PieChart, MapPin, Layers, School, GraduationCap } from "lucide-react";

export type TabId = "ringkasan" | "provinsi" | "grafik-kabkot" | "kabkot-dasmen" | "kabkot-paud" | "satdik-dasmen" | "satdik-paud";

export const TABS: { id: TabId; short: string; icon: React.ReactNode; activeColor: string; activeBorder: string; activeBg: string }[] = [
  { id: "ringkasan",     short: "Ringkasan",           icon: <BookMarked size={14} />, activeColor: "text-emerald-700", activeBorder: "border-emerald-500", activeBg: "bg-emerald-50" },
  { id: "provinsi",      short: "Indikator Prioritas", icon: <BarChart3 size={14} />,  activeColor: "text-blue-700",    activeBorder: "border-blue-500",    activeBg: "bg-blue-50" },
  { id: "grafik-kabkot", short: "Grafik Kab/Kota",    icon: <PieChart size={14} />,   activeColor: "text-cyan-700",    activeBorder: "border-cyan-500",    activeBg: "bg-cyan-50" },
  { id: "kabkot-dasmen", short: "Kab/Kota Dasmen",    icon: <MapPin size={14} />,     activeColor: "text-purple-700",  activeBorder: "border-purple-500",  activeBg: "bg-purple-50" },
  { id: "kabkot-paud",   short: "Kab/Kota PAUD",      icon: <Layers size={14} />,     activeColor: "text-pink-700",    activeBorder: "border-pink-500",    activeBg: "bg-pink-50" },
  { id: "satdik-dasmen", short: "Satdik Dasmen",      icon: <School size={14} />,     activeColor: "text-orange-700",  activeBorder: "border-orange-500",  activeBg: "bg-orange-50" },
  { id: "satdik-paud",   short: "Satdik PAUD",        icon: <GraduationCap size={14} />, activeColor: "text-teal-700", activeBorder: "border-teal-500",    activeBg: "bg-teal-50" },
];

interface TabBarProps {
  activeTab: TabId;
  isTabSwitching: boolean;
  handleTabChange: (tabId: TabId) => void;
}

export default function TabBar({ activeTab, isTabSwitching, handleTabChange }: TabBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={isTabSwitching}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? `${tab.activeColor} ${tab.activeBorder} ${tab.activeBg}`
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
              } ${isTabSwitching ? "opacity-50 cursor-wait" : ""}`}
            >
              <span className={activeTab === tab.id ? tab.activeColor : "text-slate-400"}>
                {tab.icon}
              </span>
              {tab.short}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
