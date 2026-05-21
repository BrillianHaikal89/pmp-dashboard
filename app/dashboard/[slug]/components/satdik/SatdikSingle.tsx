// components/satdik/SatdikSingle.tsx
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, School, AlertTriangle, Filter } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Badge } from "../common/Badge";
import { KpiCard } from "../common/KpiCard";
import { SatdikRow } from "../../types";

export function SatdikSingle({ data, tahun }: { data: SatdikRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.jenis))).filter(Boolean).sort()], [data]);
  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kecamatan))).filter(Boolean).sort()], [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis === filterJenis);
    if (filterKecamatan !== "Semua") r = r.filter(d => d.kecamatan === filterKecamatan);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()) || d.npsn?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [data, filterJenis, filterKecamatan, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8"];
  const distLit = ["Baik", "Sedang", "Kurang", "Capaian Tidak Tersedia"].map(l => ({ name: l, value: data.filter(d => d.label_literasi === l).length })).filter(d => d.value > 0);
  const distNum = ["Baik", "Sedang", "Kurang", "Capaian Tidak Tersedia"].map(l => ({ name: l, value: data.filter(d => d.label_numerasi === l).length })).filter(d => d.value > 0);
  const belowStd = data.filter(d => d.label_literasi === "Kurang" || d.label_numerasi === "Kurang").length;
  const accentColor = tahun === "2025" ? "bg-violet-500" : "bg-blue-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Capaian Satuan Pendidikan</h1><p className="text-slate-500 text-sm mt-1">Dasmen &amp; Vokasi — Tahun {tahun}</p></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Satdik" value={data.length} sub="Dalam database" icon={School} color={accentColor} />
        <KpiCard title="Di Bawah Standar" value={belowStd} sub="Literasi/Numerasi Kurang" icon={AlertTriangle} color="bg-red-500" />
        <KpiCard title="Jenis Satdik" value={jenisOptions.length - 1} sub="Kategori berbeda" icon={Filter} color="bg-amber-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 text-sm">Distribusi Literasi</h3><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={distLit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>{distLit.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 text-sm">Distribusi Numerasi</h3><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={distNum} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>{distNum.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3"><div className="relative flex-1 min-w-[180px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cari nama, kecamatan, NPSN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>{jenisOptions.map(j => <option key={j}>{j}</option>)}</select><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterKecamatan} onChange={e => { setFilterKecamatan(e.target.value); setPage(1); }}>{kecOptions.map(k => <option key={k}>{k}</option>)}</select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">NPSN</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Nama Sekolah</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Jenis</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Kecamatan</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Literasi</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Numerasi</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Karakter</th></tr></thead>
            <tbody>{paged.map((row, i) => (<tr key={i} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-3 px-3 font-mono text-xs text-slate-500">{row.npsn}</td><td className="py-3 px-3 text-xs font-semibold text-slate-800 max-w-[170px] truncate">{row.nama}</td><td className="py-3 px-3 text-xs text-slate-500">{row.jenis}</td><td className="py-3 px-3 text-xs text-slate-600">{row.kecamatan}</td><td className="py-3 px-3"><Badge label={row.label_literasi ?? ""} /></td><td className="py-3 px-3"><Badge label={row.label_numerasi ?? ""} /></td><td className="py-3 px-3"><Badge label={row.label_karakter ?? ""} /></td></tr>))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
  );
}