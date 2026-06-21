// components/paud/PaudBanding.tsx
import { Fragment, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Minus, GitCompare } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "../common/Badge";
import { TrendBadge } from "../common/TrendBadge";
import { PaudRow } from "../../types";
import { getLabelScore } from "../../utils/helpers";

// ── Indikator yang ditampilkan: hanya D2, D3, D6 ───────────────────────────
const INDIKATOR = [
  { key: "label_d2", code: "D2" },
  { key: "label_d3", code: "D3" },
  { key: "label_d6", code: "D6" },
] as const;

export function PaudBanding({ d24, d25 }: { d24: PaudRow[]; d25: PaudRow[] }) {
  const [filterKec, setFilterKec] = useState("Semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set([...d24, ...d25].map(d => d.kecamatan))).filter(Boolean).sort()], [d24, d25]);
  const map25 = useMemo(() => { const m: Record<string, PaudRow> = {}; d25.forEach(r => { m[r.npsn] = r; }); return m; }, [d25]);

  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.npsn] ?? null }));
    if (filterKec !== "Semua") r = r.filter(d => d.kecamatan === filterKec);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterKec, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Ringkasan tren dihitung dari gabungan ketiga indikator (D2, D3, D6)
  const improved = merged.filter(r => r.r25 && INDIKATOR.some(ind => getLabelScore((r.r25 as any)[ind.key] ?? "") > getLabelScore((r as any)[ind.key] ?? ""))).length;
  const declined = merged.filter(r => r.r25 && INDIKATOR.some(ind => getLabelScore((r.r25 as any)[ind.key] ?? "") < getLabelScore((r as any)[ind.key] ?? ""))).length;
  const same = merged.filter(r => r.r25 && INDIKATOR.every(ind => getLabelScore((r.r25 as any)[ind.key] ?? "") === getLabelScore((r as any)[ind.key] ?? ""))).length;

  const cmpChart = INDIKATOR.map(ind => ({
    name: ind.code,
    baik24: d24.filter(d => (d as any)[ind.key] === "Baik").length,
    baik25: d25.filter(d => (d as any)[ind.key] === "Baik").length,
  }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Perbandingan PAUD 2024 vs 2025</h1><p className="text-slate-500 text-sm mt-1">Perubahan capaian per satuan PAUD — Indikator D2, D3, D6</p></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center"><CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" /><p className="text-3xl font-black text-emerald-700">{improved}</p><p className="text-xs font-semibold text-emerald-600 mt-1">Meningkat</p></div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center"><Minus size={24} className="text-slate-400 mx-auto mb-2" /><p className="text-3xl font-black text-slate-600">{same}</p><p className="text-xs font-semibold text-slate-500 mt-1">Tidak Berubah</p></div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center"><XCircle size={24} className="text-red-400 mx-auto mb-2" /><p className="text-3xl font-black text-red-600">{declined}</p><p className="text-xs font-semibold text-red-500 mt-1">Menurun</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 text-sm flex items-center gap-2"><GitCompare size={15} className="text-rose-500" /> Jumlah Capaian Baik per Indikator</h3><ResponsiveContainer width="100%" height={200}><BarChart data={cmpChart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="baik24" name="Baik 2024" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Bar dataKey="baik25" name="Baik 2025" fill="#7c3aed" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3"><div className="relative flex-1 min-w-[180px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Cari nama atau kecamatan..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterKec} onChange={e => { setFilterKec(e.target.value); setPage(1); }}>{kecOptions.map(k => <option key={k}>{k}</option>)}</select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">NPSN</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">Nama</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">Kecamatan</th>
                {INDIKATOR.map((ind, idx) => (
                  <th key={ind.code} colSpan={2} className={`text-center py-1.5 px-3 text-[10px] font-bold text-rose-500 uppercase tracking-wide border-l border-slate-100`}>{ind.code}</th>
                ))}
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-rose-500 align-bottom border-l border-slate-100">Tren</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-100">
                {INDIKATOR.map(ind => (
                  <Fragment key={ind.code}>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-blue-400 border-l border-slate-100">2024</th>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-violet-400">2025</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 ${!row.r25 ? "opacity-50" : ""}`}>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{row.npsn}</td>
                  <td className="py-2.5 px-3 text-xs font-semibold text-slate-800 max-w-[150px] truncate">{row.nama}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">{row.kecamatan}</td>
                  {INDIKATOR.map(ind => (
                    <Fragment key={ind.code}>
                      <td className="py-2.5 px-3 border-l border-slate-100"><Badge label={(row as any)[ind.key] ?? ""} /></td>
                      <td className="py-2.5 px-3">{row.r25 ? <Badge label={(row.r25 as any)[ind.key] ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td>
                    </Fragment>
                  ))}
                  <td className="py-2.5 px-3 border-l border-slate-100">
                    {row.r25 ? <TrendBadge val24={(row as any).label_d2} val25={(row.r25 as any).label_d2} /> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
  );
}