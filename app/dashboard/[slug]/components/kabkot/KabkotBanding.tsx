// components/kabkot/KabkotBanding.tsx
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "../common/Badge";
import { KabkotRow } from "../../types";

export function KabkotBanding({ d24, d25 }: { d24: KabkotRow[]; d25: KabkotRow[] }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const map25 = useMemo(() => { const m: Record<string, KabkotRow> = {}; d25.forEach(r => { m[r.no] = r; }); return m; }, [d25]);
  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(d24.map(d => d.jenis_satdik))).filter(Boolean)], [d24]);

  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.no] ?? null }));
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis_satdik === filterJenis);
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterJenis, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const jenjangSet = Array.from(new Set(d24.map(d => d.jenis_satdik))).filter(Boolean).slice(0, 8);
  const jenjangChart = jenjangSet.map(j => {
    const rows24 = d24.filter(d => d.jenis_satdik === j && d.nilai_2024_num != null);
    const rows25 = d25.filter(d => d.jenis_satdik === j && d.nilai_2024_num != null);
    const avg24 = rows24.length ? +(rows24.reduce((a, b) => a + (b.nilai_2024_num ?? 0), 0) / rows24.length).toFixed(2) : 0;
    const avg25 = rows25.length ? +(rows25.reduce((a, b) => a + (b.nilai_2024_num ?? 0), 0) / rows25.length).toFixed(2) : 0;
    return { name: j.split("/")[0].trim(), avg24, avg25 };
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Perbandingan Capaian Kab/Kota</h1><p className="text-slate-500 text-sm mt-1">2024 vs 2025 — Perubahan nilai per indikator</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><GitCompare size={16} className="text-rose-500" /> Rata-rata per Jenjang</h3><ResponsiveContainer width="100%" height={240}><BarChart data={jenjangChart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend /><Bar dataKey="avg24" name="2024" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Bar dataKey="avg25" name="2025" fill="#7c3aed" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4"><div className="relative flex-1 min-w-[180px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Cari indikator..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>{jenisOptions.slice(0, 15).map(j => <option key={j}>{j}</option>)}</select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Kode</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Indikator</th><th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Label 2024</th><th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Nilai 2024</th><th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Label 2025</th><th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Nilai 2025</th><th className="text-left py-3 px-3 text-xs font-bold text-rose-500">Tren</th></tr></thead>
            <tbody>{paged.map((row, i) => {
              const r25 = row.r25;
              const v24 = row.nilai_2024_num;
              const v25 = r25?.nilai_2024_num ?? null;
              const delta = v24 != null && v25 != null ? v25 - v24 : null;
              return (<tr key={i} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-500">{row.no}</td><td className="py-2.5 px-3 text-xs text-slate-700 max-w-[200px] truncate">{row.indikator_short}</td><td className="py-2.5 px-3"><Badge label={row.label_2024 ?? ""} /></td><td className="py-2.5 px-3 font-bold text-blue-700">{v24?.toFixed(2) ?? "-"}</td><td className="py-2.5 px-3">{r25 ? <Badge label={r25.label_2024 ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td><td className="py-2.5 px-3 font-bold text-violet-700">{v25?.toFixed(2) ?? "-"}</td><td className="py-2.5 px-3">{delta != null ? (<span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${delta > 0 ? "bg-emerald-50 text-emerald-700" : delta < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>{delta > 0 ? <TrendingUp size={10} /> : delta < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}{delta > 0 ? "+" : ""}{delta.toFixed(2)}</span>) : <span className="text-xs text-slate-300">—</span>}</td></tr>);
            })}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
  );
}