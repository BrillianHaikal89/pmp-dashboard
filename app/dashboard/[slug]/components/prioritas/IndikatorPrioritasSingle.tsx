// components/prioritas/IndikatorPrioritasSingle.tsx
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Target, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, Award, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Badge } from "../common/Badge";
import { SatdikTrenRekap } from "./SatdikTrenRekap";
import { LabelDistCard } from "./LabelDistCard";
import { IndikatorPrioritasRow, SatdikTrenRow } from "../../types";
import { getLabelDistPerIndikator, sortIndikatorKeys } from "../../utils/helpers";

export function IndikatorPrioritasSingle({ data, tahun, satdikTren }: { 
  data: IndikatorPrioritasRow[]; 
  tahun: string; 
  satdikTren?: { total: number; data: SatdikTrenRow[] } | null 
}) {
  const [search, setSearch] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [filterLabel, setFilterLabel] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const isTahun25 = tahun === "2025";
  const accentRing = isTahun25 ? "focus:ring-violet-400" : "focus:ring-blue-500";

  // ============================================================
  // DATA FLOW COMMENT:
  // 1. Data berasal dari props 'data' yang berisi array IndikatorPrioritasRow
  // 2. Setiap row memiliki field: no (kode indikator), status (jenjang), 
  //    nilai_24, nilai_25, delta (perubahan nilai), label (untuk 2025)
  // 3. Delta dihitung dari selisih nilai_25 - nilai_24
  //    - Jika delta positif -> "Naik X.XX"
  //    - Jika delta negatif -> "Turun X.XX"  
  //    - Jika delta 0 -> "Tidak Berubah"
  // 4. Untuk tahun 2024: menampilkan distribusi Naik/Turun/Tidak Berubah
  // 5. Untuk tahun 2025: menampilkan distribusi Label Baik/Sedang/Kurang
  // ============================================================

  // Ambil semua opsi jenjang dari data (SD, SMP, SMA, SMK, dll)
  const jenjangOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.status))).filter(Boolean).sort()], [data]);

  // Filter data berdasarkan search, jenjang, dan label (untuk 2025)
  const filtered = useMemo(() => {
    let r = data;
    if (filterJenjang !== "Semua") r = r.filter(d => d.status === filterJenjang);
    if (isTahun25 && filterLabel !== "Semua") r = r.filter(d => d.label === filterLabel);
    if (search) r = r.filter(d => d.no.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [data, filterJenjang, filterLabel, search, isTahun25]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ============================================================
  // STATISTIK UNTUK TAHUN 2024 (Naik/Turun/Tidak Berubah)
  // - naik: jumlah indikator yang nilainya meningkat dari 2024 ke 2025
  // - turun: jumlah indikator yang nilainya menurun dari 2024 ke 2025
  // - stabil: jumlah indikator yang nilainya tetap (delta 0)
  // ============================================================
  const totalData = data.length;
  const jmlBaik = isTahun25 ? data.filter(d => d.label === "Baik").length : 0;
  const jmlSedang = isTahun25 ? data.filter(d => d.label === "Sedang").length : 0;
  const jmlKurang = isTahun25 ? data.filter(d => d.label === "Kurang").length : 0;
  
  // Untuk tahun 2024: hitung dari field delta
  // delta berasal dari perbandingan nilai_25 vs nilai_24
  const naik = !isTahun25 ? data.filter(d => d.delta?.toLowerCase().startsWith("naik")).length : 0;
  const turun = !isTahun25 ? data.filter(d => d.delta?.toLowerCase().startsWith("turun")).length : 0;
  const stabil = !isTahun25 ? totalData - naik - turun : 0;

  // Hitung persentase untuk ditampilkan lebih besar
  const pctNaik = totalData > 0 ? (naik / totalData) * 100 : 0;
  const pctTurun = totalData > 0 ? (turun / totalData) * 100 : 0;
  const pctStabil = totalData > 0 ? (stabil / totalData) * 100 : 0;
  
  const pctBaik = totalData > 0 ? (jmlBaik / totalData) * 100 : 0;
  const pctSedang = totalData > 0 ? (jmlSedang / totalData) * 100 : 0;
  const pctKurang = totalData > 0 ? (jmlKurang / totalData) * 100 : 0;

  // Data untuk pie chart
  const pieChart = isTahun25
    ? [{ name: "Baik", value: jmlBaik, color: "#22c55e", pct: pctBaik }, 
       { name: "Sedang", value: jmlSedang, color: "#f59e0b", pct: pctSedang }, 
       { name: "Kurang", value: jmlKurang, color: "#ef4444", pct: pctKurang }].filter(d => d.value > 0)
    : [{ name: "Naik", value: naik, color: "#22c55e", pct: pctNaik }, 
       { name: "Turun", value: turun, color: "#ef4444", pct: pctTurun }, 
       { name: "Tidak Berubah", value: stabil, color: "#94a3b8", pct: pctStabil }].filter(d => d.value > 0);

  // Data untuk bar chart per jenjang
  const jenjangDist = jenjangOptions.filter(j => j !== "Semua").map(j => ({
    name: j.length > 16 ? j.slice(0, 14) + "…" : j,
    ...(isTahun25 ? {
      baik: data.filter(d => d.status === j && d.label === "Baik").length,
      sedang: data.filter(d => d.status === j && d.label === "Sedang").length,
      kurang: data.filter(d => d.status === j && d.label === "Kurang").length,
    } : {
      naik: data.filter(d => d.status === j && d.delta?.toLowerCase().startsWith("naik")).length,
      turun: data.filter(d => d.status === j && d.delta?.toLowerCase().startsWith("turun")).length,
    }),
  }));

  // Render options dengan key unik menggunakan index
  const renderJenjangOptions = useMemo(() => {
    return jenjangOptions.map((j, idx) => (
      <option key={`jenjang-opt-${idx}`} value={j}>
        {j}
      </option>
    ));
  }, [jenjangOptions]);

  const renderLabelOptions = useMemo(() => {
    const labels = ["Semua", "Baik", "Sedang", "Kurang"];
    return labels.map((l, idx) => (
      <option key={`label-opt-${idx}`} value={l}>
        {l}
      </option>
    ));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rekap capaian indikator prioritas</h1>
        <p className="text-slate-500 text-sm mt-1">Data indikator prioritas A1, A2, A3, D.1, D.3, D4, D.8. D.10 — Tahun {tahun}</p>
      </div>

      {/* ============================================================
          KARTU STATISTIK - TAMPILAN PERSENTASE LEBIH BESAR
          Menampilkan jumlah dan persentase dari total indikator
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {isTahun25 ? (
          // TAMPILAN UNTUK TAHUN 2025 (Label Baik/Sedang/Kurang)
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Label Baik</p>
                  <p className="text-3xl font-black text-emerald-700">{jmlBaik}</p>
                  <p className="text-lg font-bold text-emerald-500 mt-1">
                    {pctBaik.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400">dari {totalData} indikator</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-400 flex items-center justify-center">
                  <Minus size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Label Sedang</p>
                  <p className="text-3xl font-black text-amber-700">{jmlSedang}</p>
                  <p className="text-lg font-bold text-amber-500 mt-1">
                    {pctSedang.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400">dari {totalData} indikator</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Label Kurang</p>
                  <p className="text-3xl font-black text-red-700">{jmlKurang}</p>
                  <p className="text-lg font-bold text-red-500 mt-1">
                    {pctKurang.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400">dari {totalData} indikator</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          // TAMPILAN UNTUK TAHUN 2024 (Naik/Turun/Tidak Berubah)
          // Data ini menunjukkan perbandingan nilai 2024 vs 2025
          // Sumber: field 'delta' yang berisi "Naik X.XX", "Turun X.XX", atau "Tidak Berubah"
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Jumlah Indikator Meningkat</p>
                  <p className="text-2xl font-black text-emerald-700">
                    {pctNaik.toFixed(1)}%
                  </p>
                  <p className="text-lg font-bold text-emerald-500">{naik}</p>
                  
                  <p className="text-[10px] text-slate-400">dari {totalData} indikator</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center">
                  <TrendingDown size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Jumlah Indikator Menurun</p>
                  <p className="text-2xl font-black text-red-700">
                    {pctTurun.toFixed(1)}%
                  </p>
                  <p className="text-lg font-bold text-red-500">{turun}</p>
                  
                  <p className="text-[10px] text-slate-400">dari {totalData} indikator</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-400 flex items-center justify-center">
                  <Minus size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Jumlah Indikator Stabil</p>
 <p className="text-2xl font-black text-slate-600">
                    {pctStabil.toFixed(1)}%
                  </p>
                  <p className="text-lg font-bold text-slate-500">{stabil}</p>
                 
                  <p className="text-[10px] text-slate-400">dari {totalData} indikator</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================================
          GRAFIK DISTRIBUSI PER JENJANG
          Menampilkan bar chart untuk melihat distribusi per jenjang
          ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className={isTahun25 ? "text-violet-500" : "text-blue-500"} />
            {isTahun25 ? "Distribusi Label per Jenjang" : "Distribusi Delta (Naik/Turun) per Jenjang"}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {isTahun25 
              ? "Menampilkan jumlah indikator dengan label Baik, Sedang, dan Kurang per jenjang pendidikan"
              : "Menampilkan jumlah indikator yang Naik (meningkat) dan Turun (menurun) per jenjang pendidikan"
            }
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={jenjangDist} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              {isTahun25 ? (
                <>
                  <Bar dataKey="baik" name="Baik" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sedang" name="Sedang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kurang" name="Kurang" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <>
                  <Bar dataKey="naik" name="Naik (Meningkat)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="turun" name="Turun (Menurun)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* ============================================================
            PIE CHART - PROPORSISI
            Menampilkan diagram lingkaran untuk melihat proporsi keseluruhan
            ============================================================ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Award size={16} className={isTahun25 ? "text-violet-500" : "text-blue-500"} />
            {isTahun25 ? "Proporsi Label Indikator" : "Proporsi Tren Perubahan Indikator"}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {isTahun25
              ? "Perbandingan persentase indikator dengan label Baik, Sedang, dan Kurang"
              : "Perbandingan persentase indikator yang Naik, Turun, dan Tidak Berubah dari tahun 2024 ke 2025"
            }
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie 
                data={pieChart} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={90} 
                label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {pieChart.map((d, idx) => (
                  <Cell key={`pie-cell-${idx}`} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => {
                const item = pieChart.find(d => d.name === name);
                return [`${value} indikator (${item?.pct.toFixed(1)}%)`, name];
              }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================
          REKAP TREN SEKOLAH
          Menampilkan ringkasan capaian sekolah berdasarkan indikator
          ============================================================ */}
      <SatdikTrenRekap satdikTren={satdikTren ?? null} tahun={tahun} />

      {/* ============================================================
          DISTRIBUSI LABEL PER INDIKATOR
          Menampilkan kartu-kartu untuk setiap indikator (A.1, A.2, dll)
          ============================================================ */}
      {satdikTren && (() => {
        const labelDist = getLabelDistPerIndikator(satdikTren);
        const indKeys = sortIndikatorKeys(Object.keys(labelDist));
        if (!indKeys.length) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className={isTahun25 ? "text-violet-500" : "text-blue-500"} />
              <h3 className="font-bold text-slate-900">Distribusi Label per Indikator</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isTahun25 ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                {tahun}
              </span>
              <p className="text-xs text-slate-400 ml-2">
                Klik pada kartu untuk melihat daftar sekolah
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {indKeys.map((key, idx) => (
                <LabelDistCard key={`label-dist-${idx}`} indikatorKey={key} dist={labelDist[key]} tahun={tahun} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* ============================================================
          TABEL DETAIL INDIKATOR PRIORITAS
          Menampilkan semua data indikator dalam bentuk tabel
          ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className={`w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black placeholder-slate-400 bg-white focus:outline-none focus:ring-2 ${accentRing}`} 
              placeholder="Cari kode indikator (contoh: A.1, D.3)..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          <select 
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" 
            value={filterJenjang} 
            onChange={e => { setFilterJenjang(e.target.value); setPage(1); }}
          >
            {renderJenjangOptions}
          </select>
          {isTahun25 && (
            <select 
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" 
              value={filterLabel} 
              onChange={e => { setFilterLabel(e.target.value); setPage(1); }}
            >
              {renderLabelOptions}
            </select>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Kode Indikator</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Jenjang</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase tracking-wide">Nilai 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase tracking-wide">Nilai 2025</th>
                {isTahun25 && <th className="text-left py-3 px-3 text-xs font-bold text-emerald-600 uppercase tracking-wide">Kategori Label</th>}
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {isTahun25 ? "Perubahan dari 2024 ke 2025" : "Delta Perubahan"}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                // ========================================================
                // LOGIKA PERUBAHAN (DELTA):
                // - Naik: nilai_25 > nilai_24 (ditandai hijau dengan icon TrendingUp)
                // - Turun: nilai_25 < nilai_24 (ditandai merah dengan icon TrendingDown)
                // - Tidak Berubah: nilai_25 = nilai_24 (ditandai abu dengan icon Minus)
                // ========================================================
                const isNaik = row.delta?.toLowerCase().startsWith("naik");
                const isTurun = row.delta?.toLowerCase().startsWith("turun");
                return (
                  <tr key={`row-${idx}-${row.no}`} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {row.no}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{row.status}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {row.nilai_24 || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-sm text-violet-700 bg-violet-50 px-2 py-1 rounded">
                        {row.nilai_25 || "—"}
                      </span>
                    </td>
                    {isTahun25 && (
                      <td className="py-3 px-3">
                        <Badge label={row.label ?? ""} />
                      </td>
                    )}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full 
                        ${isNaik ? "bg-emerald-100 text-emerald-700" : 
                          isTurun ? "bg-red-100 text-red-600" : 
                          "bg-slate-100 text-slate-600"}`}>
                        {isNaik ? <TrendingUp size={12} /> : isTurun ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {row.delta || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={isTahun25 ? 6 : 5} className="py-10 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} className="opacity-30" />
                      <p>Tidak ada data yang sesuai dengan filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Menampilkan {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} data
          </p>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setPage(1)} 
              disabled={page === 1} 
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              «
            </button>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-1.5 text-xs font-semibold text-slate-600">
              Halaman {page} dari {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              <ChevronRight size={15} />
            </button>
            <button 
              onClick={() => setPage(totalPages)} 
              disabled={page === totalPages} 
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}