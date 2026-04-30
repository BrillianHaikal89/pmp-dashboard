"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  BarChart3,
  Filter,
  School,
  MapPin,
  Building2,
  ChevronDown,
  AlertCircle,
  Info,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface IndikatorRow {
  kab_kota: string;
  jenjang: string;
  status: string;
  indikator: string;
  nilai: string;
}

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NILAI_SCORE: Record<string, number> = {
  Baik: 3,
  Sedang: 2,
  Kurang: 1,
  "Capaian Tidak Tersedia": 0,
  "Tidak Berlaku": 0,
};



const INDIKATOR_MAP: Record<string, string> = {
  "A.1": "A.1 Kemampuan Literasi",
  "A.2": "A.2 Kemampuan Numerasi",
  "A.3": "A.3 Karakter",
  "D.1": "D.1 Kualitas Pembelajaran",
  "D.3": "D.3 Kepemimpinan Instruksional",
  "D.4": "D.4 Iklim Keamanan Satuan Pendidikan",
  "D.8": "D.8 Iklim Kebinekaan",
  "D.10": "D.10 Iklim Inklusiv",
};

const INDIKATOR_LIST = Object.values(INDIKATOR_MAP);

const INDIKATOR_COLORS: Record<string, string> = {
  "A.1 Kemampuan Literasi": "#3b82f6",
  "A.2 Kemampuan Numerasi": "#6366f1",
  "A.3 Karakter": "#8b5cf6",
  "D.1 Kualitas Pembelajaran": "#10b981",
  "D.3 Kepemimpinan Instruksional": "#14b8a6",
  "D.4 Iklim Keamanan Satuan Pendidikan": "#f59e0b",
  "D.8 Iklim Kebinekaan": "#ef4444",
  "D.10 Iklim Inklusiv": "#f97316",
};

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  3: { label: "Baik", color: "#10b981" },
  2: { label: "Sedang", color: "#f59e0b" },
  1: { label: "Kurang", color: "#ef4444" },
  0: { label: "Tidak Tersedia/Berlaku", color: "#94a3b8" },
};

// â”€â”€ Helper: Select filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SelectBox({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all w-full"
        >
          {options.map((o, idx) => (
            <option key={`${o}-${idx}`} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

// â”€â”€ Custom Tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 min-w-52">
      <p className="text-xs font-black text-slate-800 mb-3 border-b border-slate-100 pb-2">
        {label}
      </p>
      {payload.map((entry: any) => {
        const score = entry.value;
        if (score === null || score === undefined) return null;
        const info = SCORE_LABELS[score as number] ?? { label: `Skor ${score}`, color: "#94a3b8" };
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: info.color }}
            />
            <span className="text-xs text-slate-600 flex-1">{entry.dataKey}</span>
            <span
              className="text-xs font-black"
              style={{ color: info.color }}
            >
              {info.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}


// ── Trend Indikator 2025 (Khusus) ────────────────────────────────────────────────────────────
function TrendIndikator2025() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter options
  const [jenjangList, setJenjangList] = useState<string[]>([]);
  const [kabkotList, setKabkotList] = useState<string[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);

  const [activeJenjang, setActiveJenjang] = useState<string>("SMA Umum");
  const [activeKabkot, setActiveKabkot] = useState<string>("");
  const [activeStatus, setActiveStatus] = useState<string>("Negeri");
  const [applied, setApplied] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  useEffect(() => {
    setLoading(true);
    // Note: space before .json to match the actual file name
    fetch("/dataProvinsi/2025/indikator_prioritas_menurun_meningkat .json")
      .then(r => r.json())
      .then(d => {
        setData(d);
        
        const jList = Array.from(new Set(d.map((x:any) => x.jenjang))).sort() as string[];
        const kList = Array.from(new Set(d.map((x:any) => x.kab_kota))).sort() as string[];
        const sList = Array.from(new Set(d.map((x:any) => x.status))).sort() as string[];
        
        if (jList.length > 0 && !jList.includes(activeJenjang)) {
          setActiveJenjang(jList.find((x: string) => x.includes("SMA")) || jList[0]);
        }
        
        setJenjangList(["Semua", ...jList]);
        setKabkotList(kList);
        if (kList.length > 0 && (!activeKabkot || !kList.includes(activeKabkot))) {
          setActiveKabkot(kList[0]);
        }
        
        const filteredSList = sList.filter((s: string) => s !== "Semua");
        setStatusList(filteredSList);
        if (filteredSList.length > 0 && !filteredSList.includes(activeStatus)) {
          setActiveStatus(filteredSList[0]);
        }
        
        setLoading(false);
      })
      .catch(e => {
        console.error("Gagal memuat data trend", e);
        setLoading(false);
      });
  }, []);

  const tableData = useMemo(() => {
    if (!applied) return [];
    return data.filter((d: any) => 
      (activeJenjang === "Semua" || d.jenjang === activeJenjang) &&
      (d.kab_kota === activeKabkot) &&
      (d.status === activeStatus)
    );
  }, [data, activeJenjang, activeKabkot, activeStatus, applied]);

  const handleApply = () => setApplied(true);
  const handleReset = () => {
    setActiveJenjang("SMA Umum");
    if (kabkotList.length > 0) setActiveKabkot(kabkotList[0]);
    if (statusList.length > 0) setActiveStatus(statusList[0]);
    setApplied(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={13} className="text-blue-500" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Filter Tren Indikator
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <SelectBox
            label="Kabupaten / Kota"
            icon={<MapPin size={10} />}
            value={activeKabkot}
            onChange={(v) => { setActiveKabkot(v); setApplied(false); }}
            options={kabkotList}
          />
          <SelectBox
            label="Jenjang"
            icon={<School size={10} />}
            value={activeJenjang}
            onChange={(v) => { setActiveJenjang(v); setApplied(false); }}
            options={jenjangList}
          />
          <SelectBox
            label="Status Sekolah"
            icon={<Building2 size={10} />}
            value={activeStatus}
            onChange={(v) => { setActiveStatus(v); setApplied(false); }}
            options={statusList}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setViewMode("table"); setApplied(true); }}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-sm ${
              viewMode === "table" && applied
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-100"
                : "bg-slate-400 hover:bg-slate-500"
            }`}
          >
            <BarChart3 size={13} />
            Tampilkan Data
          </button>
          <button
            onClick={() => { setViewMode("chart"); setApplied(true); }}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-sm ${
              viewMode === "chart" && applied
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-100"
                : "bg-slate-400 hover:bg-slate-500"
            }`}
          >
            <TrendingUp size={13} />
            Tampilkan Grafik
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      </div>
      
      <div className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Memuat tren...</span>
          </div>
        ) : !applied ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Atur filter lalu klik <strong>Tampilkan Data</strong>
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">Tidak ada data untuk kombinasi filter ini.</div>
        ) : viewMode === "chart" ? (
          <div className="overflow-x-auto p-6">
            <div style={{ minWidth: Math.max(700, tableData.length * 80) }}>
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart 
                  data={tableData.map((d: any) => ({
                    ...d,
                    name: d.indikator,
                    nilaiNum: parseFloat((d.nilai || "0").replace(",", "."))
                  }))} 
                  margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={80} 
                  />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                    formatter={(value: any, name: any, props: any) => {
                      const { payload } = props;
                      return [value, `Nilai (${payload.perubahan})`];
                    }}
                  />
                  <Bar dataKey="nilaiNum" barSize={6} radius={[4, 4, 4, 4]}>
                    {tableData.map((d: any, index: number) => {
                      const fill = d.perubahan === "Turun" ? "#ef4444" : d.perubahan === "Naik" ? "#10b981" : "#94a3b8";
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                  <Line 
                    type="monotone" 
                    dataKey="nilaiNum" 
                    stroke="#cbd5e1" 
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const fill = payload.perubahan === "Turun" ? "#ef4444" : payload.perubahan === "Naik" ? "#10b981" : "#94a3b8";
                      return <circle key={`dot-${props.index}`} cx={cx} cy={cy} r={4} fill={fill} stroke="white" strokeWidth={1} />;
                    }}
                    activeDot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const fill = payload.perubahan === "Turun" ? "#ef4444" : payload.perubahan === "Naik" ? "#10b981" : "#94a3b8";
                      return <circle key={`activedot-${props.index}`} cx={cx} cy={cy} r={6} fill={fill} stroke="white" strokeWidth={2} />;
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[11px]">Kab/Kota</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[11px]">Jenjang</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[11px]">Indikator</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[11px]">Label Capaian</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[11px]">Perubahan Nilai</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[11px]">Perubahan pada tahun 2024</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700 text-xs">{row.kab_kota}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{row.jenjang}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 text-xs">{INDIKATOR_MAP[row.indikator] || row.indikator}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{row.label}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium text-xs">{row.nilai}</td>
                    <td className="px-4 py-3 text-center">
                      {row.perubahan === "Naik" ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
                          <TrendingUp size={12} />
                          Naik
                        </div>
                      ) : row.perubahan === "Turun" ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold border border-red-100">
                          <TrendingDown size={12} />
                          Turun
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">
                          <Minus size={12} />
                          {row.perubahan}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function GrafikKabkot2025(props: any) {
  const {
    tahun, chartApxKeysDasmen, kabkotDasmen, chartJenjangDasmen, chartApxJenjang,
    setChartApxJenjang, getApxColor, chartApxKeysPaud, kabkotPaud, chartJenjangPaud,
    allKabkotData, chartJenjangAll, chartTrendIndJenjang, setChartTrendIndJenjang,
    allChartIndKeys, chartIndKeys, getIndColor, chartTrendApxJenjang, setChartTrendApxJenjang,
    StackedBarChart, TrendChart
  } = props;

  const [rawData, setRawData] = useState<IndikatorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states (pre-chart)
  const [filterJenjang, setFilterJenjang] = useState("SMA Umum");
  const [filterKabkot, setFilterKabkot] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [applied, setApplied] = useState(false);

  // Load data
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/dataProvinsi/2025/indikator_prioritas.json")
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat data");
        return r.json();
      })
      .then((d: IndikatorRow[]) => {
        setRawData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // Unique options from data
  const jenjangOptions = useMemo(() => {
    const set = new Set(rawData.map((d) => d.jenjang));
    return ["Semua jenjang", ...Array.from(set).filter((v) => v !== "Semua jenjang").sort()];
  }, [rawData]);

  const kabkotOptions = useMemo(() => {
    const set = new Set(rawData.map((d) => d.kab_kota));
    return ["Semua", ...Array.from(set).filter((v) => v !== "Semua").sort()];
  }, [rawData]);

  const statusOptions = useMemo(() => {
    const opts = new Set(rawData.map((d) => d.status));
    return ["Semua", ...Array.from(opts).filter((s) => s !== "Semua" && s !== "Tidak Berlaku").sort()];
  }, [rawData]);

  // Chart data â€” only computed after Apply
  const chartData = useMemo(() => {
    if (!applied || rawData.length === 0) return [];

    // Filter rows
    let filtered = rawData.filter((d) => {
      if (filterJenjang !== "Semua jenjang" && d.jenjang !== filterJenjang) return false;
      if (filterKabkot !== "Semua" && d.kab_kota !== filterKabkot) return false;
      if (d.status !== filterStatus) return false;
      return true;
    });

    // Filter all indikator
    filtered = filtered.filter((d) => Object.keys(INDIKATOR_MAP).includes(d.indikator));

    // Group by kab_kota â†’ indikator â†’ string nilai (simpan nilai asli, bukan score)
    const kabMap: Record<string, Record<string, string>> = {};
    for (const r of filtered) {
      if (!kabMap[r.kab_kota]) kabMap[r.kab_kota] = {};
      // Ambil hanya row pertama per kab+indikator (filter sudah ketat: 1 jenjang + 1 status)
      const mappedInd = INDIKATOR_MAP[r.indikator];
      if (mappedInd && !(mappedInd in kabMap[r.kab_kota])) {
        kabMap[r.kab_kota][mappedInd] = r.nilai;
      }
    }

    // Build chart rows
    const allKab = filterKabkot !== "Semua" ? [filterKabkot] : kabkotOptions.slice(1);

    return allKab.map((kab) => {
      const row: Record<string, any> = { kab_kota: kab.replace("Kab. ", "").replace("Kota ", "Kota ") };
      for (const ind of INDIKATOR_LIST) {
        const nilaiStr = kabMap[kab]?.[ind];
        if (nilaiStr === undefined) {
          row[ind] = null; // tidak ada data sama sekali
        } else {
          row[ind] = NILAI_SCORE[nilaiStr] ?? 0; // Baik=3 Sedang=2 Kurang=1 Tidak Tersedia/Berlaku=0
        }
      }
      return row;
    });
  }, [applied, rawData, filterJenjang, filterKabkot, filterStatus, kabkotOptions]);


  const handleApply = () => setApplied(true);
  const handleReset = () => {
    setFilterJenjang("SMA Umum");
    setFilterKabkot("Semua");
    setFilterStatus("Semua");
    setApplied(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            1. Capaian Indikator Prioritas per Kab/Kota
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Atur filter lalu klik Tampilkan
          </p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="px-6 py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={13} className="text-blue-500" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Atur Filter Sebelum Melihat Grafik
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <SelectBox
            label="Jenjang"
            icon={<School size={10} />}
            value={filterJenjang}
            onChange={(v) => { setFilterJenjang(v); setApplied(false); }}
            options={jenjangOptions}
          />
          <SelectBox
            label="Kabupaten / Kota"
            icon={<MapPin size={10} />}
            value={filterKabkot}
            onChange={(v) => { setFilterKabkot(v); setApplied(false); }}
            options={kabkotOptions}
          />
          <SelectBox
            label="Status Sekolah"
            icon={<Building2 size={10} />}
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setApplied(false); }}
            options={statusOptions}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={loading || INDIKATOR_LIST.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-100"
          >
            <BarChart3 size={13} />
            Tampilkan Grafik
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Memuat dataâ€¦</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Gagal memuat data</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        ) : !applied ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Atur filter di atas lalu klik{" "}
              <span className="text-blue-600 font-bold">Tampilkan Grafik</span>
            </p>
            <p className="text-xs text-slate-400">
              {rawData.length.toLocaleString("id")} baris data siap diproses
            </p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <Info size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-700">
              Tidak ada data untuk kombinasi filter ini.
            </p>
          </div>
        ) : (
          <>
            {/* Legend skor */}
            <div className="flex flex-wrap gap-3 mb-5">
              {Object.entries(SCORE_LABELS).map(([score, { label, color }]) => (
                <div key={score} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                Jenjang: {filterJenjang}
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg">
                {filterKabkot === "Semua" ? `${chartData.length} Kab/Kota` : filterKabkot}
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg">
                Status: {filterStatus}
              </span>
            </div>

            {/* Bar Chart */}
            <div className="overflow-x-auto">
              <div style={{ minWidth: Math.max(700, chartData.length * 38) }}>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 80 }}
                    barCategoryGap="20%"
                    barGap={1}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="kab_kota"
                      tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={80}
                    />
                    <YAxis
                      domain={[0, 3]}
                      ticks={[0, 1, 2, 3]}
                      tickFormatter={(v) => SCORE_LABELS[v]?.label ?? v}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      formatter={(value) => (
                        <span className="text-slate-600 font-semibold">{value}</span>
                      )}
                    />
                    {INDIKATOR_LIST.map((ind: string) => (
                      <Bar
                        key={ind}
                        dataKey={ind}
                        fill={INDIKATOR_COLORS[ind] ?? "#94a3b8"}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={20}
                        minPointSize={5}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] sticky left-0 bg-slate-50">
                      Kab/Kota
                    </th>
                    {INDIKATOR_LIST.map((ind: string) => (
                      <th
                        key={ind}
                        className="px-3 py-2.5 text-center font-bold text-[10px] uppercase tracking-wider"
                        style={{ color: INDIKATOR_COLORS[ind] }}
                      >
                        {ind}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartData.map((row) => (
                    <tr key={row.kab_kota} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-slate-700 sticky left-0 bg-white">
                        {row.kab_kota}
                      </td>
                      {INDIKATOR_LIST.map((ind: string) => {
                        const score = row[ind];
                        const info = score !== null ? SCORE_LABELS[score] : null;
                        return (
                          <td key={ind} className="px-3 py-2.5 text-center">
                            {info ? (
                              <span
                                className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-white text-[10px] font-bold"
                                style={{ background: info.color }}
                              >
                                {score === 0 ? "Tdk Tersedia" : info.label}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[10px]">â€”</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 📊 Grafik 2: APK, APM, APS per Jenjang 📊 */}
      <div className="mt-8 px-6 pb-6 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-emerald-500" />
          <h3 className="text-base font-black text-slate-800">2. Capaian APK, APM, dan APS per Kab/Kota</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-3">
          Angka Partisipasi Kasar (APK), Murni (APM), dan Sekolah (APS) — skor rata-rata per kab/kota
        </p>
        {chartApxKeysDasmen && chartApxKeysDasmen.length > 0 ? (
          <StackedBarChart
            title="APK / APM / APS — Dasmen & Vokasi"
            subtitle="Pilih jenjang SD / SMP / SMA / SMK"
            data={kabkotDasmen}
            dataKeys={chartApxKeysDasmen}
            jenjangList={chartJenjangDasmen}
            activeJenjang={chartApxJenjang}
            onJenjangChange={setChartApxJenjang}
            tahun={tahun}
            colorFn={getApxColor}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mb-6">
            <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Data APK/APM/APS tidak tersedia untuk jenjang Dasmen di tahun {tahun}</p>
          </div>
        )}

        {chartApxKeysPaud && chartApxKeysPaud.length > 0 ? (
          <StackedBarChart
            title="APK / APM / APS — PAUD"
            subtitle="Pilih jenjang PAUD / KB / TK dll"
            data={kabkotPaud}
            dataKeys={chartApxKeysPaud}
            jenjangList={chartJenjangPaud}
            activeJenjang={chartApxJenjang}
            onJenjangChange={setChartApxJenjang}
            tahun={tahun}
            colorFn={getApxColor}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Data APK/APM/APS tidak tersedia untuk jenjang PAUD di tahun {tahun}</p>
          </div>
        )}
      </div>

            {/* 📊 Grafik 3: Trend Indikator Prioritas (Custom) 📊 */}
      <div className="mt-8 px-6 pb-6 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="text-base font-black text-slate-800">3. Tren Indikator Prioritas — Naik & Turun per Kab/Kota</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-3">
          Detail perubahan capaian indikator prioritas (Naik/Turun) dibandingkan tahun sebelumnya
        </p>
        <TrendIndikator2025 />
      </div>


      {/* 📊 Grafik 4: Trend APK/APM/APS 📊 */}
      <div className="mt-8 px-6 pb-6 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-orange-500" />
          <h3 className="text-base font-black text-slate-800">4. Tren APK, APM, APS — Naik & Turun per Kab/Kota</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-3">
          Perubahan capaian APK/APM/APS dibandingkan tahun sebelumnya per kab/kota
        </p>
        {TrendChart && (
          <TrendChart
            title={`Tren APK/APM/APS (${tahun === '2024' ? '2023 ➔ 2024' : '2024 ➔ 2025'})`}
            data={allKabkotData}
            jenjangList={chartJenjangAll}
            activeJenjang={chartTrendApxJenjang}
            onJenjangChange={setChartTrendApxJenjang}
            tahun={tahun}
            indikatorKeys={chartApxKeysDasmen && chartApxKeysPaud ? chartApxKeysDasmen.concat(chartApxKeysPaud) : []}
            colorFn={getApxColor}
          />
        )}
      </div>

      {/* Info Tambahan */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mt-8 mx-6 mb-6">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <ul className="text-xs text-blue-800 font-medium space-y-1">
          <li>💡 Jika satu kab/kota memiliki data Negeri dan Swasta, nilai dirata-rata</li>
          <li>💡 Data tren memerlukan kolom tahun ganda (<code>_Label Capaian 2024</code> & <code>_Label Capaian 2025</code>) di file JSON</li>
          <li>💡 APK/APM/APS akan muncul otomatis jika kolom tersedia di data JSON</li>
        </ul>
      </div>

    </div>
  );
}