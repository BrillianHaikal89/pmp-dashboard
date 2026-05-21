// components/paud/PaudSingle.tsx
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Baby, School, Award } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "../common/Badge";
import { KpiCard } from "../common/KpiCard";
import { PaudRow } from "../../types";

export function PaudSingle({ data, tahun }: { data: PaudRow[]; tahun: string }) {
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

  const inds = [{ key: "label_perencanaan", name: "Perencanaan" }, { key: "label_proses", name: "Proses" }, { key: "label_kemampuan_fondasi", name: "Fondasi" }, { key: "label_sarana", name: "Sarana" }];
  const chartData = inds.map(ind => ({ name: ind.name, baik: data.filter(d => (d as any)[ind.key] === "Baik").length, sedang: data.filter(d => (d as any)[ind.key] === "Sedang").length, kurang: data.filter(d => (d as any)[ind.key] === "Kurang").length }));

  return (
    
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Capaian Satdik PAUD</h1><p className="text-slate-500 text-sm mt-1">Pendidikan Anak Usia Dini — Tahun {tahun}</p></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total PAUD" value={data.length} sub="Satuan terdaftar" icon={Baby} color={tahun === "2025" ? "bg-violet-500" : "bg-pink-500"} />
        <KpiCard title="Jenis PAUD" value={jenisOptions.length - 1} sub="Jenis lembaga" icon={School} color="bg-amber-500" />
        <KpiCard title="Capaian Baik" value={data.filter(d => d.label_perencanaan === "Baik").length} sub="Perencanaan baik" icon={Award} color="bg-emerald-500" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 text-sm">Distribusi Capaian per Indikator PAUD</h3><ResponsiveContainer width="100%" height={240}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="baik" name="Baik" fill="#22c55e" radius={[4, 4, 0, 0]} /><Bar dataKey="sedang" name="Sedang" fill="#f59e0b" radius={[4, 4, 0, 0]} /><Bar dataKey="kurang" name="Kurang" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3"><div className="relative flex-1 min-w-[180px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cari nama, kecamatan, NPSN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>{jenisOptions.map(j => <option key={j}>{j}</option>)}</select><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterKecamatan} onChange={e => { setFilterKecamatan(e.target.value); setPage(1); }}>{kecOptions.map(k => <option key={k}>{k}</option>)}</select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">NPSN</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Nama</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Jenis</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Kecamatan</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Perencanaan</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Proses</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Fondasi</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Sarana</th></tr></thead>
            <tbody>{paged.map((row, i) => (<tr key={i} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-3 px-3 font-mono text-xs text-slate-400">{row.npsn}</td><td className="py-3 px-3 text-xs font-semibold text-slate-800 max-w-[150px] truncate">{row.nama}</td><td className="py-3 px-3 text-xs text-slate-500">{row.jenis}</td><td className="py-3 px-3 text-xs text-slate-600">{row.kecamatan}</td><td className="py-3 px-3"><Badge label={row.label_perencanaan ?? ""} /></td><td className="py-3 px-3"><Badge label={row.label_proses ?? ""} /></td><td className="py-3 px-3"><Badge label={row.label_kemampuan_fondasi ?? ""} /></td><td className="py-3 px-3"><Badge label={row.label_sarana ?? ""} /></td></tr>))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
   
    
  );
}