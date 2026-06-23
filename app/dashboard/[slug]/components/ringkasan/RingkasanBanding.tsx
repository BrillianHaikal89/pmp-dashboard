// components/ringkasan/RingkasanBanding.tsx
import { Layers, School, TrendingUp, Award, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SpmCompare } from "../common/SpmCompare";
import { DashData } from "../../types";

export function RingkasanBanding({ d24, d25 }: { d24: DashData; d25: DashData }) {
  const spm24 = parseFloat((d24.spm_value ?? "0").replace(",", ".")) || 0;
  const spm25 = parseFloat((d25.spm_value ?? "0").replace(",", ".")) || 0;

  const buildMap = (data: DashData) => {
    const m: Record<string, any> = {};
    data.ringkasan?.forEach((r: any) => {
      const j = r.jenjang; if (!j) return;
      if (!m[j]) m[j] = {};
      if (r.capaian === "Capaian Terbaik") m[j].capaian_terbaik = r.indikator;
      if (r.capaian === "Capaian Terendah") m[j].capaian_terendah = r.indikator;
      if (r.capaian === "Peningkatan Tertinggi") m[j].peningkatan = r.indikator;
    });
    return m;
  };
  
  const map24 = buildMap(d24);
  const map25 = buildMap(d25);
  const allJenjang = Array.from(new Set([...Object.keys(map24), ...Object.keys(map25)]));

  const spmChartData = [
    { name: "2024", value: spm24, fill: "#3b82f6" },
    { name: "2025", value: spm25, fill: "#7c3aed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perbandingan 2024 vs 2025</h1>
        <p className="text-slate-500 text-sm mt-1">Analisis perubahan antar tahun</p>
      </div>

      <SpmCompare d24={d24} d25={d25} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Layers size={16} className="text-rose-500" /> Perbandingan Indeks SPM</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={spmChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 700 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => v + "%"} />
            <Tooltip formatter={(v: any) => [v.toFixed(2), "Indeks SPM"]} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} label={{ position: "top", fontSize: 13, fontWeight: "bold" }}>
              {spmChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Detail Perbandingan per Jenjang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allJenjang.map(jenjang => {
            const i24 = map24[jenjang] ?? {};
            const i25 = map25[jenjang] ?? {};
            return (
              <div key={jenjang} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <School size={15} className="text-rose-500" />
                  <h3 className="font-bold text-slate-900 text-sm">{jenjang}</h3>
                </div>
                <div className="space-y-3">
                  {["peningkatan", "capaian_terbaik", "capaian_terendah"].map(key => {
                    const label = key === "peningkatan" ? "Peningkatan Tertinggi" : key === "capaian_terbaik" ? "Capaian Terbaik" : "Capaian Terendah";
                    const Icon = key === "peningkatan" ? TrendingUp : key === "capaian_terbaik" ? Award : AlertTriangle;
                    const iconColor = key === "peningkatan" ? "text-blue-500" : key === "capaian_terbaik" ? "text-emerald-500" : "text-red-400";
                    if (!i24[key] && !i25[key]) return null;
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-1 mb-1.5"><Icon size={12} className={iconColor} /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                            <p className="text-[9px] font-bold text-blue-400 mb-0.5">2024</p>
                            <p className="text-xs text-blue-800 leading-tight">{i24[key] || "—"}</p>
                          </div>
                          <div className="bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
                            <p className="text-[9px] font-bold text-violet-400 mb-0.5">2025</p>
                            <p className="text-xs text-violet-800 leading-tight">{i25[key] || "—"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}