// components/kabkot/KabkotSingle.tsx
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Badge } from "../common/Badge";
import { KpiCard } from "../common/KpiCard";
import { KabkotRow } from "../../types";

export function KabkotSingle({ data, tahun }: { data: KabkotRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterLabel, setFilterLabel] = useState("Semua");
  const [sortCol, setSortCol] = useState("nilai_2024_num");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.jenis_satdik))).filter(Boolean)], [data]);
  const labelOptions = ["Semua", "Baik", "Sedang", "Kurang", "Rendah", "Tinggi", "Di atas", "Mencapai", "Di bawah", "Jauh di bawah"];

  const filtered = useMemo(() => {
    let r = data;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis_satdik === filterJenis);
    if (filterLabel !== "Semua") r = r.filter(d => d.label_2024 === filterLabel);
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => {
      const va = (a as any)[sortCol] ?? -Infinity, vb = (b as any)[sortCol] ?? -Infinity;
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [data, filterJenis, filterLabel, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const withVal = data.filter(d => d.nilai_2024_num != null);
  const vals = withVal.map(d => d.nilai_2024_num as number);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "-";
  const max = vals.length ? Math.max(...vals).toFixed(2) : "-";
  const min = vals.length ? Math.min(...vals).toFixed(2) : "-";
  const top10 = [...withVal].sort((a, b) => (b.nilai_2024_num ?? 0) - (a.nilai_2024_num ?? 0)).slice(0, 10);
  const bottom10 = [...withVal].sort((a, b) => (a.nilai_2024_num ?? 0) - (b.nilai_2024_num ?? 0)).slice(0, 10);
  const accentBar = tahun === "2025" ? "#7c3aed" : "#3b82f6";

  const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } setPage(1); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Capaian Kab/Kota</h1><p className="text-slate-500 text-sm mt-1">Seluruh indikator capaian per jenjang — Tahun {tahun}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Rata-rata Nilai" value={avg} sub="Semua indikator" icon={Target} color={tahun === "2025" ? "bg-violet-500" : "bg-blue-500"} />
        <KpiCard title="Nilai Tertinggi" value={max} sub="Capaian terbaik" icon={TrendingUp} color="bg-emerald-500" />
        <KpiCard title="Nilai Terendah" value={min} sub="Perlu perhatian" icon={TrendingDown} color="bg-red-500" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Top 10</h3><ResponsiveContainer width="100%" height={260}><BarChart data={top10} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" /><YAxis type="category" dataKey="no" width={55} /><Tooltip /><Bar dataKey="nilai_2024_num" radius={[0, 4, 4, 0]}>{top10.map((_, i) => <Cell key={i} fill={accentBar} />)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingDown size={16} className="text-red-500" /> Bottom 10</h3><ResponsiveContainer width="100%" height={260}><BarChart data={bottom10} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" /><YAxis type="category" dataKey="no" width={55} /><Tooltip /><Bar dataKey="nilai_2024_num" radius={[0, 4, 4, 0]}>{bottom10.map((_, i) => <Cell key={i} fill="#ef4444" />)}</Bar></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Cari indikator..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>{jenisOptions.slice(0, 15).map(j => <option key={j}>{j}</option>)}</select>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterLabel} onChange={e => { setFilterLabel(e.target.value); setPage(1); }}>{labelOptions.map(l => <option key={l}>{l}</option>)}</select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">{["Kode", "Jenjang", "Indikator", "Label", `Nilai ${tahun}`, `Nilai ${+tahun - 1}`, "Perubahan"].map(col => (<th key={col} className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase cursor-pointer">{col}</th>))}</tr></thead>
            <tbody>{paged.map((row, i) => {
              const p = row.perubahan ?? "";
              const isNaik = p.toLowerCase().startsWith("naik");
              const isTurun = p.toLowerCase().startsWith("turun");
              return (<tr key={i} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-3 px-3 font-mono text-xs text-slate-600 font-bold">{row.no}</td><td className="py-3 px-3 text-xs text-slate-600">{row.jenis_satdik}</td><td className="py-3 px-3 text-xs text-slate-700 max-w-xs truncate">{row.indikator_short}</td><td className="py-3 px-3"><Badge label={row.label_2024 ?? ""} /></td><td className="py-3 px-3 font-bold text-slate-900">{row.nilai_2024_num?.toFixed(2) ?? "-"}</td><td className="py-3 px-3 text-slate-600">{row.nilai_2023_num?.toFixed(2) ?? "-"}</td><td className="py-3 px-3"><span className={`flex items-center gap-1 text-xs font-semibold ${isNaik ? "text-emerald-600" : isTurun ? "text-red-500" : "text-slate-400"}`}>{isNaik ? <TrendingUp size={12} /> : isTurun ? <TrendingDown size={12} /> : <Minus size={12} />}{p || "—"}</span></td></tr>);
            })}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
  );
}