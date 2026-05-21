// components/akar/AkarPage.tsx
import { useState, useMemo } from "react";
import { Search, AlertTriangle, Filter, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { KpiCard } from "../common/KpiCard";
import { AkarRow } from "../../types";

export function AkarPage({ data, tahun }: { data: AkarRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");

  const kelompokOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kelompok))).filter(Boolean)], [data]);
  const kategoriOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kategori))).filter(Boolean)], [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (filterKelompok !== "Semua") r = r.filter(d => d.kelompok === filterKelompok);
    if (filterKategori !== "Semua") r = r.filter(d => d.kategori === filterKategori);
    if (search) r = r.filter(d => d.indikator_akar?.toLowerCase().includes(search.toLowerCase()) || d.indikator_prioritas?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [data, filterKelompok, filterKategori, search]);

  const kategoriCount = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(d => { m[d.kategori] = (m[d.kategori] ?? 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name.split(" ")[0], value }));
  }, [data]);

  const accentColor = tahun === "2025" ? "bg-violet-500" : "bg-amber-500";

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Akar Masalah & Pembenahan</h1><p className="text-slate-500 text-sm mt-1">Identifikasi, refleksi, dan rencana pembenahan — {tahun}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Akar Masalah" value={data.length} sub="Dalam database" icon={AlertTriangle} color={accentColor} />
        <KpiCard title="Kelompok Indikator" value={kelompokOptions.length - 1} sub="Kategori berbeda" icon={Filter} color="bg-blue-500" />
        <KpiCard title="Ditampilkan" value={filtered.length} sub="Setelah filter" icon={Target} color="bg-emerald-500" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 text-sm">Distribusi per Kategori</h3><ResponsiveContainer width="100%" height={180}><BarChart data={kategoriCount} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} /><Tooltip /><Bar dataKey="value" name="Jumlah" radius={[0, 4, 4, 0]}>{kategoriCount.map((_, i) => <Cell key={i} fill={["#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"][i % 5]} />)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="flex flex-wrap gap-2"><div className="relative flex-1 min-w-[200px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cari akar masalah atau indikator..." value={search} onChange={e => setSearch(e.target.value)} /></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterKelompok} onChange={e => setFilterKelompok(e.target.value)}>{kelompokOptions.map(k => <option key={k}>{k}</option>)}</select><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>{kategoriOptions.map(k => <option key={k}>{k}</option>)}</select></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filtered.map((item, i) => (<div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md"><div className="flex flex-wrap gap-2"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{item.kategori}</span>{item.no_akar && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{item.no_akar}</span>}</div>{item.indikator_prioritas && <p className="text-xs font-bold text-slate-800 border-l-4 border-blue-400 pl-3">{item.indikator_prioritas}</p>}<div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Akar Masalah</p><p className="text-sm text-slate-800 font-semibold">{item.indikator_akar}</p></div>{item.mengapa && <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Mengapa</p><p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.mengapa}</p></div>}<div><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{item.kelompok}</span></div></div>))}</div>
      {filtered.length === 0 && <div className="text-center py-16 text-slate-400"><AlertTriangle size={36} className="mx-auto mb-3 opacity-30" /><p>Tidak ada data yang sesuai filter</p></div>}
    </div>
  );
}