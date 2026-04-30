"use client";

import React from 'react';
import { School, BookOpen, GraduationCap, Search, Filter, Building2, ChevronDown } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SatdikDasmen2025(props: Record<string, any>) {
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
                      icon={<School size={18} />}
                      title="Capaian Satuan Pendidikan â€” Dasmen & Vokasi"
                      badge={`Tahun ${tahun} Â· SATDIK keagamaan tidak ditampilkan`}
                    />
                    <SatdikTable
                      allRows={fSD} paged={pagedSD} indKeys={iSD}
                      page={pageSD} totalPages={Math.ceil(fSD.length / PAGE_SIZE)} onPage={setPageSD}
                      search={sSD} onSearch={setSSD}
                      jenisList={oSDJ} jenisSel={fSDJ} onJenis={setFSDJ}
                      statusList={oSDS} statusSel={fSDS} onStatus={setFSDS}
                      kabList={oSDK} kabSel={fSDK} onKab={setFSDK}
                    />
                  </div>
    </>
  );
}

