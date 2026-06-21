// components/paud/PaudSingle.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Baby, School, Award, ChevronDown, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { KpiCard } from "../common/KpiCard";
import { PaudRow } from "../../types";

// ── Struktur dimensi PAUD (D = Kualitas Proses Pembelajaran, E = Kualitas Pengelolaan Satuan) ──
// Catatan: kode D1-D5 / E1-E9 dipakai apa adanya karena nama resmi tiap sub-indikator
// belum dikonfirmasi. Ganti `code` di bawah ini dengan nama indikator resmi kapan saja.
const DIMENSI_D = [
  { key: "label_d1", code: "D1" },
  { key: "label_d2", code: "D2" },
  { key: "label_d3", code: "D3" },
  { key: "label_d4", code: "D4" },
  { key: "label_d5", code: "D5" },
] as const;

const DIMENSI_E = [
  { key: "label_e1", code: "E1" },
  { key: "label_e2", code: "E2" },
  { key: "label_e3", code: "E3" },
  { key: "label_e4", code: "E4" },
  { key: "label_e5", code: "E5" },
  { key: "label_e6", code: "E6" },
  { key: "label_e7", code: "E7" },
  { key: "label_e8", code: "E8" },
  { key: "label_e9", code: "E9" },
] as const;

const ALL_INDIKATOR = [...DIMENSI_D, ...DIMENSI_E];

const LABEL_STYLE: Record<string, string> = {
  Baik: "bg-emerald-100 text-emerald-700",
  Sedang: "bg-amber-100 text-amber-700",
  Kurang: "bg-red-100 text-red-700",
};

function LabelPill({ label }: { label?: string }) {
  if (!label || !LABEL_STYLE[label]) {
    return <span className="text-xs text-slate-300" title={label || "Capaian Tidak Tersedia"}>—</span>;
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${LABEL_STYLE[label]}`}>
      {label}
    </span>
  );
}

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

  // Chart mengikuti data filtered, mencakup seluruh sub-indikator Dimensi D & E
  const chartData = ALL_INDIKATOR.map(ind => ({
    name: ind.code,
    baik: filtered.filter(d => (d as any)[ind.key] === "Baik").length,
    sedang: filtered.filter(d => (d as any)[ind.key] === "Sedang").length,
    kurang: filtered.filter(d => (d as any)[ind.key] === "Kurang").length,
  }));

  // KPI "Capaian Baik" dihitung dari proporsi seluruh nilai indikator D & E yang berlabel "Baik"
  const totalNilai = filtered.length * ALL_INDIKATOR.length;
  const totalBaik = filtered.reduce(
    (acc, row) => acc + ALL_INDIKATOR.filter(ind => (row as any)[ind.key] === "Baik").length,
    0
  );
  const persenBaik = totalNilai > 0 ? Math.round((totalBaik / totalNilai) * 100) : 0;

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
        <KpiCard title="Capaian Baik" value={`${persenBaik}%`} sub={activeFilterCount > 0 ? "Dari indikator D & E (terfilter)" : "Dari seluruh indikator D & E"} icon={Award} color="bg-emerald-500" />
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

      {/* Chart — mengikuti filtered, seluruh sub-indikator D1-D5 & E1-E9 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-1 text-sm">Distribusi Capaian per Indikator PAUD</h3>
        <p className="text-xs text-slate-400 mb-3">
          D1–D5: Kualitas Proses Pembelajaran · E1–E9: Kualitas Pengelolaan Satuan
          {activeFilterCount > 0 ? " · Data sesuai filter aktif" : ""}
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
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
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">NPSN</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">Nama</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">Jenis</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">Status</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-slate-500 align-bottom">Kecamatan</th>
                <th colSpan={DIMENSI_D.length} className="text-center py-1.5 px-3 text-[10px] font-bold text-blue-500 uppercase tracking-wide border-l border-slate-100">Indikator D</th>
                <th colSpan={DIMENSI_E.length} className="text-center py-1.5 px-3 text-[10px] font-bold text-violet-500 uppercase tracking-wide border-l border-slate-100">Indikator E</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-100">
                {DIMENSI_D.map((ind, idx) => (
                  <th key={ind.code} className={`text-center py-2 px-2 text-[11px] font-bold text-blue-400 ${idx === 0 ? "border-l border-slate-100" : ""}`}>{ind.code}</th>
                ))}
                {DIMENSI_E.map((ind, idx) => (
                  <th key={ind.code} className={`text-center py-2 px-2 text-[11px] font-bold text-violet-400 ${idx === 0 ? "border-l border-slate-100" : ""}`}>{ind.code}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">{row.npsn}</td>
                  <td className="py-3 px-3 text-xs font-semibold text-slate-800 max-w-[150px] truncate">{row.nama}</td>
                  <td className="py-3 px-3 text-xs text-slate-500">{row.jenis}</td>
                  <td className="py-3 px-3 text-xs text-slate-500">{(row as any).status ?? "—"}</td>
                  <td className="py-3 px-3 text-xs text-slate-600">{row.kecamatan}</td>
                  {DIMENSI_D.map((ind, idx) => (
                    <td key={ind.code} className={`py-3 px-2 text-center ${idx === 0 ? "border-l border-slate-100" : ""}`}>
                      <LabelPill label={(row as any)[ind.key]} />
                    </td>
                  ))}
                  {DIMENSI_E.map((ind, idx) => (
                    <td key={ind.code} className={`py-3 px-2 text-center ${idx === 0 ? "border-l border-slate-100" : ""}`}>
                      <LabelPill label={(row as any)[ind.key]} />
                    </td>
                  ))}
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