"use client";

import React from 'react';
import { BarChart3, CheckCircle2, Info, AlertCircle, ListChecks, PieChart, Grid3x3, LayoutGrid, Activity, TrendingUp, Minus, TrendingDown, Search, School, BookOpen, GraduationCap, Building2, Filter } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function IndikatorPrioritas(props: Record<string, any>) {
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
                      badge={`8 Indikator Utama Tahun ${tahun} `}
                    />

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                      <DashboardCard
                        title="BAIK / TINGGI"
                        value={
                          <div className="flex items-center gap-2">
                            <span>{baikTinggiPercent}%</span>
                          </div>
                        }
                        icon={<CheckCircle2 size={20} className="text-white" />}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        trend="none"
                        trendValue={`${totalDashboardStats.baikTinggi} sekolah`}
                        subtitle={`dari total ${totalDashboardStats.total} sekolah`}
                      />
                      <DashboardCard
                        title="SEDANG"
                        value={
                          <div className="flex items-center gap-2">
                            <span>{sedangPercent}%</span>
                          </div>
                        }
                        icon={<Info size={20} className="text-white" />}
                        color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                        trend="none"
                        trendValue={`${totalDashboardStats.sedang} sekolah`}
                        subtitle={`dari total ${totalDashboardStats.total} sekolah`}
                      />
                      <DashboardCard
                        title="KURANG / RENDAH"
                        value={
                          <div className="flex items-center gap-2">
                            <span>{kurangRendahPercent}%</span>
                          </div>
                        }
                        icon={<AlertCircle size={20} className="text-white" />}
                        color="bg-gradient-to-br from-red-500 to-red-600"
                        trend="none"
                        trendValue={`${totalDashboardStats.kurangRendah} sekolah`}
                        subtitle={`dari total ${totalDashboardStats.total} sekolah`}
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
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-emerald-600">Baik/Tinggi <span className="text-[9px] font-normal opacity-60 normal-case"></span></th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-amber-600">Sedang <span className="text-[9px] font-normal opacity-60 normal-case"></span></th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-red-600">Kurang/Rendah <span className="text-[9px] font-normal opacity-60 normal-case"></span></th>
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
                                        className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-emerald-50/50 hover:bg-emerald-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-emerald-100 hover:border-emerald-300 hover:shadow-md relative overflow-hidden"
                                        title={`Lihat ${s.baikTinggi} sekolah dengan capaian Baik/Tinggi`}
                                      >
                                        <div className="absolute inset-0 bg-emerald-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                        <span className="text-xl font-black text-emerald-700 relative z-10 group-hover/btn:scale-105 transition-transform">{baikPct}%</span>
                                        <span className="text-[10px] text-emerald-600 font-bold relative z-10">{s.baikTinggi}</span>
                                      </button>
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {total > 0 ? (
                                      <button
                                        onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Sedang" }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                                        className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-amber-50/50 hover:bg-amber-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-amber-100 hover:border-amber-300 hover:shadow-md relative overflow-hidden"
                                        title={`Lihat ${s.sedang} sekolah dengan capaian Sedang`}
                                      >
                                        <div className="absolute inset-0 bg-amber-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                        <span className="text-xl font-black text-amber-600 relative z-10 group-hover/btn:scale-105 transition-transform">{sedangPct}%</span>
                                        <span className="text-[10px] text-amber-600 font-bold relative z-10">{s.sedang}</span>
                                      </button>
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {total > 0 ? (
                                      <button
                                        onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Kurang / Rendah" }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                                        className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-red-50/50 hover:bg-red-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-red-100 hover:border-red-300 hover:shadow-md relative overflow-hidden"
                                        title={`Lihat ${s.kurangRendah} sekolah dengan capaian Kurang/Rendah`}
                                      >
                                        <div className="absolute inset-0 bg-red-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                        <span className="text-xl font-black text-red-600 relative z-10 group-hover/btn:scale-105 transition-transform">{kurangPct}%</span>
                                        <span className="text-[10px] text-red-600 font-bold relative z-10">{s.kurangRendah} </span>
                                      </button>
                                    ) : <span className="text-slate-300">—</span>}
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

                
                  </div>
    </>
  );
}

