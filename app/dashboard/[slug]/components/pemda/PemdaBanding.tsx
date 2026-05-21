// components/pemda/PemdaBanding.tsx
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, CheckCircle, GitCompare } from "lucide-react";
import { CapaianBadge } from "../common/CapaianBadge";
import { DashData, KabkotRow } from "../../types";
import { capaianStatusFn } from "../../utils/helpers";

export function PemdaBanding({ d24, d25 }: { d24: DashData; d25: DashData }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const spm24 = d24.spm_nilai_num ?? null;
  const spm25 = d25.spm_nilai_num ?? null;
  const delta = spm24 != null && spm25 != null ? spm25 - spm24 : null;

  const rows24 = d24.kabkot ?? [];
  const rows25 = d25.kabkot ?? [];

  const map25 = useMemo(() => { const m: Record<string, KabkotRow> = {}; rows25.forEach(r => { m[r.no] = r; }); return m; }, [rows25]);

  const combined = useMemo(() => {
    let r = rows24.map(row => ({ ...row, r25: map25[row.no] ?? null }));
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [rows24, map25, search]);

  const totalPages = Math.max(1, Math.ceil(combined.length / PAGE_SIZE));
  const paged = combined.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CheckCircle size={22} className="text-emerald-500" />Perbandingan Capaian Mutu SPM 2024 vs 2025</h1></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg"><p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">SPM 2024</p><p className="text-4xl font-black mb-3">{d24.spm_value ?? "—"}</p><CapaianBadge status={d24.capaian_status ?? capaianStatusFn(spm24)} /></div>
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg"><p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">SPM 2025</p><p className="text-4xl font-black mb-3">{d25.spm_value ?? "—"}</p><CapaianBadge status={d25.capaian_status ?? capaianStatusFn(spm25)} /></div>
        <div className={`rounded-2xl p-5 text-white shadow-lg ${(delta ?? 0) >= 0 ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-red-600 to-red-700"}`}><p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Perubahan</p><p className="text-4xl font-black flex items-center gap-2">{(delta ?? 0) >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}{delta != null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}` : "—"}</p><p className="text-white/70 text-xs mt-2">{(delta ?? 0) >= 0 ? "Meningkat" : "Menurun"} dari 2024 ke 2025</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><GitCompare size={15} className="text-rose-500" />Perbandingan Status per Indikator</h3><div className="relative mb-4"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Cari indikator atau kode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left py-3 px-4 text-xs font-bold text-slate-500">#</th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500">Kode</th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500">Indikator</th><th className="text-left py-3 px-4 text-xs font-bold text-blue-500">Nilai 2024</th><th className="text-left py-3 px-4 text-xs font-bold text-blue-500">Status 2024</th><th className="text-left py-3 px-4 text-xs font-bold text-violet-500">Nilai 2025</th><th className="text-left py-3 px-4 text-xs font-bold text-violet-500">Status 2025</th><th className="text-left py-3 px-4 text-xs font-bold text-rose-500">Δ</th></tr></thead>
            <tbody>{paged.map((row, i) => {
              const v24 = row.nilai_2024_num;
              const v25 = row.r25?.nilai_2024_num ?? null;
              const diff = v24 != null && v25 != null ? v25 - v24 : null;
              const st24 = row.capaian_status ?? capaianStatusFn(v24);
              const st25 = row.r25 ? (row.r25.capaian_status ?? capaianStatusFn(v25)) : undefined;
              return (<tr key={i} className="hover:bg-slate-50 transition-colors"><td className="py-2.5 px-4 text-xs text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td><td className="py-2.5 px-4 font-mono text-xs font-bold text-slate-500">{row.no}</td><td className="py-2.5 px-4 text-xs text-slate-700 max-w-[200px] truncate">{row.indikator_short}</td><td className="py-2.5 px-4 font-bold text-blue-700 text-xs">{v24?.toFixed(2) ?? "—"}</td><td className="py-2.5 px-4"><CapaianBadge status={st24} /></td><td className="py-2.5 px-4 font-bold text-violet-700 text-xs">{v25?.toFixed(2) ?? "—"}</td><td className="py-2.5 px-4">{st25 ? <CapaianBadge status={st25} /> : <span className="text-xs text-slate-300">—</span>}</td><td className="py-2.5 px-4">{diff != null ? (<span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${diff > 0 ? "bg-emerald-50 text-emerald-700" : diff < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>{diff > 0 ? <TrendingUp size={10} /> : diff < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}{diff > 0 ? "+" : ""}{diff.toFixed(2)}</span>) : <span className="text-xs text-slate-300">—</span>}</td></tr>);
            })}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {combined.length} data</p><div className="flex gap-1.5"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button></div></div>
      </div>
    </div>
  );
}