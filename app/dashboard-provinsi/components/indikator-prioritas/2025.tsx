"use client";

import React from 'react';
import { BarChart3, CheckCircle2, Info, AlertCircle, ListChecks, PieChart, Grid3x3, LayoutGrid, Activity, TrendingUp, Minus, TrendingDown, Search, School, BookOpen, GraduationCap, Building2, Filter } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function IndikatorPrioritas2025(props: Record<string, any>) {
  const {
    tahun, SectionHeader, DashboardCard, LabelBadge, PerubahanBadge,
    totalDashboardStats, baikTinggiPercent, sedangPercent, kurangRendahPercent,
    filterStatus, setFilterStatus, indikatorStats,
    setSchoolModal, setSchoolModalSearch, setSchoolModalPage,
    setSchoolModalKabkot, setSchoolModalKecamatan, PRIORITY_INDICATORS,
    viewMode, setViewMode, jenjangStats, jenjangOptionsProvinsi, SelectFilter,
    filterJenjang, setFilterJenjang, statusOptionsProvinsi,
    filterCapaian, setFilterCapaian, groupedProvData, getJenjangGradient,
    capaianGroup, borderColorForGroup,
    allChartIndKeys, chartIndKeys, allKabkotData, chartJenjangAll,
    chartIndJenjang, setChartIndJenjang, getIndColor,
    chartApxKeysDasmen, chartApxKeysPaud, kabkotDasmen, chartJenjangDasmen,
    chartApxJenjang, setChartApxJenjang, getApxColor, kabkotPaud,
    chartJenjangPaud, chartTrendIndJenjang, setChartTrendIndJenjang,
    chartTrendApxJenjang, setChartTrendApxJenjang, StackedBarChart, TrendChart,
    fKD, iKD, sKD, setSKD, oKDJ, fKDJ, setFKDJ, oKDS, fKDS, setFKDS, KabkotTable,
    fKP, iKP, sKP, setSKP, oKPS, fKPS, setFKPS,
    fSD, pagedSD, iSD, pageSD, setPageSD, sSD, setSSD, oSDJ, fSDJ, setFSDJ,
    oSDS, fSDS, setFSDS, oSDK, fSDK, setFSDK, SatdikTable, PAGE_SIZE,
    fSP, pagedSP, iSP, pageSP, setPageSP, sSP, setSSP, oSPJ, fSPJ, setFSPJ,
    oSPS, fSPS, setFSPS, oSPK, fSPK, setFSPK,
  } = props;

  return (
    <>
<div>
                    <SectionHeader
                      icon={<BarChart3 size={18} />}
                      title="Rekap Capaian Indikator Prioritas"
                      badge={`8 Indikator Utama Â· Tahun ${tahun} Â· ${filterStatus === "Semua" ? "Negeri + Swasta" : filterStatus}`}
                    />

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                      <DashboardCard
                        title="BAIK / TINGGI"
                        value={totalDashboardStats.baikTinggi}
                        icon={<CheckCircle2 size={20} className="text-white" />}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        trend={baikTinggiPercent > 50 ? "up" : baikTinggiPercent > 30 ? "neutral" : "down"}
                        trendValue={`${baikTinggiPercent}% dari total`}
                        subtitle={`${totalDashboardStats.baikTinggi} dari ${totalDashboardStats.total} sekolah`}
                      />
                      <DashboardCard
                        title="SEDANG"
                        value={totalDashboardStats.sedang}
                        icon={<Info size={20} className="text-white" />}
                        color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                        trend={sedangPercent > 40 ? "neutral" : "down"}
                        trendValue={`${sedangPercent}% dari total`}
                      />
                      <DashboardCard
                        title="KURANG / RENDAH"
                        value={totalDashboardStats.kurangRendah}
                        icon={<AlertCircle size={20} className="text-white" />}
                        color="bg-gradient-to-br from-red-500 to-red-600"
                        trend={kurangRendahPercent > 30 ? "down" : "up"}
                        trendValue={`${kurangRendahPercent}% dari total`}
                      />
                      <DashboardCard
                        title="TOTAL INDIKATOR"
                        value={totalDashboardStats.total}
                        icon={<ListChecks size={20} className="text-white" />}
                        color="bg-gradient-to-br from-blue-600 to-blue-700"
                      />
                    </div>

                    {/* Rekap per Indikator */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <ListChecks size={14} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Capaian per Indikator Prioritas</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Jumlah sekolah per kategori capaian indikator</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] w-16">Kode</th>
                              <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Indikator</th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-emerald-600">Baik/Tinggi <span className="text-[9px] font-normal opacity-60 normal-case">â†— klik lihat sekolah</span></th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-amber-600">Sedang <span className="text-[9px] font-normal opacity-60 normal-case">â†— klik</span></th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-red-600">Kurang/Rendah <span className="text-[9px] font-normal opacity-60 normal-case">â†— klik</span></th>
                              <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] min-w-40">Distribusi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {PRIORITY_INDICATORS.map((p: any) => {
                              const s = indikatorStats[p.code];
                              if (!s) return null;
                              const total = s.baikTinggi + s.sedang + s.kurangRendah + s.tidakTersedia;
                              const baikPct = total > 0 ? Math.round((s.baikTinggi / total) * 100) : 0;
                              const sedangPct = total > 0 ? Math.round((s.sedang / total) * 100) : 0;
                              const kurangPct = total > 0 ? Math.round((s.kurangRendah / total) * 100) : 0;
                              return (
                                <tr key={p.code} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="px-5 py-3.5">
                                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                      {p.code}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <p className="text-sm font-semibold text-slate-800">{p.fullName}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{p.description}</p>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {total > 0 ? (
                                      <button
                                        onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Baik / Tinggi" }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                                        className="inline-flex flex-col items-center gap-0.5 group/btn cursor-pointer hover:bg-emerald-50 rounded-xl px-3 py-1.5 transition-all border border-transparent hover:border-emerald-200"
                                        title={`Lihat ${s.baikTinggi} sekolah dengan capaian Baik/Tinggi`}
                                      >
                                        <span className="text-base font-black text-emerald-700 group-hover/btn:underline">{s.baikTinggi}</span>
                                        <span className="text-[10px] text-emerald-500 font-medium">{baikPct}%</span>
                                      </button>
                                    ) : <span className="text-slate-300">â€“</span>}
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {total > 0 ? (
                                      <button
                                        onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Sedang" }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                                        className="inline-flex flex-col items-center gap-0.5 group/btn cursor-pointer hover:bg-amber-50 rounded-xl px-3 py-1.5 transition-all border border-transparent hover:border-amber-200"
                                        title={`Lihat ${s.sedang} sekolah dengan capaian Sedang`}
                                      >
                                        <span className="text-base font-black text-amber-600 group-hover/btn:underline">{s.sedang}</span>
                                        <span className="text-[10px] text-amber-500 font-medium">{sedangPct}%</span>
                                      </button>
                                    ) : <span className="text-slate-300">â€“</span>}
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {total > 0 ? (
                                      <button
                                        onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Kurang / Rendah" }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                                        className="inline-flex flex-col items-center gap-0.5 group/btn cursor-pointer hover:bg-red-50 rounded-xl px-3 py-1.5 transition-all border border-transparent hover:border-red-200"
                                        title={`Lihat ${s.kurangRendah} sekolah dengan capaian Kurang/Rendah`}
                                      >
                                        <span className="text-base font-black text-red-600 group-hover/btn:underline">{s.kurangRendah}</span>
                                        <span className="text-[10px] text-red-400 font-medium">{kurangPct}%</span>
                                      </button>
                                    ) : <span className="text-slate-300">â€“</span>}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    {total > 0 ? (
                                      <div>
                                        <div className="flex rounded-full overflow-hidden h-2 gap-px w-full">
                                          {baikPct > 0 && (
                                            <div className="h-full rounded-l-full" style={{ width: `${baikPct}%`, background: "#22c55e" }} title={`Baik/Tinggi: ${baikPct}%`} />
                                          )}
                                          {sedangPct > 0 && (
                                            <div className="h-full" style={{ width: `${sedangPct}%`, background: "#f59e0b" }} title={`Sedang: ${sedangPct}%`} />
                                          )}
                                          {kurangPct > 0 && (
                                            <div className="h-full rounded-r-full" style={{ width: `${kurangPct}%`, background: "#ef4444" }} title={`Kurang/Rendah: ${kurangPct}%`} />
                                          )}
                                        </div>
                                        <p className="text-[9px] text-slate-400 mt-1">{total} sekolah</p>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-300">Tidak ada data</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Progress Ringkasan */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-100">
                            <PieChart size={14} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Distribusi Capaian</h3>
                            <p className="text-[10px] text-slate-400">{totalDashboardStats.total} capaian sekolah tercatat</p>
                          </div>
                        </div>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            title="Tampilan Grid"
                          >
                            <Grid3x3 size={15} />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            title="Tampilan List"
                          >
                            <LayoutGrid size={15} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex rounded-full overflow-hidden h-4 gap-0.5 mb-4">
                        {baikTinggiPercent > 0 && (
                          <div
                            className="flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500 rounded-l-full"
                            style={{ width: `${baikTinggiPercent}%`, background: "#22c55e" }}
                          >
                            {baikTinggiPercent > 15 && `${baikTinggiPercent}%`}
                          </div>
                        )}
                        {sedangPercent > 0 && (
                          <div
                            className="flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                            style={{ width: `${sedangPercent}%`, background: "#f59e0b" }}
                          >
                            {sedangPercent > 15 && `${sedangPercent}%`}
                          </div>
                        )}
                        {kurangRendahPercent > 0 && (
                          <div
                            className="flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500 rounded-r-full"
                            style={{ width: `${kurangRendahPercent}%`, background: "#ef4444" }}
                          >
                            {kurangRendahPercent > 15 && `${kurangRendahPercent}%`}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        {[
                          { color: "#22c55e", label: "Baik / Tinggi", count: totalDashboardStats.baikTinggi, pct: baikTinggiPercent },
                          { color: "#f59e0b", label: "Sedang", count: totalDashboardStats.sedang, pct: sedangPercent },
                          { color: "#ef4444", label: "Kurang / Rendah", count: totalDashboardStats.kurangRendah, pct: kurangRendahPercent },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                            <span className="text-xs text-slate-500">{item.label}</span>
                            <span className="text-xs font-black text-slate-800">{item.count}</span>
                            <span className="text-[10px] text-slate-400">({item.pct}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tabel Ringkasan per Jenjang */}
                    {Object.keys(jenjangStats).length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                        <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-800">Ringkasan Capaian per Jenjang</h3>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="text-sm w-full">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-5 py-3 text-left font-bold text-slate-600">Jenjang</th>
                                <th className="px-5 py-3 text-center font-bold text-slate-600">Baik/Tinggi</th>
                                <th className="px-5 py-3 text-center font-bold text-slate-600">Sedang</th>
                                <th className="px-5 py-3 text-center font-bold text-slate-600">Kurang/Rendah</th>
                                <th className="px-5 py-3 text-left font-bold text-slate-600">Trend</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {Object.entries(jenjangStats)
                                .sort((a: [string, any], b: [string, any]) => b[1].total - a[1].total)
                                .map(([jenjang, stats]: [string, any]) => {
                                  const baikPercent = stats.total > 0 ? Math.round((stats.baikTinggi / stats.total) * 100) : 0;
                                  let trendIcon = null;
                                  let trendText = "";
                                  let trendColor = "";
                                  if (baikPercent >= 60) {
                                    trendIcon = <TrendingUp size={12} className="text-emerald-600" />;
                                    trendText = "Baik";
                                    trendColor = "text-emerald-700";
                                  } else if (baikPercent >= 40) {
                                    trendIcon = <Minus size={12} className="text-yellow-600" />;
                                    trendText = "Cukup";
                                    trendColor = "text-yellow-700";
                                  } else {
                                    trendIcon = <TrendingDown size={12} className="text-red-600" />;
                                    trendText = "Perlu Perhatian";
                                    trendColor = "text-red-700";
                                  }
                                  
                                  return (
                                    <tr key={jenjang} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-5 py-3 font-semibold text-slate-800">{jenjang}</td>
                                      <td className="px-5 py-3 text-center">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm">
                                          {stats.baikTinggi}
                                        </span>
                                       </td>
                                      <td className="px-5 py-3 text-center">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-yellow-50 text-yellow-700 font-bold text-sm">
                                          {stats.sedang}
                                        </span>
                                        </td>
                                      <td className="px-5 py-3 text-center">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-sm">
                                          {stats.kurangRendah}
                                        </span>
                                        </td>
                                      <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                          {trendIcon}
                                          <span className={`text-xs font-medium ${trendColor}`}>
                                            {trendText}
                                          </span>
                                          <div className="flex-1 max-w-24 ml-1">
                                            <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                              <div 
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${baikPercent}%` }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Info Indikator */}
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 mb-6">
                      <h3 className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <Info size={12} className="text-blue-500" />
                        8 Indikator Prioritas
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRIORITY_INDICATORS.map((p: any) => (
                          <div key={p.code} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-blue-100/60">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                              {p.code}
                            </span>
                            <span className="text-xs text-slate-600 font-medium truncate">{p.fullName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-2 mb-6 items-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        <Filter size={11} />
                        <span>Filter</span>
                      </div>
                      <SelectFilter
                        value={filterJenjang}
                        onChange={setFilterJenjang}
                        options={jenjangOptionsProvinsi}
                        className="w-44"
                        icon={<School size={12} />}
                      />
                      <SelectFilter
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={statusOptionsProvinsi}
                        className="w-36"
                        icon={<Building2 size={12} />}
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        {(["Semua", "Baik / Tinggi", "Sedang", "Kurang / Rendah"] as const).map(opt => {
                          const isActive = filterCapaian === opt;
                          const colorMap: Record<string, { active: string; dot?: string }> = {
                            "Semua": { active: "bg-slate-800 text-white border-slate-800" },
                            "Baik / Tinggi": { active: "bg-emerald-600 text-white border-emerald-600", dot: "bg-emerald-500" },
                            "Sedang": { active: "bg-amber-500 text-white border-amber-500", dot: "bg-amber-400" },
                            "Kurang / Rendah": { active: "bg-red-600 text-white border-red-600", dot: "bg-red-500" },
                          };
                          const { active, dot } = colorMap[opt];
                          return (
                            <button
                              key={opt}
                              onClick={() => setFilterCapaian(opt)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                isActive
                                  ? active
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {dot && !isActive && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                              {opt === "Semua" ? "Semua" : opt}
                            </button>
                          );
                        })}
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-black text-slate-700">
                          {Object.keys(groupedProvData).filter((j: any) => filterJenjang === "Semua" || j === filterJenjang).length}
                        </span>
                        <span className="text-xs text-slate-500">Jenjang</span>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="space-y-6">
                      {Object.keys(groupedProvData)
                        .filter((j: any) => filterJenjang === "Semua" || j === filterJenjang)
                        .map(jenjang => {
                          const indikatorMap = groupedProvData[jenjang];
                          const indikatorCodes = Object.keys(indikatorMap);
                          const gradient = getJenjangGradient(jenjang);

                          let hasVisible = false;
                          for (const kode of indikatorCodes) {
                            const rows = indikatorMap[kode];
                            let filtered = rows;
                            if (filterStatus !== "Semua") filtered = filtered.filter((r: any) => r["Status Satuan Pendidikan"] === filterStatus);
                            if (filterCapaian !== "Semua") {
                              filtered = filtered.filter((r: any) => {
                                const label = ((tahun === "2025" ? r["Label Capaian 2025"] : r["Label Capaian 2024"]) ?? "").trim();
                                return capaianGroup(label) === filterCapaian;
                              });
                            }
                            if (filtered.length > 0) { hasVisible = true; break; }
                          }
                          if (!hasVisible) return null;

                          return (
                            <div key={jenjang} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                              <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                                    {jenjang.includes("SD") && <School size={14} className="text-white" />}
                                    {jenjang.includes("SMP") && <BookOpen size={14} className="text-white" />}
                                    {jenjang.includes("SMA") && <GraduationCap size={14} className="text-white" />}
                                    {jenjang.includes("PAUD") && <Building2 size={14} className="text-white" />}
                                  </div>
                                  <div>
                                    <span className="font-black text-white text-base">{jenjang}</span>
                                    <span className="text-white/60 text-xs ml-2.5">{indikatorCodes.length} indikator</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-5">
                                <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-3`}>
                                  {indikatorCodes.map(kode => {
                                    const rows = indikatorMap[kode];
                                    let filteredRows = rows;
                                    if (filterStatus !== "Semua") {
                                      filteredRows = filteredRows.filter((r: any) => r["Status Satuan Pendidikan"] === filterStatus);
                                    }
                                    if (filterCapaian !== "Semua") {
                                      filteredRows = filteredRows.filter((r: any) => {
                                        const label = ((tahun === "2025" ? r["Label Capaian 2025"] : r["Label Capaian 2024"]) ?? "").trim();
                                        return capaianGroup(label) === filterCapaian;
                                      });
                                    }
                                    if (filteredRows.length === 0) return null;

                                    const indicatorInfo = PRIORITY_INDICATORS.find((p: any) => p.code === kode);
                                    const indicatorName = indicatorInfo?.fullName || kode;
                                    const indicatorDesc = indicatorInfo?.description || "";

                                    return filteredRows.map((row: any, idx: number) => {
                                      const label = ((tahun === "2025" ? row["Label Capaian 2025"] : row["Label Capaian 2024"]) ?? "").trim();
                                      const grup = capaianGroup(label);
                                      const nilaiVal = tahun === "2025" ? row["Nilai Capaian 2025"] : row["Nilai Capaian 2024"];
                                      const perubahan = tahun === "2025" ? row["Perubahan Nilai Capaian dari Tahun Lalu"] : undefined;
                                      const borderColor = borderColorForGroup(grup);
                                      const status = row["Status Satuan Pendidikan"] || "";
                                      const isNegeri = status === "Negeri";
                                      const numericValue = nilaiVal ? parseFloat(nilaiVal) : null;
                                      
                                      return (
                                        <div
                                          key={`${kode}-${status}-${idx}`}
                                          className="group relative rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-white"
                                          style={{ borderColor: `${borderColor}40` }}
                                        >
                                          {/* Card Header */}
                                          <div 
                                            className="px-4 pt-4 pb-3"
                                            style={{ background: `linear-gradient(145deg, ${borderColor}12 0%, ${borderColor}05 100%)` }}
                                          >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                              <div className="flex items-center gap-2">
                                                <div 
                                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0"
                                                  style={{ background: borderColor }}
                                                >
                                                  {kode}
                                                </div>
                                                <div>
                                                  <p className="text-xs font-bold text-slate-800 leading-tight">{indicatorName}</p>
                                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${
                                                    isNegeri ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
                                                  }`}>
                                                    {status}
                                                  </span>
                                                </div>
                                              </div>
                                              <LabelBadge label={label} />
                                            </div>
                                            {indicatorDesc && (
                                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">
                                                {indicatorDesc}
                                              </p>
                                            )}
                                          </div>

                                          {/* Card Body */}
                                          <div className="px-4 py-3">
                                            <div className="flex items-end justify-between mb-2">
                                              <div>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                                                  Nilai {tahun}
                                                </p>
                                                <div className="flex items-baseline gap-1.5">
                                                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                                                    {nilaiVal ?? "â€“"}
                                                  </span>
                                                  {nilaiVal && (
                                                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                                                  )}
                                                </div>
                                              </div>
                                              {(() => {
                                                if (!row["Nilai Capaian 2024"] || tahun !== "2025") return null;
                                                const oldVal = parseFloat(row["Nilai Capaian 2024"]);
                                                const newVal = parseFloat(nilaiVal || "0");
                                                const diff = newVal - oldVal;
                                                if (isNaN(diff) || diff === 0) return null;
                                                return (
                                                  <div className={`text-right flex flex-col items-end`}>
                                                    <span className={`text-xs font-bold ${diff > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                      {diff > 0 ? "â–²" : "â–¼"} {Math.abs(diff).toFixed(1)}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">dari 2024</span>
                                                  </div>
                                                );
                                              })()}
                                            </div>

                                            {numericValue !== null && !isNaN(numericValue) && (
                                              <div>
                                                <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                  <div 
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${numericValue}%`, background: borderColor }}
                                                  />
                                                </div>
                                                <div className="flex justify-between mt-1 text-[9px] text-slate-300">
                                                  <span>0</span>
                                                  <span>100</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Card Footer */}
                                          {perubahan && (
                                            <div className="px-4 pb-3">
                                              <PerubahanBadge val={perubahan} />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    });
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {Object.keys(groupedProvData).filter((j: any) => filterJenjang === "Semua" || j === filterJenjang).length === 0 && (
                        <div className="text-center py-20">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-600">Tidak ada data ditemukan</p>
                          <p className="text-xs text-slate-400 mt-1">Coba ubah filter yang dipilih</p>
                        </div>
                      )}
                    </div>
                  </div>
    </>
  );
}

