// components/pemda/PemdaTable.tsx
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Target, CheckCircle, XCircle } from "lucide-react";
import { KpiCard } from "../common/KpiCard";
import { CapaianBadge } from "../common/CapaianBadge";
import { DashData, KabkotRow } from "../../types";
import { capaianStatusFn } from "../../utils/helpers";

export function PemdaTable({ data, tahun }: { data: DashData; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<"no" | "nilai">("nilai");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const spmNilai = data.spm_nilai_num ?? null;
  const spmStatus = data.capaian_status ?? capaianStatusFn(spmNilai);
  const rows = useMemo(() => data.kabkot ?? [], [data]);
  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(rows.map(r => r.jenis_satdik))).filter(Boolean).sort()], [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis_satdik === filterJenis);
    if (filterStatus === "Meningkat") r = r.filter(d => (d.capaian_status ?? capaianStatusFn(d.nilai_2024_num)) === "Meningkat Sesuai Standar");
    if (filterStatus === "Belum") r = r.filter(d => (d.capaian_status ?? capaianStatusFn(d.nilai_2024_num)) === "Belum Meningkat Sesuai Standar");
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => {
      if (sortCol === "nilai") {
        const va = a.nilai_2024_num ?? -Infinity, vb = b.nilai_2024_num ?? -Infinity;
        return sortDir === "desc" ? vb - va : va - vb;
      }
      return sortDir === "desc" ? b.no.localeCompare(a.no) : a.no.localeCompare(b.no);
    });
  }, [rows, filterJenis, filterStatus, search, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const meningkatCount = rows.filter(r => (r.capaian_status ?? capaianStatusFn(r.nilai_2024_num)) === "Meningkat Sesuai Standar").length;
  const belumCount = rows.length - meningkatCount;
  const pctMeningkat = rows.length ? Math.round((meningkatCount / rows.length) * 100) : 0;

  const accentGrad = tahun === "2025" ? "from-violet-600 to-violet-700" : "from-blue-600 to-blue-700";

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CheckCircle size={22} className="text-emerald-500" />Data Pemda Meningkat Capaian Mutu Sesuai SPM</h1><p className="text-slate-500 text-sm mt-1">{data.tahun || "Kab. Bandung"} — Tahun {tahun} · Nilai SPM &gt; 80 = Meningkat Sesuai Standar</p></div>
      <div className={`bg-gradient-to-r ${accentGrad} rounded-2xl p-6 text-white shadow-lg`}><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Indeks SPM {tahun}</p><p className="text-5xl font-black">{data.spm_value ?? "—"}</p></div><div className="flex flex-col items-start sm:items-end gap-2"><CapaianBadge status={spmStatus} /><p className="text-white/60 text-xs">Threshold: Nilai &gt; 80</p></div></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><KpiCard title="Total Indikator" value={rows.length} sub={`${filtered.length} setelah filter`} icon={Target} color={tahun === "2025" ? "bg-violet-500" : "bg-blue-500"} /><KpiCard title="Meningkat Sesuai Standar" value={meningkatCount} sub={`${pctMeningkat}% dari total`} icon={CheckCircle} color="bg-emerald-500" /><KpiCard title="Belum Meningkat" value={belumCount} sub={`${100 - pctMeningkat}% dari total`} icon={XCircle} color="bg-amber-500" /></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"><div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-slate-700">Proporsi Capaian Indikator</p><p className="text-sm font-bold text-slate-900">{pctMeningkat}% Meningkat</p></div><div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pctMeningkat}%` }} /></div><div className="flex justify-between mt-2 text-xs text-slate-400"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Meningkat Sesuai Standar ({meningkatCount})</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Belum Meningkat ({belumCount})</span></div></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4"><div className="relative flex-1 min-w-[200px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cari indikator atau kode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><div className="flex items-center gap-2"><span className="text-xs text-slate-500">Show</span><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>{[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}</select><span className="text-xs text-slate-500">entries</span></div><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>{jenisOptions.slice(0, 15).map(j => <option key={j}>{j}</option>)}</select><select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}><option value="Semua">Semua Status</option><option value="Meningkat">Meningkat Sesuai Standar</option><option value="Belum">Belum Meningkat</option></select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left py-3 px-4 text-xs font-bold text-slate-500 w-12">#</th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500 cursor-pointer" onClick={() => { if (sortCol === "no") setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol("no"); setSortDir("asc"); } setPage(1); }}>Kode <ArrowUpDown size={11} /></th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500">Tahun</th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500 min-w-[240px]">Indikator / Prov. Kab. Kota</th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500 cursor-pointer" onClick={() => { if (sortCol === "nilai") setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol("nilai"); setSortDir("desc"); } setPage(1); }}>SPM <ArrowUpDown size={11} /></th><th className="text-left py-3 px-4 text-xs font-bold text-slate-500">Capaian</th></tr></thead>
            <tbody>{paged.map((row, i) => {
              const st = row.capaian_status ?? capaianStatusFn(row.nilai_2024_num);
              const isMeningkat = st === "Meningkat Sesuai Standar";
              return (<tr key={i} className={`hover:bg-slate-50 transition-colors ${isMeningkat ? "" : "bg-amber-50/30"}`}><td className="py-3 px-4 text-xs text-slate-400">{(page - 1) * pageSize + i + 1}</td><td className="py-3 px-4"><span className="font-mono text-xs font-bold text-slate-500">{row.no}</span></td><td className="py-3 px-4 text-xs text-slate-600">{tahun}</td><td className="py-3 px-4"><p className="text-sm font-semibold text-blue-600 truncate max-w-xs">{row.indikator_short || row.jenis_satdik}</p><p className="text-xs text-slate-400 mt-0.5">{row.jenis_satdik} · {row.status}</p></td><td className="py-3 px-4"><span className={`text-sm font-bold ${isMeningkat ? "text-emerald-700" : "text-amber-700"}`}>{row.nilai_2024_num?.toFixed(2) ?? "—"}</span>{row.nilai_2024_num != null && <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${isMeningkat ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${Math.min(100, row.nilai_2024_num)}%` }} /></div>}</td><td className="py-3 px-4"><CapaianBadge status={st} /></td></tr>);
            })}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3"><p className="text-xs text-slate-400">Hal. {page}/{totalPages} · Menampilkan {paged.length} dari {filtered.length} data</p><div className="flex gap-1.5"><button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-30 text-xs font-bold">«</button><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button><button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-30 text-xs font-bold">»</button></div></div>
      </div>
    </div>
  );
}