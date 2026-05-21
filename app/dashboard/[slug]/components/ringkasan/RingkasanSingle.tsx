// components/ringkasan/RingkasanSingle.tsx
import { Award, Target, BookOpen, School, TrendingUp, AlertTriangle } from "lucide-react";
import { KpiCard } from "../common/KpiCard";
import { DashData } from "../../types";

export function RingkasanSingle({ data, tahun }: { data: DashData; tahun: string }) {
  const { spm_value, ringkasan } = data;
  
  const jenjangMap: Record<string, any> = {};
  ringkasan?.forEach((r: any) => {
    const j = r.jenjang;
    if (!j) return;
    if (!jenjangMap[j]) jenjangMap[j] = { capaian_terbaik: "", capaian_terendah: "", peningkatan: "" };
    if (r.capaian === "Capaian Terbaik") jenjangMap[j].capaian_terbaik = r.indikator;
    if (r.capaian === "Capaian Terendah") jenjangMap[j].capaian_terendah = r.indikator;
    if (r.capaian === "Peningkatan Tertinggi") jenjangMap[j].peningkatan = r.indikator;
  });
  
  const jenjangList = Object.entries(jenjangMap);
  const gradColor = tahun === "2025" ? "from-violet-600 to-violet-700" : "from-blue-600 to-blue-700";
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ringkasan Capaian Jenjang</h1>
        <p className="text-slate-500 text-sm mt-1">{data.tahun || "Kab. Bandung"} — Tahun {tahun}</p>
      </div>
      
      <div className={`bg-gradient-to-r ${gradColor} rounded-2xl p-6 text-white shadow-lg`}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Indeks SPM {tahun}</p>
        <p className="text-5xl font-black">{spm_value}</p>
        <p className="text-white/70 text-sm mt-2">Berdasarkan agregasi seluruh indikator per jenjang kewenangan</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Jenjang" value={jenjangList.length} sub="Jenjang pendidikan" icon={Target} color={tahun === "2025" ? "bg-violet-500" : "bg-blue-500"} />
        <KpiCard title="Indikator Dipantau" value={ringkasan?.length ?? 0} sub="Indikator aktif" icon={Award} color="bg-emerald-500" />
        <KpiCard title="Tahun Laporan" value={tahun} sub="Rapor Pendidikan" icon={BookOpen} color="bg-amber-500" />
      </div>
      
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Detail per Jenjang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jenjangList.map(([jenjang, info]) => (
            <div key={jenjang} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tahun === "2025" ? "bg-violet-50" : "bg-blue-50"}`}>
                  <School size={16} className={tahun === "2025" ? "text-violet-600" : "text-blue-600"} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{jenjang}</h3>
              </div>
              <div className="space-y-2">
                {info.peningkatan && (
                  <div className="flex gap-2">
                    <TrendingUp size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Peningkatan Tertinggi</p>
                      <p className="text-xs text-slate-700">{info.peningkatan}</p>
                    </div>
                  </div>
                )}
                {info.capaian_terbaik && (
                  <div className="flex gap-2">
                    <Award size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Capaian Terbaik</p>
                      <p className="text-xs text-slate-700">{info.capaian_terbaik}</p>
                    </div>
                  </div>
                )}
                {info.capaian_terendah && (
                  <div className="flex gap-2">
                    <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Capaian Terendah</p>
                      <p className="text-xs text-slate-700">{info.capaian_terendah}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}