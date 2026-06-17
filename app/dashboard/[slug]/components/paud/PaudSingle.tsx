// components/paud/PaudSingle.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Baby, School, Award, ChevronDown, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "../common/Badge";
import { KpiCard } from "../common/KpiCard";
import { PaudRow } from "../../types";

// ── Reusable checkbox dropdown ────────────────────────────────────────────────
function CheckboxDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const allSelected = selected.size === 0;

  function toggle(opt: string) {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(next);
  }

  function toggleAll() {
    onChange(new Set());
  }

  const displayLabel =
    allSelected ? label : selected.size === 1 ? [...selected][0] : `${selected.size} dipilih`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
      >
        <span className={allSelected ? "text-slate-400" : "text-slate-800 font-medium"}>
          {displayLabel}
        </span>
        {!allSelected && (
          <span
            className="flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full text-white text-[9px] font-bold cursor-pointer"
            onClick={e => { e.stopPropagation(); onChange(new Set()); }}
          >
            <X size={8} />
          </span>
        )}
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 min-w-[200px] max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1">
          <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="accent-blue-500 w-3.5 h-3.5"
            />
            <span className="text-slate-500 font-medium">Semua</span>
          </label>
          <div className="border-t border-slate-100 my-1" />
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.has(opt)}
                onChange={() => toggle(opt)}
                className="accent-blue-500 w-3.5 h-3.5"
              />
              <span className="text-slate-700 truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PaudSingle({ data, tahun }: { data: PaudRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [selectedJenis, setSelectedJenis] = useState<Set<string>>(new Set());
  const [selectedKecamatan, setSelectedKecamatan] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const jenisOptions = useMemo(
    () => Array.from(new Set(data.map(d => d.jenis))).filter(Boolean).sort() as string[],
    [data]
  );
  const kecOptions = useMemo(
    () => Array.from(new Set(data.map(d => d.kecamatan))).filter(Boolean).sort() as string[],
    [data]
  );

  const filtered = useMemo(() => {
    let r = data;
    if (selectedJenis.size > 0) r = r.filter(d => d.jenis && selectedJenis.has(d.jenis));
    if (selectedKecamatan.size > 0) r = r.filter(d => d.kecamatan && selectedKecamatan.has(d.kecamatan));
    if (search)
      r = r.filter(
        d =>
          d.nama?.toLowerCase().includes(search.toLowerCase()) ||
          d.kecamatan?.toLowerCase().includes(search.toLowerCase()) ||
          d.npsn?.toLowerCase().includes(search.toLowerCase())
      );
    return r;
  }, [data, selectedJenis, selectedKecamatan, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Chart mengikuti data filtered
  const inds = [
    { key: "label_perencanaan", name: "Perencanaan" },
    { key: "label_proses", name: "Proses" },
    { key: "label_kemampuan_fondasi", name: "Fondasi" },
    { key: "label_sarana", name: "Sarana" },
  ];
  const chartData = inds.map(ind => ({
    name: ind.name,
    baik: filtered.filter(d => (d as any)[ind.key] === "Baik").length,
    sedang: filtered.filter(d => (d as any)[ind.key] === "Sedang").length,
    kurang: filtered.filter(d => (d as any)[ind.key] === "Kurang").length,
  }));

  const activeFilterCount = selectedJenis.size + selectedKecamatan.size;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Capaian Satdik PAUD</h1>
          <p className="text-slate-500 text-sm mt-1">Pendidikan Anak Usia Dini — Tahun {tahun}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total PAUD" value={data.length} sub="Satuan terdaftar" icon={Baby} color={tahun === "2025" ? "bg-violet-500" : "bg-pink-500"} />
        <KpiCard title="Jenis PAUD" value={jenisOptions.length} sub="Jenis lembaga" icon={School} color="bg-amber-500" />
        <KpiCard title="Capaian Baik" value={filtered.filter(d => d.label_perencanaan === "Baik").length} sub={activeFilterCount > 0 ? "Perencanaan baik (terfilter)" : "Perencanaan baik"} icon={Award} color="bg-emerald-500" />
      </div>

      {/* Filter bar — diletakkan di atas chart agar chart langsung terlihat berubah */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-1">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari nama, kecamatan, NPSN..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <CheckboxDropdown
            label="Jenis PAUD"
            options={jenisOptions}
            selected={selectedJenis}
            onChange={s => { setSelectedJenis(s); setPage(1); }}
          />
          <CheckboxDropdown
            label="Kecamatan"
            options={kecOptions}
            selected={selectedKecamatan}
            onChange={s => { setSelectedKecamatan(s); setPage(1); }}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSelectedJenis(new Set()); setSelectedKecamatan(new Set()); setSearch(""); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
            >
              <X size={13} /> Reset filter
            </button>
          )}
        </div>
        {activeFilterCount > 0 && (
          <p className="text-xs text-blue-500 mt-2">
            Menampilkan <span className="font-semibold">{filtered.length}</span> dari {data.length} PAUD
          </p>
        )}
      </div>

      {/* Chart — mengikuti filtered */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-1 text-sm">Distribusi Capaian per Indikator PAUD</h3>
        {activeFilterCount > 0 && (
          <p className="text-xs text-slate-400 mb-3">Data sesuai filter aktif</p>
        )}
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="baik" name="Baik" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sedang" name="Sedang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="kurang" name="Kurang" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">NPSN</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Nama</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Jenis</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Kecamatan</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Perencanaan</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Proses</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Fondasi</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Sarana</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">{row.npsn}</td>
                  <td className="py-3 px-3 text-xs font-semibold text-slate-800 max-w-[150px] truncate">{row.nama}</td>
                  <td className="py-3 px-3 text-xs text-slate-500">{row.jenis}</td>
                  <td className="py-3 px-3 text-xs text-slate-600">{row.kecamatan}</td>
                  <td className="py-3 px-3"><Badge label={row.label_perencanaan ?? ""} /></td>
                  <td className="py-3 px-3"><Badge label={row.label_proses ?? ""} /></td>
                  <td className="py-3 px-3"><Badge label={row.label_kemampuan_fondasi ?? ""} /></td>
                  <td className="py-3 px-3"><Badge label={row.label_sarana ?? ""} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}