// components/kabkot/KabkotSingle.tsx
import { useState, useMemo } from "react";
import { useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Badge } from "../common/Badge";
import { KpiCard } from "../common/KpiCard";
import { KabkotRow } from "../../types";

export function KabkotSingle({ data, tahun }: { data: KabkotRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterLabel, setFilterLabel] = useState("Semua");
  const [filterJenisChart, setFilterJenisChart] = useState("Semua");
  const [sortCol, setSortCol] = useState("nilai_2024_num");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const topChartRef = useRef<HTMLDivElement>(null);
  const bottomChartRef = useRef<HTMLDivElement>(null);

  const tahunSebelumnya = String(+tahun - 1);

  const jenisOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(data.map((d) => d.jenis_satdik))).filter(Boolean)],
    [data]
  );

  const labelOptions = [
    "Semua",
    "Baik",
    "Sedang",
    "Kurang",
    "Rendah",
    "Tinggi",
    "Di atas",
    "Mencapai",
    "Di bawah",
    "Jauh di bawah",
  ];

  const filtered = useMemo(() => {
    let rows = data;
    if (filterJenis !== "Semua") rows = rows.filter((d) => d.jenis_satdik === filterJenis);
    if (filterLabel !== "Semua") rows = rows.filter((d) => d.label_2024 === filterLabel);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.indikator_short.toLowerCase().includes(q) ||
          d.no.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const va = (a as any)[sortCol] ?? -Infinity;
      const vb = (b as any)[sortCol] ?? -Infinity;
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [data, filterJenis, filterLabel, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const withVal = data.filter((d) => d.nilai_2024_num != null);
  const vals = withVal.map((d) => d.nilai_2024_num as number);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "-";
  const max = vals.length ? Math.max(...vals).toFixed(2) : "-";
  const min = vals.length ? Math.min(...vals).toFixed(2) : "-";

  // Filter chart berdasarkan jenjang (SD/SMP/SMA match substring pada jenis_satdik)
  const chartJenjangOptions = ["Semua", "SD", "SMP", "SMA"];
  const filterChartRows = (rows: typeof withVal) => {
    if (filterJenisChart === "Semua") return rows;
    return rows.filter((d) =>
      d.jenis_satdik?.toUpperCase().includes(filterJenisChart)
    );
  };

  // Transform data chart agar tooltip tidak menampilkan nama field mentah
  const top10 = [...filterChartRows(withVal)]
    .sort((a, b) => (b.nilai_2024_num ?? 0) - (a.nilai_2024_num ?? 0))
    .slice(0, 10)
    .map((d) => ({ no: d.no, nilai: d.nilai_2024_num, indikator: d.indikator_short, jenjang: d.jenis_satdik }));
  const bottom10 = [...filterChartRows(withVal)]
    .sort((a, b) => (a.nilai_2024_num ?? 0) - (b.nilai_2024_num ?? 0))
    .slice(0, 10)
    .map((d) => ({ no: d.no, nilai: d.nilai_2024_num, indikator: d.indikator_short, jenjang: d.jenis_satdik }));

  const downloadChart = (
    ref: React.RefObject<HTMLDivElement | null>,
    filename: string,
    chartData: typeof top10,
    accentColor: string
  ) => {
    if (!ref.current) return;

    const dpr = 2;
    const W = 1400;
    const pad = { top: 52, right: 32, bottom: 32, left: 32 };
    const yAxisW = 52;
    const chartW = W - pad.left - pad.right - yAxisW;
    const rowH = 32;
    const chartH = chartData.length * rowH;

    // Legend table below chart
    const legendRowH = 24;
    const legendTop = pad.top + chartH + 36;
    const totalH = legendTop + chartData.length * legendRowH + pad.bottom + 8;

    const canvas = document.createElement("canvas");
    canvas.width = W * dpr;
    canvas.height = totalH * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, totalH);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(12, 12, W - 24, totalH - 24, 12);
    ctx.fill();

    // Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(filename, W / 2, 36);
    ctx.textAlign = "left";

    const maxVal = Math.max(...chartData.map((d) => Math.abs(d.nilai ?? 0))) || 1;
    const barScale = (v: number) => (Math.abs(v) / maxVal) * chartW;
    const x0 = pad.left + yAxisW;

    // Grid lines
    const gridSteps = 5;
    for (let g = 0; g <= gridSteps; g++) {
      const gx = x0 + (g / gridSteps) * chartW;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, pad.top - 8);
      ctx.lineTo(gx, pad.top + chartH + 4);
      ctx.stroke();
      // X-axis label
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(((g / gridSteps) * maxVal).toFixed(0), gx, pad.top + chartH + 16);
    }
    ctx.textAlign = "left";

    // Bars + Y-axis labels (kode only)
    chartData.forEach((d, i) => {
      const barY = pad.top + i * rowH + 4;
      const barH2 = rowH - 10;
      const barW = barScale(d.nilai ?? 0);

      // Alternating row background
      if (i % 2 === 0) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(pad.left, pad.top + i * rowH, W - pad.left - pad.right, rowH);
      }

      // Kode label on Y axis
      ctx.fillStyle = "#334155";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(d.no ?? "", x0 - 6, barY + barH2 / 2 + 4);
      ctx.textAlign = "left";

      // Bar
      ctx.fillStyle = accentColor + "dd";
      ctx.beginPath();
      ctx.roundRect(x0, barY, Math.max(barW, 3), barH2, [0, 4, 4, 0]);
      ctx.fill();

      // Value at end of bar
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText((d.nilai?.toFixed(2) ?? ""), x0 + barW + 5, barY + barH2 / 2 + 4);
    });

    // Divider between chart and legend
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, legendTop - 14);
    ctx.lineTo(W - pad.right, legendTop - 14);
    ctx.stroke();

    // Legend header
    // Fixed column layout (x positions):
    //  col1: KODE      x=pad.left+4,   w=48
    //  col2: JENJANG   x=pad.left+60,  w=140
    //  col3: INDIKATOR x=pad.left+210, w=fills to col4
    //  col4: NILAI     right-aligned at W-pad.right-8
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 9px sans-serif";
    const col1 = pad.left + 4;
    const col2 = pad.left + 60;
    const col3 = pad.left + 210;
    const col4 = W - pad.right - 8;
    ctx.fillText("KODE", col1, legendTop - 2);
    ctx.fillText("JENJANG", col2, legendTop - 2);
    ctx.fillText("NAMA INDIKATOR", col3, legendTop - 2);
    ctx.textAlign = "right";
    ctx.fillText("NILAI", col4, legendTop - 2);
    ctx.textAlign = "left";

    // Legend rows
    chartData.forEach((d, i) => {
      const ly = legendTop + i * legendRowH + legendRowH - 5;

      // Alternating row
      if (i % 2 === 0) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(pad.left, legendTop + i * legendRowH, W - pad.left - pad.right, legendRowH);
      }

      // Kode
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(d.no ?? "", col1, ly);

      // Jenjang
      ctx.fillStyle = "#475569";
      ctx.font = "10px sans-serif";
      ctx.fillText(d.jenjang ?? "", col2, ly);

      // Indikator — clip to available width before nilai column
      ctx.fillStyle = "#334155";
      ctx.save();
      ctx.beginPath();
      ctx.rect(col3, legendTop + i * legendRowH, col4 - col3 - 60, legendRowH);
      ctx.clip();
      ctx.fillText(d.indikator ?? "", col3, ly);
      ctx.restore();

      // Nilai
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText((d.nilai?.toFixed(2) ?? ""), col4, ly);
      ctx.textAlign = "left";
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const accentBar = tahun === "2025" ? "#7c3aed" : "#3b82f6";

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
    setPage(1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0]?.payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 max-w-[220px]">
        <p className="text-xs font-bold text-slate-900 mb-0.5">{label}</p>
        {entry?.jenjang && (
          <p className="text-xs text-slate-500 mb-1">{entry.jenjang}</p>
        )}
        {entry?.indikator && (
          <p className="text-xs text-slate-700 mb-1 leading-snug">{entry.indikator}</p>
        )}
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs font-semibold text-slate-900">{p.name} : {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Capaian Kab/Kota</h1>
        <p className="text-slate-500 text-sm mt-1">
          Seluruh indikator capaian per jenjang — Tahun {tahun}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Rata-rata Nilai"
          value={avg}
          sub="Semua indikator"
          icon={Target}
          color={tahun === "2025" ? "bg-violet-500" : "bg-blue-500"}
        />
        <KpiCard
          title="Nilai Tertinggi"
          value={max}
          sub="Capaian terbaik"
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <KpiCard
          title="Nilai Terendah"
          value={min}
          sub="Perlu perhatian"
          icon={TrendingDown}
          color="bg-red-500"
        />
      </div>

      {/* Bar Charts */}
      <div className="space-y-3">
        {/* Shared jenjang filter for charts */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jenjang:</span>
          <div className="flex gap-1.5">
            {chartJenjangOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterJenisChart(opt)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  filterJenisChart === opt
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              Top 10
            </h3>
              <button
                onClick={() => downloadChart(topChartRef, `top10-${tahun}`, top10, accentBar)}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                title="Download PNG"
              >
                <Download size={13} />
                PNG
              </button>
          </div>
          <div ref={topChartRef}>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={top10} layout="vertical" margin={{ right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="no" width={90} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="nilai" name={`Nilai ${tahun}`} radius={[0, 4, 4, 0]}>
                  {top10.map((_, i) => (
                    <Cell key={i} fill={accentBar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingDown size={16} className="text-red-500" />
              Bottom 10
            </h3>
              <button
                onClick={() => downloadChart(bottomChartRef, `bottom10-${tahun}`, bottom10, "#ef4444")}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                title="Download PNG"
              >
                <Download size={13} />
                PNG
              </button>
          </div>
          <div ref={bottomChartRef}>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={bottom10} layout="vertical" margin={{ right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="no" width={90} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="nilai" name={`Nilai ${tahun}`} radius={[0, 4, 4, 0]}>
                  {bottom10.map((_, i) => (
                    <Cell key={i} fill="#ef4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Cari indikator..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white"
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              setPage(1);
            }}
          >
            {jenisOptions.slice(0, 15).map((j) => (
              <option key={j}>{j}</option>
            ))}
          </select>
          <select
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white"
            value={filterLabel}
            onChange={(e) => {
              setFilterLabel(e.target.value);
              setPage(1);
            }}
          >
            {labelOptions.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  { label: "Kode", col: "no" },
                  { label: "Jenjang", col: "jenis_satdik" },
                  { label: "Indikator", col: "indikator_short" },
                  { label: "Label", col: "label_2024" },
                  { label: `Nilai ${tahun}`, col: "nilai_2024_num" },
                  { label: `Nilai ${tahunSebelumnya}`, col: "nilai_2023_num" },
                  { label: "Perubahan", col: "perubahan" },
                ].map(({ label, col }) => (
                  <th
                    key={col}
                    className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => toggleSort(col)}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => {
                const p = row.perubahan ?? "";
                const isNaik = p.toLowerCase().startsWith("naik");
                const isTurun = p.toLowerCase().startsWith("turun");
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 font-bold whitespace-nowrap">
                      {row.no}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                      {row.jenis_satdik}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-700 min-w-[200px]">
                      {row.indikator_short}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge label={row.label_2024 ?? ""} />
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {row.nilai_2024_num?.toFixed(2) ?? "-"}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {row.nilai_2023_num?.toFixed(2) ?? "-"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`flex items-center gap-1 text-xs font-semibold ${
                          isNaik
                            ? "text-emerald-600"
                            : isTurun
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      >
                        {isNaik ? (
                          <TrendingUp size={12} />
                        ) : isTurun ? (
                          <TrendingDown size={12} />
                        ) : (
                          <Minus size={12} />
                        )}
                        {p || "—"}
                      </span>
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
            Hal. {page}/{totalPages} · {filtered.length} data
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
              disabled={page === totalPages}
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