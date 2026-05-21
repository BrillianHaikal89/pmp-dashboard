// components/satdik/SatdikBanding.tsx
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "../common/Badge";
import { TrendBadge } from "../common/TrendBadge";
import { SatdikRow } from "../../types";
import { getLabelScore } from "../../utils/helpers";

export function SatdikBanding({ d24, d25 }: { d24: SatdikRow[]; d25: SatdikRow[] }) {
  const [filterKec, setFilterKec] = useState("Semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set([...d24, ...d25].map(d => d.kecamatan))).filter(Boolean).sort()], [d24, d25]);
  const map25 = useMemo(() => { const m: Record<string, SatdikRow> = {}; d25.forEach(r => { m[r.npsn] = r; }); return m; }, [d25]);

  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.npsn] ?? null }));
    if (filterKec !== "Semua") r = r.filter(d => d.kecamatan === filterKec);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterKec, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const improved = merged.filter(r => getLabelScore(r.r25?.label_literasi ?? "") > getLabelScore(r.label_literasi ?? "")).length;
  const declined = merged.filter(r => getLabelScore(r.r25?.label_literasi ?? "") < getLabelScore(r.label_literasi ?? "")).length;
  const same = merged.filter(r => r.r25 && getLabelScore(r.r25.label_literasi ?? "") === getLabelScore(r.label_literasi ?? "")).length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Perbandingan Satdik 2024 vs 2025</h1><p className="text-slate-500 text-sm mt-1">Perubahan capaian per satuan pendidikan</p></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center"><CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" /><p className="text-3xl font-black text-emerald-700">{improved}</p><p className="text-xs font-semibold text-emerald-600 mt-1">Meningkat</p></div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center"><Minus size={24} className="text-slate-400 mx-auto mb-2" /><p className="text-3xl font-black text-slate-600">{same}</p><p className="text-xs font-semibold text-slate-500 mt-1">Tidak Berubah</p></div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center"><XCircle size={24} className="text-red-400 mx-auto mb-2" /><p className="text-3xl font-black text-red-600">{declined}</p><p className="text-xs font-semibold text-red-500 mt-1">Menurun</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3"><div className="relative flex-1 min-w-[180px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Cari nama sekolah atau kecamatan..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterKec} onChange={e => { setFilterKec(e.target.value); setPage(1); }}>{kecOptions.map(k => <option key={k}>{k}</option>)}</select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">NPSN</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Nama</th><th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Kecamatan</th><th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Literasi 2024</th><th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Literasi 2025</th><th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Numerasi 2024</th><th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Numerasi 2025</th><th className="text-left py-3 px-3 text-xs font-bold text-rose-500">Tren</th></tr></thead>
            <tbody>{paged.map((row, i) => (<tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 ${!row.r25 ? "opacity-50" : ""}`}><td className="py-2.5 px-3 font-mono text-xs text-slate-400">{row.npsn}</td><td className="py-2.5 px-3 text-xs font-semibold text-slate-800 max-w-[160px] truncate">{row.nama}</td><td className="py-2.5 px-3 text-xs text-slate-500">{row.kecamatan}</td><td className="py-2.5 px-3"><Badge label={row.label_literasi ?? ""} /></td><td className="py-2.5 px-3">{row.r25 ? <Badge label={row.r25.label_literasi ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td><td className="py-2.5 px-3"><Badge label={row.label_numerasi ?? ""} /></td><td className="py-2.5 px-3">{row.r25 ? <Badge label={row.r25.label_numerasi ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td><td className="py-2.5 px-3">{row.r25 ? <TrendBadge val24={row.label_literasi} val25={row.r25.label_literasi} /> : null}</td></tr>))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
  );
}