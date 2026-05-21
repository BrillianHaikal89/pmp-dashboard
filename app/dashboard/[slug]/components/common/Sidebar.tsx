// components/common/Sidebar.tsx
import { LayoutDashboard, MapPin, School, Baby, AlertTriangle, CheckCircle, BarChart3, ChevronLeft, Calendar, GitCompare } from "lucide-react";
import { TahunFilter } from "../../types";
import { MENU } from "../../utils/constants";

export function Sidebar({ active, setActive, open, setOpen, tahun, wilayahNama }: {
  active: string; setActive: (s: string) => void; open: boolean; setOpen: (b: boolean) => void; tahun: TahunFilter; wilayahNama: string;
}) {
  const tahunColor = "from-slate-900 to-slate-800";
  const activeColor = "bg-blue-600";
  
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      LayoutDashboard, MapPin, School, Baby, AlertTriangle, CheckCircle, BarChart3
    };
    return icons[iconName] || LayoutDashboard;
  };
  
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b ${tahunColor} z-30 flex flex-col shadow-2xl transition-all duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-400">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-tight">JAWA <span className="text-amber-300">BARAT</span></p>
              <p className="text-white/50 text-xs">{wilayahNama}</p>
            </div>
          </div>
        </div>

        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-white/10 border border-white/10">
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Mode Aktif</p>
          <p className="text-white text-xs font-bold flex items-center gap-1.5">
            {tahun === "banding" ? <><GitCompare size={12} className="text-rose-300" />Perbandingan 2024 vs 2025</>
              : <><Calendar size={12} className={tahun === "2025" ? "text-violet-300" : "text-blue-300"} />Tahun {tahun}</>}
          </p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {MENU.map(({ id, label, icon: iconName }) => {
            const Icon = getIcon(iconName);
            return (
              <button key={id} onClick={() => { setActive(id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active === id ? `${activeColor} text-white shadow-lg` : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                <Icon size={16} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pb-2">
          <a href="/pilih-wilayah" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <ChevronLeft size={16} />Pilih Wilayah
          </a>
        </div>
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-white/30 text-[10px]">Data: 2024 & 2025</p>
        </div>
      </aside>
    </>
  );
}