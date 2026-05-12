"use client";

import React, { useState, useMemo } from 'react';
import { BarChart3, CheckCircle2, Info, AlertCircle, ListChecks, Filter, HelpCircle, TrendingUp, TrendingDown, Minus, ArrowUpDown, Trophy, Medal } from 'lucide-react';

const JENJANG_OPTIONS = [
  { value: "Semua", label: "Semua" },
  { value: "SD", label: "SD" },
  { value: "SMP", label: "SMP" },
  { value: "SMA", label: "SMA" },
];

function normalizeJenjang(jenis: string): string {
  const j = (jenis ?? "").toUpperCase();
  // PAUD: TK, KB, TPA, SPS, PAUD (any variant)
  if (j.startsWith("TK") || j.startsWith("KB") || j.startsWith("TPA") || j.startsWith("SPS") || j.startsWith("PAUD")) return "PAUD";
  if (j.startsWith("SD") || j.startsWith("MI")) return "SD";
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
    // New: indikator menurun meningkat data
    indikatorMenurunMeningkat,
    // New: 10 indikator tertinggi dan terendah
    indikatorTertinggiTerendah,
    ttTahunSumber,
  } = props;

  const [filterJenjangRekap, setFilterJenjangRekap] = useState<string>("Semua");

  // ─── State untuk filter 10 tertinggi/terendah ────────────────────────────────
  const [filterIndikatorTT, setFilterIndikatorTT] = useState<string>("Semua");
  const [filterJenjangTT, setFilterJenjangTT] = useState<string>("Semua");
  const [filterStatusTT, setFilterStatusTT] = useState<string>("Semua");
  const PRIORITY_CODES_TT = ["A.1", "A.2", "A.3", "D.1", "D.3", "D.4", "D.8", "D.10"];

  // Hitung skor rata-rata perubahan nilai per satdik dari data 10_indikator_tertinggi_terendah
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttData: any[] = useMemo(() => {
    if (!Array.isArray(indikatorTertinggiTerendah)) return [];
    return indikatorTertinggiTerendah;
  }, [indikatorTertinggiTerendah]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttProcessed = useMemo<{ row: any; skor: number; indDetail: Record<string, { arah: string; nilai: number }> }[]>(() => {
    if (ttData.length === 0) return [];
    const codes = filterIndikatorTT === "Semua" ? PRIORITY_CODES_TT : [filterIndikatorTT];
    return ttData
      .filter(row => {
        const norm = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
        if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
        const status = (row["Status Satuan Pendidikan"] || "").trim();
        if (!["Negeri", "Swasta"].includes(status)) return false;
        if (filterJenjangTT !== "Semua" && norm !== filterJenjangTT) return false;
        if (filterStatusTT !== "Semua" && status !== filterStatusTT) return false;
        return true;
      })
      .map(row => {
        const indDetail: Record<string, { arah: string; nilai: number }> = {};
        let totalNilai = 0;
        let countValid = 0;
        for (const code of codes) {
          // Support both flat format: "A.1 - Perubahan dari Tahun Lalu" / "A.1 - Perubahan Nilai"
          // and nested object format: row[code]["Perubahan dari Tahun Lalu"]
          let arah = "";
          let nilaiStr = "";
          const flatArahKey = `${code} - Perubahan dari Tahun Lalu`;
          const flatNilaiKey = `${code} - Perubahan Nilai`;
          if (flatArahKey in row) {
            // Flat format (JSON dari field langsung)
            arah = (row[flatArahKey] as string) ?? "";
            nilaiStr = ((row[flatNilaiKey] as string) ?? "").replace(",", ".");
          } else {
            // Nested object format (format lama)
            const ind = row[code];
            if (!ind || typeof ind !== "object") continue;
            arah = (ind["Perubahan dari Tahun Lalu"] as string) ?? "";
            nilaiStr = ((ind["Perubahan Nilai"] as string) ?? "").replace(",", ".");
          }
          const nilai = parseFloat(nilaiStr);
          if (isNaN(nilai) || arah.toLowerCase().includes("tidak tersedia")) continue;
          const nilaiSigned = arah.toLowerCase() === "naik" ? nilai : arah.toLowerCase() === "turun" ? -nilai : 0;
          indDetail[code] = { arah, nilai };
          totalNilai += nilaiSigned;
          countValid++;
        }
        const skor = countValid > 0 ? totalNilai / countValid : 0;
        return { row, skor, indDetail };
      })
      .filter(d => Object.keys(d.indDetail).length > 0);
  }, [ttData, filterIndikatorTT, filterJenjangTT, filterStatusTT]);

  const top10Tertinggi = useMemo(
    () => [...ttProcessed].sort((a, b) => b.skor - a.skor).slice(0, 10),
    [ttProcessed]
  );

  const top10Terendah = useMemo(
    () => [...ttProcessed].sort((a, b) => a.skor - b.skor).slice(0, 10),
    [ttProcessed]
  );

  // ─── Rekap meningkat / menurun / tetap PER INDIKATOR dari ttProcessed ──────
  const ttSummaryPerInd = useMemo(() => {
    // Selalu hitung dari semua kode prioritas, bukan hanya filterIndikatorTT
    const result: Record<string, { meningkat: number; menurun: number; tetap: number; tidakTersedia: number; total: number }> = {};
    for (const code of PRIORITY_CODES_TT) {
      result[code] = { meningkat: 0, menurun: 0, tetap: 0, tidakTersedia: 0, total: 0 };
    }
    // Iterasi semua baris ttData yang lolos filter jenjang & status (tanpa filter indikator)
    for (const rawRow of ttData) {
      const norm = normalizeJenjang(rawRow["Jenis Satuan Pendidikan"] || "");
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) continue;
      const status = (rawRow["Status Satuan Pendidikan"] || "").trim();
      if (!["Negeri", "Swasta"].includes(status)) continue;
      if (filterJenjangTT !== "Semua" && norm !== filterJenjangTT) continue;
      if (filterStatusTT !== "Semua" && status !== filterStatusTT) continue;
      for (const code of PRIORITY_CODES_TT) {
        let arah = "";
        const flatArahKey = `${code} - Perubahan dari Tahun Lalu`;
        const flatNilaiKey = `${code} - Perubahan Nilai`;
        if (flatArahKey in rawRow) {
          arah = (rawRow[flatArahKey] as string) ?? "";
        } else {
          const ind = rawRow[code];
          if (!ind || typeof ind !== "object") {
            result[code].tidakTersedia++;
            result[code].total++;
            continue;
          }
          arah = (ind["Perubahan dari Tahun Lalu"] as string) ?? "";
        }
        const flatNilai = flatNilaiKey in rawRow
          ? parseFloat(((rawRow[flatNilaiKey] as string) ?? "").replace(",", "."))
          : NaN;
        const nilaiValid = !isNaN(flatNilai) || flatArahKey in rawRow;
        if (arah.toLowerCase().includes("tidak tersedia") || (!nilaiValid && !(flatArahKey in rawRow))) {
          result[code].tidakTersedia++;
        } else if (arah.toLowerCase() === "naik") {
          result[code].meningkat++;
        } else if (arah.toLowerCase() === "turun") {
          result[code].menurun++;
        } else {
          result[code].tetap++;
        }
        result[code].total++;
      }
    }
    return result;
  }, [ttData, filterJenjangTT, filterStatusTT]);

  // ─── Filter states untuk section menurun/meningkat ───────────────────────────
  const [filterJenjangMMT, setFilterJenjangMMT] = useState<string>("Semua"); // SD | SMP | SMA | Semua
  const [filterStatusMMT, setFilterStatusMMT] = useState<string>("Semua");   // Negeri | Swasta | Semua
  const [pageMMT, setPageMMT] = useState<number>(1);
  const MMT_PAGE_SIZE = 10;
  // ─── Detail modal state ───────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detailModal, setDetailModal] = useState<{ rows: Record<string, string>[]; title: string; label: string } | null>(null);

  // Aggregate jenjangStats (which is keyed by raw jenis like "SD Umum") into SD/SMP/SMA buckets
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedJenjangStats = useMemo<Record<string, any>>(() => {
    const result: Record<string, { baikTinggi: number; sedang: number; kurangRendah: number; tidakTersedia: number; total: number }> = {
      PAUD: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
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
        PAUD: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SD:   { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SMP:  { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SMA:  { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
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
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) continue;

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

  const pct = (n: number) => (cardStats?.total || 0) > 0 ? ((n / cardStats.total) * 100).toFixed(2) : "0.00";

  // ─── Compute filter options & filtered rows untuk Menurun/Meningkat ───────────
  const mmtData: Record<string, string>[] = useMemo(() => {
    if (!Array.isArray(indikatorMenurunMeningkat)) return [];
    return indikatorMenurunMeningkat;
  }, [indikatorMenurunMeningkat]);

  // Jenjang & Status options are fixed — no longer derived from data (avoids duplicate-key error)
  const MMT_JENJANG_OPTIONS = ["Semua", "PAUD", "SD", "SMP", "SMA"] as const;
  const MMT_STATUS_OPTIONS = ["Semua", "Negeri", "Swasta"] as const;

  // Classify each row's perubahan: "Naik", "Turun", "Tidak Berubah", "Tidak Tersedia"
  function classifyPerubahan(val: string): "Naik" | "Turun" | "Tidak Berubah" | "Tidak Tersedia" {
    const v = (val ?? "").toLowerCase();
    if (v.includes("naik")) return "Naik";
    if (v.includes("turun")) return "Turun";
    if (v.includes("tidak berubah")) return "Tidak Berubah";
    return "Tidak Tersedia";
  }

  const mmtFiltered = useMemo(() => {
    return mmtData.filter(row => {
      // Only include rows with valid jenjang (PAUD/SD/SMP/SMA) — exclude "Semua" and unknown
      const norm = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
      // Only include rows with Negeri or Swasta status — exclude rows where Status = "Semua"
      const status = (row["Status Satuan Pendidikan"] || "").trim();
      if (!["Negeri", "Swasta"].includes(status)) return false;
      // Filter by selected jenjang
      if (filterJenjangMMT !== "Semua" && norm !== filterJenjangMMT) return false;
      // Filter by selected status
      if (filterStatusMMT !== "Semua" && status !== filterStatusMMT) return false;
      return true;
    });
  }, [mmtData, filterJenjangMMT, filterStatusMMT]);

  // Detect "Perubahan" key dynamically: 2024 data uses "...Tahun 2023", 2025 uses "...Tahun 2024"
  const perubahanKey = useMemo(() => {
    if (mmtData.length === 0) return "Perubahan Nilai Capaian dari Tahun 2023";
    const row = mmtData[0];
    return (
      Object.keys(row).find(k => k.toLowerCase().startsWith("perubahan nilai capaian dari tahun"))
      ?? "Perubahan Nilai Capaian dari Tahun 2023"
    );
  }, [mmtData]);

  // Summary stats untuk header cards
  const mmtSummary = useMemo(() => {
    let naik = 0, turun = 0, tetap = 0, tidakTersedia = 0;
    for (const row of mmtFiltered) {
      const cls = classifyPerubahan(row[perubahanKey] || "");
      if (cls === "Naik") naik++;
      else if (cls === "Turun") turun++;
      else if (cls === "Tidak Berubah") tetap++;
      else tidakTersedia++;
    }
    return { naik, turun, tetap, tidakTersedia, total: naik + turun + tetap + tidakTersedia };
  }, [mmtFiltered, perubahanKey]);

  // Determine the "perubahan" column key - tahun 2024 uses "Perubahan Nilai Capaian dari Tahun 2023"
  // tahun 2025 uses "Perubahan Nilai Capaian dari Tahun 2024" — detected dynamically above
  // Detect BOTH nilai capaian keys dynamically (current year & previous year)
  const { nilaiCapaianKeyTahunIni, nilaiCapaianKeyTahunLalu, labelTahunIni, labelTahunLalu } = useMemo(() => {
    if (mmtData.length === 0) return { nilaiCapaianKeyTahunIni: "Nilai Capaian 2024", nilaiCapaianKeyTahunLalu: "Nilai Capaian 2023", labelTahunIni: "2024", labelTahunLalu: "2023" };
    const row = mmtData[0];
    // Find all "Nilai Capaian 20xx" keys
    const nilaiKeys = Object.keys(row).filter(k => /nilai capaian 20\d\d$/i.test(k));
    // Sort descending to get latest first
    nilaiKeys.sort((a, b) => b.localeCompare(a));
    const keyIni = nilaiKeys[0] ?? "Nilai Capaian 2024";
    const keyLalu = nilaiKeys[1] ?? "Nilai Capaian 2023";
    // Extract year numbers from keys
    const yearIni = keyIni.match(/\d{4}/)?.[0] ?? "2024";
    const yearLalu = keyLalu.match(/\d{4}/)?.[0] ?? "2023";
    return { nilaiCapaianKeyTahunIni: keyIni, nilaiCapaianKeyTahunLalu: keyLalu, labelTahunIni: yearIni, labelTahunLalu: yearLalu };
  }, [mmtData]);

  // Keep nilaiCapaianKey2024 as alias for backward compat with labelCapaianKey2024 usage
  const nilaiCapaianKey2024 = nilaiCapaianKeyTahunIni;

  const labelCapaianKey2024 = useMemo(() => {
    if (mmtData.length === 0) return "Label Capaian 2024";
    const row = mmtData[0];
    return Object.keys(row).find(k => k.toLowerCase().includes("label capaian 20")) ?? "Label Capaian 2024";
  }, [mmtData]);

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
                  const baikPct = total > 0 ? ((s.baikTinggi || 0) / total * 100).toFixed(2) : "0.00";
                  const sedangPct = total > 0 ? ((s.sedang || 0) / total * 100).toFixed(2) : "0.00";
                  const kurangPct = total > 0 ? ((s.kurangRendah || 0) / total * 100).toFixed(2) : "0.00";
                  const tidakPct = total > 0 ? ((s.tidakTersedia || 0) / total * 100).toFixed(2) : "0.00";
                  const baikNum = total > 0 ? (s.baikTinggi || 0) / total * 100 : 0;
                  const sedangNum = total > 0 ? (s.sedang || 0) / total * 100 : 0;
                  const kurangNum = total > 0 ? (s.kurangRendah || 0) / total * 100 : 0;
                  const tidakNum = total > 0 ? (s.tidakTersedia || 0) / total * 100 : 0;
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
                            <span className="text-[10px] text-emerald-600 font-bold relative">{(s.baikTinggi || 0).toLocaleString("id-ID")} Sekolah</span>
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
                            <span className="text-[10px] text-amber-600 font-bold relative">{(s.sedang || 0).toLocaleString("id-ID")} Sekolah</span>
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
                            <span className="text-[10px] text-red-600 font-bold relative">{(s.kurangRendah || 0).toLocaleString("id-ID")} Sekolah</span>
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
                            <span className="text-[10px] text-slate-400 font-bold relative">{(s.tidakTersedia || 0).toLocaleString("id-ID")} Sekolah</span>
                          </button>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {total > 0 ? (
                          <div>
                            <div className="flex rounded-full overflow-hidden h-2 gap-px w-full">
                              {baikNum > 0 && <div className="h-full rounded-l-full" style={{ width: `${baikNum}%`, background: "#22c55e" }} title={`Baik/Tinggi: ${baikPct}%`} />}
                              {sedangNum > 0 && <div className="h-full" style={{ width: `${sedangNum}%`, background: "#f59e0b" }} title={`Sedang: ${sedangPct}%`} />}
                              {kurangNum > 0 && <div className="h-full" style={{ width: `${kurangNum}%`, background: "#ef4444" }} title={`Kurang/Rendah: ${kurangPct}%`} />}
                              {tidakNum > 0 && <div className="h-full rounded-r-full" style={{ width: `${tidakNum}%`, background: "#cbd5e1" }} title={`Tidak Tersedia: ${tidakPct}%`} />}
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

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION BARU: Indikator Menurun & Meningkat
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mt-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <SectionHeader
            icon={<ArrowUpDown size={18} />}
            title="Indikator Menurun &amp; Meningkat"
            badge={`Perubahan Capaian Tahun ${tahun}`}
          />
        </div>

        {/* Summary cards — percentage prominent */}
        {mmtData.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-5">
            {/* Meningkat */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Meningkat</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-600 leading-none">{mmtSummary.total > 0 ? ((mmtSummary.naik / mmtSummary.total) * 100).toFixed(2) : "0.00"}%</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{mmtSummary.naik}</span>
                </div>
                <div className="h-1 rounded-full bg-emerald-100 overflow-hidden mt-1.5">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${mmtSummary.total > 0 ? (mmtSummary.naik / mmtSummary.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            {/* Menurun */}
            <div className="bg-white rounded-xl border border-red-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <TrendingDown size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Menurun</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-red-600 leading-none">{mmtSummary.total > 0 ? ((mmtSummary.turun / mmtSummary.total) * 100).toFixed(2) : "0.00"}%</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{mmtSummary.turun}</span>
                </div>
                <div className="h-1 rounded-full bg-red-100 overflow-hidden mt-1.5">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${mmtSummary.total > 0 ? (mmtSummary.turun / mmtSummary.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            {/* Tidak Berubah */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <Minus size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tidak Berubah</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-600 leading-none">{mmtSummary.total > 0 ? ((mmtSummary.tetap / mmtSummary.total) * 100).toFixed(2) : "0.00"}%</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{mmtSummary.tetap}</span>
                </div>
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                  <div className="h-full rounded-full bg-slate-400" style={{ width: `${mmtSummary.total > 0 ? (mmtSummary.tetap / mmtSummary.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            {/* Tidak Tersedia */}
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <Info size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tdk Tersedia</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-blue-600 leading-none">{mmtSummary.total > 0 ? ((mmtSummary.tidakTersedia / mmtSummary.total) * 100).toFixed(2) : "0.00"}%</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{mmtSummary.tidakTersedia}</span>
                </div>
                <div className="h-1 rounded-full bg-blue-100 overflow-hidden mt-1.5">
                  <div className="h-full rounded-full bg-blue-400" style={{ width: `${mmtSummary.total > 0 ? (mmtSummary.tidakTersedia / mmtSummary.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar — select dropdowns */}
        <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Filter Jenjang — select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Filter size={11} />
              Jenis Satuan Pendidikan
            </span>
            <select
              value={filterJenjangMMT}
              onChange={e => { setFilterJenjangMMT(e.target.value); setPageMMT(1); }}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 cursor-pointer transition-colors hover:bg-white"
            >
              {MMT_JENJANG_OPTIONS.map(opt => (
                <option key={`jenjang-${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Filter Status — select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Status Satuan Pendidikan</span>
            <select
              value={filterStatusMMT}
              onChange={e => { setFilterStatusMMT(e.target.value); setPageMMT(1); }}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 cursor-pointer transition-colors hover:bg-white"
            >
              {MMT_STATUS_OPTIONS.map(opt => (
                <option key={`status-${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Count badge */}
          <div className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-black text-slate-700">{mmtFiltered.length}</span>
            <span className="text-xs text-slate-500">data</span>
          </div>
        </div>

        {/* Table */}
        {mmtData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <ArrowUpDown size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-600 mb-1">Data Belum Tersedia</p>
            <p className="text-xs text-slate-400">
              File <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">indikator_menurun_meningkat.json</code> tidak ditemukan untuk tahun {tahun}.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                <ListChecks size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Perubahan Nilai Capaian Indikator Prioritas
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Nilai capaian dan perubahan per indikator — {mmtFiltered.length.toLocaleString("id-ID")} baris
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] w-52">No / Indikator</th>
                    <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Jenis Satuan Pendidikan</th>
                    <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status Satuan Pendidikan</th>
                    <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Nilai Capaian {labelTahunLalu}</th>
                    <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Nilai Capaian {labelTahunIni}</th>
                    <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Perubahan dari {labelTahunLalu}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mmtFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400">
                        <p className="text-xs">Tidak ada data sesuai filter</p>
                      </td>
                    </tr>
                  ) : mmtFiltered.slice((pageMMT - 1) * MMT_PAGE_SIZE, pageMMT * MMT_PAGE_SIZE).map((row, idx) => {
                    const noCode = row["No"] || "";
                    // Find matching indicator info from PRIORITY_INDICATORS
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const indInfo = (PRIORITY_INDICATORS as any[]).find((p: any) => p.code === noCode);
                    const perubahan = row[perubahanKey] || "–";
                    const nilaiCapaian2023 = row[nilaiCapaianKeyTahunLalu] || "–";
                    const nilaiCapaian2024 = row[nilaiCapaianKeyTahunIni] || "–";
                    const cls = classifyPerubahan(perubahan);
                    return (
                      <tr key={`mmt-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                        {/* No / Indikator — styled like the image */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 flex-shrink-0 leading-tight">
                              {noCode || "–"}
                            </span>
                            {indInfo && (
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight">{indInfo.fullName}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{indInfo.description}</p>
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Jenis Satuan Pendidikan */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-slate-800">{row["Jenis Satuan Pendidikan"] || "–"}</p>
                        </td>
                        {/* Status Satuan Pendidikan */}
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            row["Status Satuan Pendidikan"] === "Negeri"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : row["Status Satuan Pendidikan"] === "Swasta"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>{row["Status Satuan Pendidikan"] || "–"}</span>
                        </td>
                        {/* Nilai Capaian 2023 */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-sm font-semibold text-slate-600">{nilaiCapaian2023}</span>
                        </td>
                        {/* Nilai Capaian 2024 */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-sm font-bold text-slate-800">{nilaiCapaian2024}</span>
                        </td>
                        {/* Perubahan */}
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            cls === "Naik"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : cls === "Turun"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : cls === "Tidak Berubah"
                              ? "bg-slate-50 text-slate-600 border-slate-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>
                            {cls === "Naik" && <TrendingUp size={11} />}
                            {cls === "Turun" && <TrendingDown size={11} />}
                            {cls === "Tidak Berubah" && <Minus size={11} />}
                            {perubahan}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination footer */}
            {mmtFiltered.length > MMT_PAGE_SIZE && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60">
                <span className="text-[11px] text-slate-400">
                  Menampilkan <span className="font-bold text-slate-600">{(pageMMT - 1) * MMT_PAGE_SIZE + 1}–{Math.min(pageMMT * MMT_PAGE_SIZE, mmtFiltered.length)}</span> dari <span className="font-bold text-slate-600">{mmtFiltered.length}</span> data
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPageMMT(1)}
                    disabled={pageMMT === 1}
                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 text-slate-600"
                    title="Halaman pertama"
                  >«</button>
                  <button
                    onClick={() => setPageMMT(p => Math.max(1, p - 1))}
                    disabled={pageMMT === 1}
                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 text-slate-600"
                    title="Sebelumnya"
                  >‹</button>
                  {Array.from({ length: Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE) }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE) || Math.abs(p - pageMMT) <= 1)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && typeof arr[i-1] === "number" && (p as number) - (arr[i-1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === "…" ? (
                      <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageMMT(p as number)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          pageMMT === p
                            ? "bg-blue-600 text-white shadow-sm"
                            : "hover:bg-slate-200 text-slate-600"
                        }`}
                      >{p}</button>
                    ))
                  }
                  <button
                    onClick={() => setPageMMT(p => Math.min(Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE), p + 1))}
                    disabled={pageMMT === Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE)}
                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 text-slate-600"
                    title="Berikutnya"
                  >›</button>
                  <button
                    onClick={() => setPageMMT(Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE))}
                    disabled={pageMMT === Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE)}
                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 text-slate-600"
                    title="Halaman terakhir"
                  >»</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: 10 Indikator Tertinggi & 10 Indikator Terendah
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mt-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <SectionHeader
            icon={<Trophy size={18} />}
            title="10 Indikator Peningkatan Tertinggi &amp; Terendah"
            badge={`Satuan Pendidikan dengan Perubahan Capaian Terbesar & Terkecil${ttTahunSumber && ttTahunSumber !== tahun ? ` — Data Tahun ${ttTahunSumber} (data ${tahun} belum tersedia)` : ` — Tahun ${tahun}`}`}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-4 items-center mb-5 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Filter Indikator */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Filter size={11} />
              Indikator
            </span>
            <select
              value={filterIndikatorTT}
              onChange={e => setFilterIndikatorTT(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 cursor-pointer transition-colors hover:bg-white"
            >
              <option value="Semua">Semua Indikator</option>
              {PRIORITY_CODES_TT.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          {/* Filter Jenjang */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Jenis Satdik</span>
            <select
              value={filterJenjangTT}
              onChange={e => setFilterJenjangTT(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 cursor-pointer transition-colors hover:bg-white"
            >
              {["Semua", "PAUD", "SD", "SMP", "SMA"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</span>
            <select
              value={filterStatusTT}
              onChange={e => setFilterStatusTT(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 cursor-pointer transition-colors hover:bg-white"
            >
              {["Semua", "Negeri", "Swasta"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Count badge */}
          <div className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-black text-slate-700">{ttProcessed.length.toLocaleString("id-ID")}</span>
            <span className="text-xs text-slate-500">satdik</span>
          </div>
        </div>

        {ttData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Trophy size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-600 mb-1">Data Belum Tersedia</p>
            <p className="text-xs text-slate-400">
              File <code className="bg-slate-100 px-1 rounded text-[10px]">10_indikator_tertinggi_terendah.json</code> belum tersedia untuk tahun {tahun} maupun tahun sebelumnya.
            </p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ── 10 Indikator TERTINGGI ── */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-emerald-100 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" }}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-800">10 Indikator Peningkatan Tertinggi</h3>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Satdik dengan rata-rata kenaikan terbesar</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-emerald-50/60 border-b border-emerald-100">
                      <th className="px-3 py-2.5 text-left font-bold text-emerald-700 uppercase tracking-wider text-[9px] w-7">#</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Satuan Pendidikan</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Kab/Kota</th>
                      <th className="px-3 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">Jenis</th>
                      {filterIndikatorTT !== "Semua" ? (
                        <th className="px-3 py-2.5 text-center font-bold text-emerald-600 uppercase tracking-wider text-[9px]">{filterIndikatorTT}</th>
                      ) : (
                        PRIORITY_CODES_TT.map(code => (
                          <th key={code} className="px-2 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">{code}</th>
                        ))
                      )}
                      <th className="px-3 py-2.5 text-center font-bold text-emerald-700 uppercase tracking-wider text-[9px]">Rata-rata Peningkatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {top10Tertinggi.length === 0 ? (
                      <tr><td colSpan={filterIndikatorTT !== "Semua" ? 6 : 12} className="text-center py-8 text-slate-400 text-xs">Tidak ada data sesuai filter</td></tr>
                    ) : top10Tertinggi.map(({ row, skor, indDetail }, idx) => (
                      <tr key={`tertinggi-${row.NPSN || ""}-${row["Jenis Satuan Pendidikan"] || ""}-${idx}`} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="px-3 py-2.5">
                          {idx === 0 ? (
                            <span className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-black text-yellow-900 shadow-sm">1</span>
                          ) : idx === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-black text-slate-700 shadow-sm">2</span>
                          ) : idx === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-600/70 flex items-center justify-center text-[10px] font-black text-amber-950 shadow-sm">3</span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400">{idx + 1}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-800 leading-snug text-[11px]">{row["Nama Satuan Pendidikan"]}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{row.NPSN}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-[10px] text-slate-500">{row["Kabupaten/Kota"]}</p>
                          <p className="text-[9px] text-slate-400">{row.Kecamatan}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                            {normalizeJenjang(row["Jenis Satuan Pendidikan"] || "")}
                          </span>
                        </td>
                        {filterIndikatorTT !== "Semua" ? (
                          <td className="px-3 py-2.5 text-center">
                            {indDetail[filterIndikatorTT] ? (
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                indDetail[filterIndikatorTT].arah === "Naik"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : indDetail[filterIndikatorTT].arah === "Turun"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {indDetail[filterIndikatorTT].arah === "Naik" && <TrendingUp size={9} />}
                                {indDetail[filterIndikatorTT].arah === "Turun" && <TrendingDown size={9} />}
                                {indDetail[filterIndikatorTT].nilai.toFixed(2)}
                              </span>
                            ) : <span className="text-slate-300 text-[10px]">–</span>}
                          </td>
                        ) : (
                          PRIORITY_CODES_TT.map(code => (
                            <td key={code} className="px-2 py-2.5 text-center">
                              {indDetail[code] ? (
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                  indDetail[code].arah === "Naik"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : indDetail[code].arah === "Turun"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}>
                                  {indDetail[code].arah === "Naik" && <TrendingUp size={8} />}
                                  {indDetail[code].arah === "Turun" && <TrendingDown size={8} />}
                                  {indDetail[code].nilai.toFixed(2)}
                                </span>
                              ) : <span className="text-slate-200 text-[9px]">–</span>}
                            </td>
                          ))
                        )}
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black border ${
                            skor >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {skor >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {skor >= 0 ? "+" : ""}{skor.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 10 Indikator TERENDAH ── */}
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)" }}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <TrendingDown size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-red-800">10 Indikator Peningkatan Terendah</h3>
                  <p className="text-[10px] text-red-500 mt-0.5">Satdik dengan rata-rata penurunan terbesar</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-red-50/60 border-b border-red-100">
                      <th className="px-3 py-2.5 text-left font-bold text-red-700 uppercase tracking-wider text-[9px] w-7">#</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Satuan Pendidikan</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Kab/Kota</th>
                      <th className="px-3 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">Jenis</th>
                      {filterIndikatorTT !== "Semua" ? (
                        <th className="px-3 py-2.5 text-center font-bold text-red-600 uppercase tracking-wider text-[9px]">{filterIndikatorTT}</th>
                      ) : (
                        PRIORITY_CODES_TT.map(code => (
                          <th key={code} className="px-2 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">{code}</th>
                        ))
                      )}
                      <th className="px-3 py-2.5 text-center font-bold text-red-700 uppercase tracking-wider text-[9px]">Rata-rata Peningkatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {top10Terendah.length === 0 ? (
                      <tr><td colSpan={filterIndikatorTT !== "Semua" ? 6 : 12} className="text-center py-8 text-slate-400 text-xs">Tidak ada data sesuai filter</td></tr>
                    ) : top10Terendah.map(({ row, skor, indDetail }, idx) => (
                      <tr key={`terendah-${row.NPSN || ""}-${row["Jenis Satuan Pendidikan"] || ""}-${idx}`} className="hover:bg-red-50/40 transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-bold text-slate-400">{idx + 1}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-800 leading-snug text-[11px]">{row["Nama Satuan Pendidikan"]}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{row.NPSN}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-[10px] text-slate-500">{row["Kabupaten/Kota"]}</p>
                          <p className="text-[9px] text-slate-400">{row.Kecamatan}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                            {normalizeJenjang(row["Jenis Satuan Pendidikan"] || "")}
                          </span>
                        </td>
                        {filterIndikatorTT !== "Semua" ? (
                          <td className="px-3 py-2.5 text-center">
                            {indDetail[filterIndikatorTT] ? (
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                indDetail[filterIndikatorTT].arah === "Naik"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : indDetail[filterIndikatorTT].arah === "Turun"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {indDetail[filterIndikatorTT].arah === "Naik" && <TrendingUp size={9} />}
                                {indDetail[filterIndikatorTT].arah === "Turun" && <TrendingDown size={9} />}
                                {indDetail[filterIndikatorTT].nilai.toFixed(2)}
                              </span>
                            ) : <span className="text-slate-300 text-[10px]">–</span>}
                          </td>
                        ) : (
                          PRIORITY_CODES_TT.map(code => (
                            <td key={code} className="px-2 py-2.5 text-center">
                              {indDetail[code] ? (
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                  indDetail[code].arah === "Naik"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : indDetail[code].arah === "Turun"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}>
                                  {indDetail[code].arah === "Naik" && <TrendingUp size={8} />}
                                  {indDetail[code].arah === "Turun" && <TrendingDown size={8} />}
                                  {indDetail[code].nilai.toFixed(2)}
                                </span>
                              ) : <span className="text-slate-200 text-[9px]">–</span>}
                            </td>
                          ))
                        )}
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black border ${
                            skor >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {skor >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {skor >= 0 ? "+" : ""}{skor.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ═══ SECTION: Rekap Perubahan Capaian per Indikator ═══ */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <SectionHeader
                icon={<ListChecks size={18} />}
                title="Rekap Jumlah Sekolah yang Meningkat dan Menurun Indikator Prioritas"
                badge={`Jumlah satdik meningkat, menurun, dan tetap per indikator${ttTahunSumber && ttTahunSumber !== tahun ? ` — Data Tahun ${ttTahunSumber}` : ` — Tahun ${tahun}`}`}
              />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] w-16">Kode</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Indikator</th>
                      <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-emerald-600">Meningkat</th>
                      <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-red-600">Menurun</th>
                      <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-amber-500">Tetap</th>
                      <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-slate-400">Tidak Tersedia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {PRIORITY_CODES_TT.map((code) => {
                      const s = ttSummaryPerInd[code];
                      if (!s) return null;
                      const total = s.total;
                      const meningkatPct = total > 0 ? ((s.meningkat / total) * 100).toFixed(2) : "0.00";
                      const menurunPct   = total > 0 ? ((s.menurun   / total) * 100).toFixed(2) : "0.00";
                      const tetapPct     = total > 0 ? ((s.tetap     / total) * 100).toFixed(2) : "0.00";
                      const tidakPct     = total > 0 ? ((s.tidakTersedia / total) * 100).toFixed(2) : "0.00";
                      // Nilai numerik untuk lebar bar
                      const meningkatNum = total > 0 ? (s.meningkat / total) * 100 : 0;
                      const menurunNum   = total > 0 ? (s.menurun   / total) * 100 : 0;
                      const tetapNum     = total > 0 ? (s.tetap     / total) * 100 : 0;
                      const tidakNum     = total > 0 ? (s.tidakTersedia / total) * 100 : 0;
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const indInfo = (PRIORITY_INDICATORS as any[])?.find((p: any) => p.code === code);
                      return (
                        <tr key={`tt-rekap-${code}`} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                              {code}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {indInfo ? (
                              <>
                                <p className="text-sm font-semibold text-slate-800">{indInfo.fullName}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{indInfo.description}</p>
                              </>
                            ) : (
                              <p className="text-sm font-semibold text-slate-800">{code}</p>
                            )}
                          </td>
                          {/* Meningkat */}
                          <td className="px-5 py-3.5 text-center">
                            {total > 0 ? (
                              <div className="inline-flex flex-col items-center justify-center gap-0.5 bg-emerald-50/60 rounded-xl px-2 py-2 min-w-[5rem] border border-emerald-100">
                                <span className="text-xl font-black text-emerald-700">{meningkatPct}%</span>
                                <span className="text-[10px] text-emerald-600 font-bold">{s.meningkat.toLocaleString("id-ID")} Sekolah</span>
                              </div>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          {/* Menurun */}
                          <td className="px-5 py-3.5 text-center">
                            {total > 0 ? (
                              <div className="inline-flex flex-col items-center justify-center gap-0.5 bg-red-50/60 rounded-xl px-2 py-2 min-w-[5rem] border border-red-100">
                                <span className="text-xl font-black text-red-600">{menurunPct}%</span>
                                <span className="text-[10px] text-red-600 font-bold">{s.menurun.toLocaleString("id-ID")}Sekolah</span>
                              </div>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          {/* Tetap */}
                          <td className="px-5 py-3.5 text-center">
                            {total > 0 ? (
                              <div className="inline-flex flex-col items-center justify-center gap-0.5 bg-amber-50/60 rounded-xl px-2 py-2 min-w-[5rem] border border-amber-100">
                                <span className="text-xl font-black text-amber-600">{tetapPct}%</span>
                                <span className="text-[10px] text-amber-600 font-bold">{s.tetap.toLocaleString("id-ID")} Sekolah</span>
                              </div>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          {/* Tidak Tersedia */}
                          <td className="px-5 py-3.5 text-center">
                            {total > 0 ? (
                              <div className="inline-flex flex-col items-center justify-center gap-0.5 bg-slate-50/80 rounded-xl px-2 py-2 min-w-[5rem] border border-slate-200">
                                <span className="text-xl font-black text-slate-400">{tidakPct}%</span>
                                <span className="text-[10px] text-slate-400 font-bold">{s.tidakTersedia.toLocaleString("id-ID")} Sekolah</span>
                              </div>
                            ) : <span className="text-slate-300">—</span>}
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
        )}
      </div>

      {/* ─── Detail Modal ──────────────────────────────────────────────────────── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setDetailModal(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Panel — wide enough to show all columns without h-scroll */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                  detailModal.label === "Baik / Tinggi" ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : detailModal.label === "Sedang" ? "bg-gradient-to-br from-amber-400 to-amber-500"
                  : detailModal.label === "Kurang / Rendah" ? "bg-gradient-to-br from-red-500 to-red-600"
                  : "bg-gradient-to-br from-slate-400 to-slate-500"
                }`}>
                  <ListChecks size={15} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Detail Capaian — {detailModal.label}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{detailModal.title} · {detailModal.rows.length} data</p>
                </div>
              </div>
              {/* X button — visible with dark background */}
              <button
                onClick={() => setDetailModal(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                title="Tutup"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {/* Body — vertical scroll only, table fills full width */}
            <div className="overflow-y-auto flex-1">
              {detailModal.rows.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">Tidak ada data</div>
              ) : (
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: "7%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "32%" }} />
                  </colgroup>
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">No</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Jenis Satdik</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Status</th>
                      <th className="px-3 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">Label Capaian</th>
                      <th className="px-3 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">Nilai Capaian</th>
                      <th className="px-3 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">Thn. {tahun ? Number(tahun) - 1 : "Lalu"}</th>
                      <th className="px-3 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[9px]">Definisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      // Detect keys dynamically from first row of modal data
                      const firstRow = detailModal.rows[0] || {};
                      const modalKeys = Object.keys(firstRow);
                      const modalLabelKey = modalKeys.find(k => k.toLowerCase().includes("label capaian 20")) ?? "Label Capaian 2025";
                      const modalNilaiKey = modalKeys.find(k => k.toLowerCase().includes("nilai capaian 20") && !k.toLowerCase().includes("2024") && !k.toLowerCase().includes("2023")) ?? "Nilai Capaian 2025";
                      const modalThnLaluKey = modalKeys.find(k => k.toLowerCase().includes("nilai capaian 20") && k !== modalNilaiKey) ?? "Nilai Capaian 2024";
                      return detailModal.rows.map((row, i) => (
                        <tr key={`detail-${i}`} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                              {row["No"] || "–"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-xs font-semibold text-slate-800 break-words">{row["Jenis Satuan Pendidikan"] || "–"}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                              row["Status Satuan Pendidikan"] === "Negeri"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : row["Status Satuan Pendidikan"] === "Swasta"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>{row["Status Satuan Pendidikan"] || "–"}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <LabelBadge label={row[modalLabelKey] || ""} />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="font-bold text-slate-800 text-sm">{row[modalNilaiKey] || "–"}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-slate-500 text-xs font-medium">{row[modalThnLaluKey] || "–"}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-[10px] text-slate-500 leading-relaxed break-words">
                              {row["Definisi Capaian"] || "–"}
                            </p>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}