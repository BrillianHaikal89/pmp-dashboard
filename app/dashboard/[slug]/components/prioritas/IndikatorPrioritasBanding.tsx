// components/prioritas/IndikatorPrioritasBanding.tsx
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { SatdikTrenRekap } from "./SatdikTrenRekap";
import { LabelDistCard } from "./LabelDistCard";
import { IndikatorPrioritasRow, SatdikTrenRow } from "../../types";
import { getLabelDistPerIndikator, sortIndikatorKeys } from "../../utils/helpers";

export function IndikatorPrioritasBanding({ d24, d25, satdik24, satdik25 }: { 
  d24: IndikatorPrioritasRow[]; 
  d25: IndikatorPrioritasRow[]; 
  satdik24?: { total: number; data: SatdikTrenRow[] } | null; 
  satdik25?: { total: number; data: SatdikTrenRow[] } | null 
}) {
  const [search, setSearch] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const jenjangOptions = useMemo(() => ["Semua", ...Array.from(new Set([...d24, ...d25].map(d => d.status))).filter(Boolean).sort()], [d24, d25]);

  const map25 = useMemo(() => {
    const m: Record<string, IndikatorPrioritasRow> = {};
    d25.forEach(r => { m[r.no + "__" + r.status] = r; });
    return m;
  }, [d25]);

  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.no + "__" + row.status] ?? null }));
    if (filterJenjang !== "Semua") r = r.filter(d => d.status === filterJenjang);
    if (search) r = r.filter(d => d.no.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterJenjang, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const jenjangList = jenjangOptions.filter(j => j !== "Semua");
  const jenjangChart = jenjangList.map((j, idx) => ({
    name: j.length > 14 ? j.slice(0, 12) + "…" : j,
    naik24: d24.filter(d => d.status === j && d.delta?.toLowerCase().startsWith("naik")).length,
    naik25: d25.filter(d => d.status === j && d.delta?.toLowerCase().startsWith("naik")).length,
  }));

  const renderJenjangOptions = useMemo(() => {
    return jenjangOptions.map((j, idx) => (
      <option key={`jenjang-band-opt-${idx}`} value={j}>
        {j}
      </option>
    ));
  }, [jenjangOptions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perbandingan Indikator Prioritas</h1>
        <p className="text-slate-500 text-sm mt-1">2024 vs 2025 — Tren delta per indikator prioritas</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <GitCompare size={16} className="text-rose-500" /> 
          Jumlah Naik per Jenjang (2024 vs 2025)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={jenjangChart} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="naik24" name="Naik 2024" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="naik25" name="Naik 2025" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {(satdik24 || satdik25) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <SatdikTrenRekap satdikTren={satdik24 ?? null} tahun="2024" compact />
          <SatdikTrenRekap satdikTren={satdik25 ?? null} tahun="2025" compact />
        </div>
      )}

      {satdik24 && (() => {
        const labelDist = getLabelDistPerIndikator(satdik24);
        const indKeys = sortIndikatorKeys(Object.keys(labelDist));
        if (!indKeys.length) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-900">Distribusi Label per Indikator</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">2024</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {indKeys.map((key, idx) => (
                <LabelDistCard key={`label-dist-24-${idx}`} indikatorKey={key} dist={labelDist[key]} tahun="2024" />
              ))}
            </div>
          </div>
        );
      })()}

      {satdik25 && (() => {
        const labelDist = getLabelDistPerIndikator(satdik25);
        const indKeys = sortIndikatorKeys(Object.keys(labelDist));
        if (!indKeys.length) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-900">Distribusi Label per Indikator</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">2025</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {indKeys.map((key, idx) => (
                <LabelDistCard key={`label-dist-25-${idx}`} indikatorKey={key} dist={labelDist[key]} tahun="2025" />
              ))}
            </div>
          </div>
        );
      })()}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400" 
              placeholder="Cari kode..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          <select 
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" 
            value={filterJenjang} 
            onChange={e => { setFilterJenjang(e.target.value); setPage(1); }}
          >
            {renderJenjangOptions}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">No</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Jenjang</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Nilai 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Delta 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Nilai 2025</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Delta 2025</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                const r25 = row.r25;
                const isNaik24 = row.delta?.toLowerCase().startsWith("naik");
                const isTurun24 = row.delta?.toLowerCase().startsWith("turun");
                const isNaik25 = r25?.delta?.toLowerCase().startsWith("naik");
                const isTurun25 = r25?.delta?.toLowerCase().startsWith("turun");
                return (
                  <tr key={`band-row-${idx}-${row.no}`} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-600">{row.status}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700 text-sm">{row.nilai_24 || "—"}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isNaik24 ? "text-emerald-600" : isTurun24 ? "text-red-500" : "text-slate-400"}`}>
                        {isNaik24 ? <TrendingUp size={11} /> : isTurun24 ? <TrendingDown size={11} /> : <Minus size={11} />}
                        {row.delta || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-violet-700 text-sm">{r25?.nilai_25 || "—"}</td>
                    <td className="py-2.5 px-3">
                      {r25 ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isNaik25 ? "text-emerald-600" : isTurun25 ? "text-red-500" : "text-slate-400"}`}>
                          {isNaik25 ? <TrendingUp size={11} /> : isTurun25 ? <TrendingDown size={11} /> : <Minus size={11} />}
                          {r25.delta || "—"}
                        </span>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}