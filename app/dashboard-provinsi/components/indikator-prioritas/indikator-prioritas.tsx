"use client";

import React, { useState, useMemo } from 'react';
import { BarChart3, CheckCircle2, Info, AlertCircle, ListChecks, Filter, HelpCircle } from 'lucide-react';

const JENJANG_OPTIONS = [
  { value: "Semua", label: "Semua" },
  { value: "SD", label: "SD" },
  { value: "SMP", label: "SMP" },
  { value: "SMA", label: "SMA" },
];

function normalizeJenjang(jenis: string): string {
  const j = (jenis ?? "").toUpperCase();
  if (j.startsWith("SD")) return "SD";
  if (j.startsWith("SMP") || j.startsWith("MTS")) return "SMP";
  if (j.startsWith("SMA") || j.startsWith("SMK") || j.startsWith("MA")) return "SMA";
  return jenis;
}

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
    rekapCapaian, satdikDasmen, satdikPaud,
  } = props;

  const [filterJenjangRekap, setFilterJenjangRekap] = useState<string>("Semua");

  // Aggregate jenjangStats (which is keyed by raw jenis like "SD Umum") into SD/SMP/SMA buckets
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedJenjangStats = useMemo<Record<string, any>>(() => {
    const result: Record<string, { baikTinggi: number; sedang: number; kurangRendah: number; tidakTersedia: number; total: number }> = {
      SD: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      SMP: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      SMA: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
    };
    if (!jenjangStats) return result;
    for (const [rawJenis, s] of Object.entries(jenjangStats)) {
      const norm = normalizeJenjang(rawJenis);
      if (!result[norm]) result[norm] = { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stats = s as any;
      result[norm].baikTinggi += stats.baikTinggi || 0;
      result[norm].sedang += stats.sedang || 0;
      result[norm].kurangRendah += stats.kurangRendah || 0;
      result[norm].tidakTersedia += stats.tidakTersedia || 0;
      result[norm].total += stats.total || 0;
    }
    return result;
  }, [jenjangStats]);

  // Build per-indicator stats split by normalized jenjang, computed from raw source rows
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedIndikatorStats = useMemo<Record<string, Record<string, any>>>(() => {
    const PRIORITY_CODES = Object.keys(indikatorStats || {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, Record<string, any>> = {};
    for (const code of PRIORITY_CODES) {
      result[code] = {
        Semua: { ...(indikatorStats[code] || {}) },
        SD:  { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SMP: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SMA: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceRows: any[] = rekapCapaian?.length > 0
      ? rekapCapaian
      : [...(satdikDasmen || []), ...(satdikPaud || [])];
    const useRekap = rekapCapaian?.length > 0;

    for (const row of sourceRows) {
      const rawJenis = row["Jenis Satuan Pendidikan"] || "";
      const norm = normalizeJenjang(rawJenis);
      if (!["SD", "SMP", "SMA"].includes(norm)) continue;

      for (const code of PRIORITY_CODES) {
        if (!result[code]) continue;
        let labelVal = "";
        if (useRekap) {
          labelVal = ((row[code] as string) ?? "").trim();
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const labelKey = Object.keys(row).find((k: any) => {
            const ku = k.toUpperCase();
            const cu = code.toUpperCase();
            return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
          });
          labelVal = labelKey ? (row[labelKey] ?? "").trim() : "";
        }
        if (labelVal === "Tinggi" || labelVal === "Baik") result[code][norm].baikTinggi++;
        else if (labelVal === "Sedang") result[code][norm].sedang++;
        else if (labelVal === "Kurang" || labelVal === "Rendah") result[code][norm].kurangRendah++;
        else result[code][norm].tidakTersedia++;
        result[code][norm].total++;
      }
    }
    return result;
  }, [indikatorStats, rekapCapaian, satdikDasmen, satdikPaud]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStats = (code: string): any => {
    const byCode = normalizedIndikatorStats[code];
    if (!byCode) return indikatorStats[code] || null;
    if (filterJenjangRekap === "Semua") return byCode.Semua || indikatorStats[code];
    return byCode[filterJenjangRekap] || { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
  };

  // Dashboard card totals: use aggregated jenjang stats when filtered
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardStats = useMemo<any>(() => {
    if (filterJenjangRekap === "Semua") return totalDashboardStats;
    return normalizedJenjangStats[filterJenjangRekap] || { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
  }, [filterJenjangRekap, totalDashboardStats, normalizedJenjangStats]);

  const pct = (n: number) => (cardStats?.total || 0) > 0 ? Math.round((n / cardStats.total) * 100) : 0;

  return (
    <>
      <div>
        {/* Section Header with Jenjang Filter inline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <SectionHeader
            icon={<BarChart3 size={18} />}
            title="Rekap Capaian Indikator Prioritas"
            badge={`8 Indikator Utama Tahun ${tahun} `}
          />
          {/* Jenjang Filter Pills */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter size={11} />
              Jenjang
            </span>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
              {JENJANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterJenjangRekap(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    filterJenjangRekap === opt.value
                      ? "bg-white text-blue-700 shadow-sm border border-blue-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Cards — 4 cards, no sekolah subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardCard
            title="BAIK / TINGGI"
            value={<span>{pct(cardStats?.baikTinggi || 0)}%</span>}
            icon={<CheckCircle2 size={20} className="text-white" />}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend="none"
            trendValue=""
            subtitle=""
          />
          <DashboardCard
            title="SEDANG"
            value={<span>{pct(cardStats?.sedang || 0)}%</span>}
            icon={<Info size={20} className="text-white" />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            trend="none"
            trendValue=""
            subtitle=""
          />
          <DashboardCard
            title="KURANG / RENDAH"
            value={<span>{pct(cardStats?.kurangRendah || 0)}%</span>}
            icon={<AlertCircle size={20} className="text-white" />}
            color="bg-gradient-to-br from-red-500 to-red-600"
            trend="none"
            trendValue=""
            subtitle=""
          />
          <DashboardCard
            title="TIDAK TERSEDIA"
            value={<span>{pct(cardStats?.tidakTersedia || 0)}%</span>}
            icon={<HelpCircle size={20} className="text-white" />}
            color="bg-gradient-to-br from-slate-400 to-slate-500"
            trend="none"
            trendValue=""
            subtitle=""
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
              <p className="text-[10px] text-slate-400 mt-0.5">
                Jumlah sekolah per kategori capaian indikator
                {filterJenjangRekap !== "Semua" && (
                  <span className="ml-1.5 font-semibold text-blue-600">— Jenjang {filterJenjangRekap}</span>
                )}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] w-16">Kode</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Indikator</th>
                  <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-emerald-600">Baik/Tinggi</th>
                  <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-amber-600">Sedang</th>
                  <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-red-600">Kurang/Rendah</th>
                  <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-slate-400">Tidak Tersedia</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] min-w-40">Distribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {PRIORITY_INDICATORS.map((p: any) => {
                  const s = getStats(p.code);
                  if (!s) return null;
                  const total = (s.baikTinggi || 0) + (s.sedang || 0) + (s.kurangRendah || 0) + (s.tidakTersedia || 0);
                  const baikPct = total > 0 ? Math.round(((s.baikTinggi || 0) / total) * 100) : 0;
                  const sedangPct = total > 0 ? Math.round(((s.sedang || 0) / total) * 100) : 0;
                  const kurangPct = total > 0 ? Math.round(((s.kurangRendah || 0) / total) * 100) : 0;
                  const tidakPct = total > 0 ? Math.round(((s.tidakTersedia || 0) / total) * 100) : 0;
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
                            onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Baik / Tinggi", filterJenjang: filterJenjangRekap }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                            className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-emerald-50/50 hover:bg-emerald-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-emerald-100 hover:border-emerald-300 hover:shadow-md relative overflow-hidden"
                            title={`Lihat ${s.baikTinggi} sekolah dengan capaian Baik/Tinggi`}
                          >
                            <div className="absolute inset-0 bg-emerald-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="text-xl font-black text-emerald-700 relative group-hover/btn:scale-105 transition-transform">{baikPct}%</span>
                            <span className="text-[10px] text-emerald-600 font-bold relative">{(s.baikTinggi || 0).toLocaleString("id-ID")}</span>
                          </button>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {total > 0 ? (
                          <button
                            onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Sedang", filterJenjang: filterJenjangRekap }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                            className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-amber-50/50 hover:bg-amber-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-amber-100 hover:border-amber-300 hover:shadow-md relative overflow-hidden"
                            title={`Lihat ${s.sedang} sekolah dengan capaian Sedang`}
                          >
                            <div className="absolute inset-0 bg-amber-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="text-xl font-black text-amber-600 relative group-hover/btn:scale-105 transition-transform">{sedangPct}%</span>
                            <span className="text-[10px] text-amber-600 font-bold relative">{(s.sedang || 0).toLocaleString("id-ID")}</span>
                          </button>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {total > 0 ? (
                          <button
                            onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Kurang / Rendah", filterJenjang: filterJenjangRekap }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                            className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-red-50/50 hover:bg-red-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-red-100 hover:border-red-300 hover:shadow-md relative overflow-hidden"
                            title={`Lihat ${s.kurangRendah} sekolah dengan capaian Kurang/Rendah`}
                          >
                            <div className="absolute inset-0 bg-red-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="text-xl font-black text-red-600 relative group-hover/btn:scale-105 transition-transform">{kurangPct}%</span>
                            <span className="text-[10px] text-red-600 font-bold relative">{(s.kurangRendah || 0).toLocaleString("id-ID")}</span>
                          </button>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {(s.tidakTersedia || 0) > 0 ? (
                          <button
                            onClick={() => { setSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup: "Tidak Tersedia", filterJenjang: filterJenjangRekap }); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                            className="inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-slate-50/80 hover:bg-slate-100 rounded-xl px-2 py-2 min-w-[5rem] transition-all border border-slate-200 hover:border-slate-300 hover:shadow-md relative overflow-hidden"
                            title={`Lihat ${s.tidakTersedia} sekolah dengan capaian Tidak Tersedia`}
                          >
                            <div className="absolute inset-0 bg-slate-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="text-xl font-black text-slate-400 relative group-hover/btn:scale-105 transition-transform">{tidakPct}%</span>
                            <span className="text-[10px] text-slate-400 font-bold relative">{(s.tidakTersedia || 0).toLocaleString("id-ID")}</span>
                          </button>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {total > 0 ? (
                          <div>
                            <div className="flex rounded-full overflow-hidden h-2 gap-px w-full">
                              {baikPct > 0 && <div className="h-full rounded-l-full" style={{ width: `${baikPct}%`, background: "#22c55e" }} title={`Baik/Tinggi: ${baikPct}%`} />}
                              {sedangPct > 0 && <div className="h-full" style={{ width: `${sedangPct}%`, background: "#f59e0b" }} title={`Sedang: ${sedangPct}%`} />}
                              {kurangPct > 0 && <div className="h-full" style={{ width: `${kurangPct}%`, background: "#ef4444" }} title={`Kurang/Rendah: ${kurangPct}%`} />}
                              {tidakPct > 0 && <div className="h-full rounded-r-full" style={{ width: `${tidakPct}%`, background: "#cbd5e1" }} title={`Tidak Tersedia: ${tidakPct}%`} />}
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">{total.toLocaleString("id-ID")} sekolah</p>
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
      </div>
    </>
  );
}