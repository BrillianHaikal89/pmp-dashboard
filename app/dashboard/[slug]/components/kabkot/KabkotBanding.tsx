// components/kabkot/KabkotBanding.tsx
import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  GitCompare,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "../common/Badge";
import { KabkotRow } from "../../types";

const JENJANG_OPTIONS = [
  { label: "Semua", value: "Semua" },
  { label: "PAUD", value: "PAUD" },
  { label: "SD", value: "SD" },
  { label: "SMP", value: "SMP" },
  { label: "SMA", value: "SMA" },
];

/** Mencocokkan jenis_satdik dengan jenjang yang dipilih.
 *  Misal jenis_satdik = "SD/MI" → cocok dengan "SD"
 *  Filter "SMA" juga mencakup "SMK" dan "SMA/SMK Sederajat"
 *  Filter "PAUD" mencakup TK, KB, TPA, SPS, RA, SKB, dan variasinya.
 *  Menggunakan includes("PAUD") agar "PAUD SKB", "PAUD RA", dll. tertangkap. */
function matchJenjang(jenisSatdik: string, jenjang: string): boolean {
  if (jenjang === "Semua") return true;
  const upper = jenisSatdik.toUpperCase();
  if (jenjang === "SMA") {
    return upper.startsWith("SMA") || upper.startsWith("SMK");
  }
  if (jenjang === "PAUD") {
    return (
      upper.includes("PAUD") ||
      upper.startsWith("TK") ||
      upper.startsWith("KB") ||
      upper.startsWith("TPA") ||
      upper.startsWith("SPS") ||
      upper.startsWith("RA") ||
      upper.startsWith("SKB")
    );
  }
  return upper.startsWith(jenjang);
}

/** Jenis satdik lintas-jenjang/khusus yang tidak ditampilkan di komponen ini */
const EXCLUDED_JENIS = [
  "Angka Partisipasi Sekolah (5-6)",
  "Angka Partisipasi Sekolah (APS) 7-12",
  "Angka Partisipasi Sekolah (APS) 7 - 15",
  "Angka Partisipasi Sekolah (APS) 13-15",
  "Angka Partisipasi Sekolah (APS) 16-18",
  "Angka Partisipasi Sekolah (APS) 7 - 18 Kesetaraan",
  "Angka Partisipasi Sekolah (APS) 4 - 18 Penyandang Disabilitas",
  "Semua Jenjang Sesuai Kewenangan",
];

function isExcluded(jenisSatdik: string | undefined): boolean {
  if (!jenisSatdik) return false;
  return EXCLUDED_JENIS.some(
    (ex) => jenisSatdik.trim().toLowerCase() === ex.toLowerCase()
  );
}

export function KabkotBanding({ d24, d25 }: { d24: KabkotRow[]; d25: KabkotRow[] }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const map25 = useMemo(() => {
    const m: Record<string, KabkotRow> = {};
    d25.forEach((r) => { m[r.no] = r; });
    return m;
  }, [d25]);

  const jenisOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(d24.map((d) => d.jenis_satdik))).filter(
      (j) => Boolean(j) && !isExcluded(j)
    )],
    [d24]
  );

  const merged = useMemo(() => {
    let rows = d24
      .filter((row) => !isExcluded(row.jenis_satdik))
      .map((row) => ({ ...row, r25: map25[row.no] ?? null }));

    if (filterJenjang !== "Semua")
      rows = rows.filter((d) => matchJenjang(d.jenis_satdik ?? "", filterJenjang));

    if (filterJenis !== "Semua")
      rows = rows.filter((d) => d.jenis_satdik === filterJenis);

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.indikator_short.toLowerCase().includes(q) ||
          d.no.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [d24, map25, filterJenjang, filterJenis, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const jenjangSet = Array.from(new Set(d24.map((d) => d.jenis_satdik)))
    .filter((j) => Boolean(j) && !isExcluded(j));

  const jenjangChart = jenjangSet
    .filter((j) => matchJenjang(j ?? "", filterJenjang))
    .map((j) => {
      const rows24 = d24.filter((d) => d.jenis_satdik === j && d.nilai_2024_num != null);
      const rows25 = d25.filter((d) => d.jenis_satdik === j && d.nilai_2024_num != null);
      const avg24 = rows24.length
        ? +(rows24.reduce((a, b) => a + (b.nilai_2024_num ?? 0), 0) / rows24.length).toFixed(2)
        : 0;
      const avg25 = rows25.length
        ? +(rows25.reduce((a, b) => a + (b.nilai_2024_num ?? 0), 0) / rows25.length).toFixed(2)
        : 0;
      return {
        name: j!.split("/")[0].trim(),
        "Nilai 2024": avg24,
        "Nilai 2025": avg25,
      };
    })
    .filter((item) => item["Nilai 2024"] > 0 || item["Nilai 2025"] > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2">
        <p className="text-xs font-bold text-black mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs text-black">{p.name} : {p.value}</p>
        ))}
      </div>
    );
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perbandingan Capaian Kab/Kota</h1>
        <p className="text-slate-500 text-sm mt-1">2024 vs 2025 — Perubahan nilai per indikator</p>
      </div>

      {/* Filter Jenjang (pill buttons) */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 mr-1">Jenjang:</span>
        {JENJANG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setFilterJenjang(opt.value);
              setFilterJenis("Semua"); // reset jenis saat ganti jenjang
              resetPage();
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filterJenjang === opt.value
                ? "bg-rose-500 border-rose-500 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bar Chart Perbandingan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <GitCompare size={16} className="text-rose-500" />
          Rata-rata per Jenjang
          {filterJenjang !== "Semua" && (
            <span className="ml-1 text-xs font-normal text-slate-400">· {filterJenjang}</span>
          )}
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={jenjangChart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Nilai 2024" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Nilai 2025" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabel Perbandingan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Cari indikator..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          <select
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white"
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              resetPage();
            }}
          >
            {jenisOptions
              .filter((j) => j === "Semua" || matchJenjang(j, filterJenjang))
              .map((j) => (
                <option key={j}>{j}</option>
              ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Kode</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500">Indikator</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Label 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500">Nilai 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Label 2025</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500">Nilai 2025</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-rose-500">Tren</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => {
                const r25 = row.r25;
                const v24 = row.nilai_2024_num;
                const v25 = r25?.nilai_2024_num ?? null;
                const delta = v24 != null && v25 != null ? v25 - v24 : null;
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-500 whitespace-nowrap">
                      {row.no}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-700 min-w-[200px]">
                      {row.indikator_short}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge label={row.label_2024 ?? ""} />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-700 whitespace-nowrap">
                      {v24?.toFixed(2) ?? "-"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r25 ? (
                        <Badge label={r25.label_2024 ?? ""} />
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-violet-700 whitespace-nowrap">
                      {v25?.toFixed(2) ?? "-"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {delta != null ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            delta > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : delta < 0
                              ? "bg-red-50 text-red-600"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {delta > 0 ? (
                            <TrendingUp size={10} />
                          ) : delta < 0 ? (
                            <TrendingDown size={10} />
                          ) : (
                            <Minus size={10} />
                          )}
                          {delta > 0 ? "+" : ""}
                          {delta.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3">
          <p className="text-xs text-slate-400">
            Hal. {page}/{totalPages || 1} · {merged.length} data
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}