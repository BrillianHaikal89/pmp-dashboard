"use client";

import React from 'react';
import { School, BookOpen, GraduationCap, Search, Filter, Building2, TrendingUp, TrendingDown, Minus, BarChart3, MapPin } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function KabkotDasmen2024(props: Record<string, any>) {
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
                      icon={<MapPin size={18} />}
                      title="Capaian Kab/Kota â€” Dasmen & Vokasi"
                      badge={`Tahun ${tahun}`}
                    />
                    <KabkotTable
                      rows={fKD} indKeys={iKD}
                      search={sKD} onSearch={setSKD}
                      jenisList={oKDJ} jenisSel={fKDJ} onJenis={setFKDJ}
                      statusList={oKDS} statusSel={fKDS} onStatus={setFKDS}
                    />
                  </div>
    </>
  );
}

