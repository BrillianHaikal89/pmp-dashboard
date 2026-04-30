"use client";

import React from 'react';
import { Building2, GraduationCap, Search, Filter, ChevronDown } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SatdikPaud2024(props: Record<string, any>) {
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
                      icon={<GraduationCap size={18} />}
                      title="Capaian Satuan Pendidikan â€” PAUD"
                      badge={`Tahun ${tahun} Â· SATDIK keagamaan tidak ditampilkan`}
                    />
                    <SatdikTable
                      allRows={fSP} paged={pagedSP} indKeys={iSP}
                      page={pageSP} totalPages={Math.ceil(fSP.length / PAGE_SIZE)} onPage={setPageSP}
                      search={sSP} onSearch={setSSP}
                      jenisList={oSPJ} jenisSel={fSPJ} onJenis={setFSPJ}
                      statusList={oSPS} statusSel={fSPS} onStatus={setFSPS}
                      kabList={oSPK} kabSel={fSPK} onKab={setFSPK}
                    />
                  </div>
    </>
  );
}

