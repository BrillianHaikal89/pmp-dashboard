// components/kabkot/KabkotBanding.tsx
import { useState, useMemo, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  GitCompare,
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
  Legend,
} from "recharts";
import { Badge } from "../common/Badge";
import { KabkotRow } from "../../types";

const JENJANG_UTAMA = ["PAUD", "SD", "SMP", "SMA", "SMK"];

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
  const [selectedJenjangUtama, setSelectedJenjangUtama] = useState<string[]>([]);
  const [selectedJenjangDetail, setSelectedJenjangDetail] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const chartRef = useRef<HTMLDivElement>(null);

  const map25 = useMemo(() => {
    const m: Record<string, KabkotRow> = {};
    d25.forEach((r) => { m[r.no] = r; });
    return m;
  }, [d25]);

  // Get unique jenjang options from data
  const jenjangOptions = useMemo(
    () => Array.from(new Set(d24.map((d) => d.jenis_satdik))).filter(
      (j) => Boolean(j) && !isExcluded(j)
    ),
    [d24]
  );

  // Group jenjang by utama
  const getJenjangDetail = (utama: string) => {
    return jenjangOptions.filter(j => matchJenjang(j, utama));
  };

  // Handle checkbox change for utama
  const handleJenjangUtamaChange = (jenjang: string) => {
    setSelectedJenjangUtama(prev => {
      if (prev.includes(jenjang)) {
        // Jika uncheck utama, hapus juga detailnya
        const detailOptions = getJenjangDetail(jenjang);
        setSelectedJenjangDetail(prevDetail => 
          prevDetail.filter(d => !detailOptions.includes(d))
        );
        return prev.filter(j => j !== jenjang);
      } else {
        // Jika check utama, pilih semua detailnya
        const detailOptions = getJenjangDetail(jenjang);
        setSelectedJenjangDetail(prev => [...new Set([...prev, ...detailOptions])]);
        return [...prev, jenjang];
      }
    });
    setPage(1);
    setFilterJenis("Semua");
  };

  // Handle checkbox change for detail
  const handleJenjangDetailChange = (jenjang: string) => {
    setSelectedJenjangDetail(prev => {
      const newDetails = prev.includes(jenjang) 
        ? prev.filter(j => j !== jenjang)
        : [...prev, jenjang];
      
      // Update utama berdasarkan detail yang dipilih
      const newUtama = JENJANG_UTAMA.filter(utama => {
        const details = getJenjangDetail(utama);
        return details.some(d => newDetails.includes(d));
      });
      setSelectedJenjangUtama(newUtama);
      
      return newDetails;
    });
    setPage(1);
    setFilterJenis("Semua");
  };

  // Select all jenjang
  const selectAllJenjang = () => {
    setSelectedJenjangUtama([...JENJANG_UTAMA]);
    setSelectedJenjangDetail([...jenjangOptions]);
    setPage(1);
    setFilterJenis("Semua");
  };

  // Deselect all jenjang
  const deselectAllJenjang = () => {
    setSelectedJenjangUtama([]);
    setSelectedJenjangDetail([]);
    setPage(1);
    setFilterJenis("Semua");
  };

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

    // Filter by selected detail jenjang (if any selected)
    if (selectedJenjangDetail.length > 0) {
      rows = rows.filter((d) => selectedJenjangDetail.includes(d.jenis_satdik));
    }

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
  }, [d24, map25, selectedJenjangDetail, filterJenis, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Get selected jenjang display text
  const getSelectedJenjangText = () => {
    if (selectedJenjangDetail.length === 0) return "Semua Jenjang";
    if (selectedJenjangDetail.length === jenjangOptions.length) return "Semua Jenjang";
    return `${selectedJenjangDetail.length} jenjang terpilih`;
  };

  // Chart data - menggunakan selectedJenjangDetail
  const jenjangSet = Array.from(new Set(d24.map((d) => d.jenis_satdik)))
    .filter((j) => Boolean(j) && !isExcluded(j));

  const chartData = jenjangSet
    .filter((j) => {
      if (selectedJenjangDetail.length === 0) return true;
      return selectedJenjangDetail.includes(j);
    })
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

  // Download chart function
  const downloadChart = () => {
    if (!chartRef.current) return;

    const dpr = 2;
    const W = 1200;
    const pad = { top: 60, right: 40, bottom: 60, left: 60 };
    const chartH = 400;
    const totalH = pad.top + chartH + pad.bottom;

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
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Perbandingan Rata-rata per Jenjang", W / 2, 40);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("2024 vs 2025", W / 2, 58);
    ctx.textAlign = "left";

    // Draw chart manually
    const chartX = pad.left;
    const chartY = pad.top;
    const chartW = W - pad.left - pad.right;
    
    if (chartData.length === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tidak ada data untuk ditampilkan", W / 2, chartY + chartH / 2);
      ctx.textAlign = "left";
    } else {
      const maxVal = Math.max(
        ...chartData.map(d => Math.max(d["Nilai 2024"], d["Nilai 2025"]))
      ) || 1;
      const barWidth = Math.min(40, (chartW / chartData.length) * 0.6);
      const groupWidth = barWidth * 2.2;
      const totalWidth = chartData.length * groupWidth;
      const startX = chartX + (chartW - totalWidth) / 2;
      const yBase = chartY + chartH - 30;

      // Grid lines
      const gridSteps = 5;
      for (let g = 0; g <= gridSteps; g++) {
        const yPos = yBase - (g / gridSteps) * (chartH - 50);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartX, yPos);
        ctx.lineTo(chartX + chartW, yPos);
        ctx.stroke();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(((g / gridSteps) * maxVal).toFixed(0), chartX - 8, yPos + 4);
      }
      ctx.textAlign = "left";

      // Bars
      chartData.forEach((item, i) => {
        const xPos = startX + i * groupWidth;
        const barH24 = (item["Nilai 2024"] / maxVal) * (chartH - 50);
        const barH25 = (item["Nilai 2025"] / maxVal) * (chartH - 50);

        // Bar 2024
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.roundRect(xPos, yBase - barH24, barWidth, barH24, [4, 4, 0, 0]);
        ctx.fill();

        // Bar 2025
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.roundRect(xPos + barWidth + 4, yBase - barH25, barWidth, barH25, [4, 4, 0, 0]);
        ctx.fill();

        // X-axis label
        ctx.fillStyle = "#334155";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        const label = item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name;
        ctx.fillText(label, xPos + barWidth + 2, yBase + 18);

        // Value labels
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        if (item["Nilai 2024"] > 0) {
          ctx.fillText(item["Nilai 2024"].toFixed(1), xPos + barWidth/2, yBase - barH24 - 6);
        }
        if (item["Nilai 2025"] > 0) {
          ctx.fillText(item["Nilai 2025"].toFixed(1), xPos + barWidth + 4 + barWidth/2, yBase - barH25 - 6);
        }
      });
    }

    // Legend
    const legendY = chartY + chartH + 10;
    const legendItems = [
      { color: "#3b82f6", label: "Nilai 2024" },
      { color: "#7c3aed", label: "Nilai 2025" }
    ];
    let legendX = pad.left + 20;
    legendItems.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY, 16, 16);
      ctx.fillStyle = "#334155";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.label, legendX + 20, legendY + 13);
      legendX += 120;
    });

    const link = document.createElement("a");
    link.download = `perbandingan-jenjang.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

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

      {/* Filter & Search Section - Above Charts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              placeholder="Cari indikator..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          
          {/* Jenjang Filter - Checkbox Group */}
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById('jenjangDropdownBanding');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-black bg-white hover:bg-slate-50 flex items-center gap-2 min-w-[180px]"
            >
              <span className="truncate">{getSelectedJenjangText()}</span>
              <span className="text-slate-400">▼</span>
            </button>
            <div 
              id="jenjangDropdownBanding"
              className="hidden absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 min-w-[300px] max-h-[400px] overflow-y-auto"
            >
              <div className="flex gap-2 mb-2 pb-2 border-b border-slate-100">
                <button
                  onClick={selectAllJenjang}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={deselectAllJenjang}
                  className="text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100"
                >
                  Hapus Semua
                </button>
              </div>
              
              {/* Jenjang Utama */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">Jenjang Utama</p>
                {JENJANG_UTAMA.map((utama) => {
                  const detailOptions = getJenjangDetail(utama);
                  if (detailOptions.length === 0) return null;
                  const isChecked = selectedJenjangUtama.includes(utama);
                  return (
                    <label key={utama} className="flex items-center gap-2 py-1 hover:bg-slate-50 px-1 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleJenjangUtamaChange(utama)}
                        className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{utama}</span>
                      <span className="text-xs text-slate-400 ml-auto">{detailOptions.length}</span>
                    </label>
                  );
                })}
              </div>

              {/* Jenjang Detail */}
              <div className="border-t border-slate-100 pt-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">Jenjang Detail</p>
                {jenjangOptions.map((jenjang) => (
                  <label key={jenjang} className="flex items-center gap-2 py-1 hover:bg-slate-50 px-1 rounded cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={selectedJenjangDetail.includes(jenjang)}
                      onChange={() => handleJenjangDetailChange(jenjang)}
                      className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm text-slate-700">{jenjang}</span>
                  </label>
                ))}
                {jenjangOptions.length === 0 && (
                  <p className="text-sm text-slate-400 py-2">Tidak ada data jenjang</p>
                )}
              </div>
            </div>
          </div>

          <select
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-black bg-white"
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              resetPage();
            }}
          >
            {jenjangOptions
              .filter((j) => {
                if (j === "Semua") return true;
                if (selectedJenjangDetail.length === 0) return true;
                return selectedJenjangDetail.includes(j);
              })
              .map((j) => (
                <option key={j}>{j}</option>
              ))}
          </select>
        </div>

        {/* Active filters display */}
        {(selectedJenjangDetail.length > 0 || filterJenis !== "Semua" || search) && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 mr-1">Filter aktif:</span>
            {selectedJenjangDetail.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                {selectedJenjangDetail.length} jenjang
              </span>
            )}
            {filterJenis !== "Semua" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
                {filterJenis}
              </span>
            )}
            {search && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-50 text-slate-700 border border-slate-200">
                Pencarian: {search}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bar Chart Perbandingan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <GitCompare size={16} className="text-rose-500" />
            Rata-rata per Jenjang
            {selectedJenjangDetail.length > 0 && (
              <span className="ml-1 text-xs font-normal text-slate-400">· {selectedJenjangDetail.length} jenjang terpilih</span>
            )}
          </h3>
          <button
            onClick={downloadChart}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
            title="Download PNG"
          >
            <Download size={13} />
            PNG
          </button>
        </div>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
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
      </div>

      {/* Tabel Perbandingan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
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