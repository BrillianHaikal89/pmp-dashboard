// utils/helpers.ts
import { LABEL_SCORE, INDIKATOR_ORDER } from "./constants";
import { SatdikTrenRow, SatdikIndikatorTren } from "../types";

export function getWilayahInfo(slug: string) {
  const wilayahMap: Record<string, { nama: string; type: string; displayName: string }> = {
    "kab-bandung": { nama: "Kab. Bandung", type: "kabupaten", displayName: "Kabupaten Bandung" },
    "kab-bandung-barat": { nama: "Kab. Bandung Barat", type: "kabupaten", displayName: "Kabupaten Bandung Barat" },
    "kab-bekasi": { nama: "Kab. Bekasi", type: "kabupaten", displayName: "Kabupaten Bekasi" },
    "kab-bogor": { nama: "Kab. Bogor", type: "kabupaten", displayName: "Kabupaten Bogor" },
    "kab-ciamis": { nama: "Kab. Ciamis", type: "kabupaten", displayName: "Kabupaten Ciamis" },
    "kab-cianjur": { nama: "Kab. Cianjur", type: "kabupaten", displayName: "Kabupaten Cianjur" },
    "kab-cirebon": { nama: "Kab. Cirebon", type: "kabupaten", displayName: "Kabupaten Cirebon" },
    "kab-garut": { nama: "Kab. Garut", type: "kabupaten", displayName: "Kabupaten Garut" },
    "kab-indramayu": { nama: "Kab. Indramayu", type: "kabupaten", displayName: "Kabupaten Indramayu" },
    "kab-karawang": { nama: "Kab. Karawang", type: "kabupaten", displayName: "Kabupaten Karawang" },
    "kab-kuningan": { nama: "Kab. Kuningan", type: "kabupaten", displayName: "Kabupaten Kuningan" },
    "kab-majalengka": { nama: "Kab. Majalengka", type: "kabupaten", displayName: "Kabupaten Majalengka" },
    "kab-pangandaran": { nama: "Kab. Pangandaran", type: "kabupaten", displayName: "Kabupaten Pangandaran" },
    "kab-purwakarta": { nama: "Kab. Purwakarta", type: "kabupaten", displayName: "Kabupaten Purwakarta" },
    "kab-subang": { nama: "Kab. Subang", type: "kabupaten", displayName: "Kabupaten Subang" },
    "kab-sukabumi": { nama: "Kab. Sukabumi", type: "kabupaten", displayName: "Kabupaten Sukabumi" },
    "kab-sumedang": { nama: "Kab. Sumedang", type: "kabupaten", displayName: "Kabupaten Sumedang" },
    "kab-tasikmalaya": { nama: "Kab. Tasikmalaya", type: "kabupaten", displayName: "Kabupaten Tasikmalaya" },
    "kota-bandung": { nama: "Kota Bandung", type: "kota", displayName: "Kota Bandung" },
    "kota-banjar": { nama: "Kota Banjar", type: "kota", displayName: "Kota Banjar" },
    "kota-bekasi": { nama: "Kota Bekasi", type: "kota", displayName: "Kota Bekasi" },
    "kota-bogor": { nama: "Kota Bogor", type: "kota", displayName: "Kota Bogor" },
    "kota-cimahi": { nama: "Kota Cimahi", type: "kota", displayName: "Kota Cimahi" },
    "kota-cirebon": { nama: "Kota Cirebon", type: "kota", displayName: "Kota Cirebon" },
    "kota-depok": { nama: "Kota Depok", type: "kota", displayName: "Kota Depok" },
    "kota-sukabumi": { nama: "Kota Sukabumi", type: "kota", displayName: "Kota Sukabumi" },
    "kota-tasikmalaya": { nama: "Kota Tasikmalaya", type: "kota", displayName: "Kota Tasikmalaya" },
  };
  
  return wilayahMap[slug] || { nama: "Wilayah", type: "unknown", displayName: "Wilayah" };
}

export function capaianStatusFn(nilai: number | null | undefined): string {
  if (nilai == null) return "Data Tidak Tersedia";
  return nilai >= 80 ? "Meningkat Sesuai Standar" : "Belum Meningkat Sesuai Standar";
}

export function getLabelScore(val: string): number {
  return LABEL_SCORE[val] ?? 0;
}

export function sortIndikatorKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = INDIKATOR_ORDER.indexOf(a);
    const ib = INDIKATOR_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

// Get label distribution per indikator from satdik_tren data
export function getLabelDistPerIndikator(satdikTren: { total: number; data: SatdikTrenRow[] } | null): Record<string, { baik: SatdikTrenRow[]; sedang: SatdikTrenRow[]; kurang: SatdikTrenRow[]; total: number }> {
  if (!satdikTren?.data?.length) return {};
  
  const rows = satdikTren.data;
  const indikatorKeys = Array.from(
    new Set(rows.flatMap(r => Object.keys(r).filter(k => /^[A-Z]\.\d+/.test(k))))
  ).sort();

  const result: Record<string, { baik: SatdikTrenRow[]; sedang: SatdikTrenRow[]; kurang: SatdikTrenRow[]; total: number }> = {};
  
  indikatorKeys.forEach(key => {
    const baik = rows.filter(r => {
      const val = r[key] as SatdikIndikatorTren;
      return val?.label === "Baik";
    });
    const sedang = rows.filter(r => {
      const val = r[key] as SatdikIndikatorTren;
      return val?.label === "Sedang";
    });
    const kurang = rows.filter(r => {
      const val = r[key] as SatdikIndikatorTren;
      return val?.label === "Kurang";
    });
    result[key] = { baik, sedang, kurang, total: rows.length };
  });
  
  return result;
}

// Get tren distribution per indikator (for 2024 data)
export function getTrenDistPerIndikator(satdikTren: { total: number; data: SatdikTrenRow[] } | null): Record<string, { naik: SatdikTrenRow[]; turun: SatdikTrenRow[]; stabil: SatdikTrenRow[]; total: number }> {
  if (!satdikTren?.data?.length) return {};
  
  const rows = satdikTren.data;
  const indikatorKeys = Array.from(
    new Set(rows.flatMap(r => Object.keys(r).filter(k => /^[A-Z]\.\d+/.test(k))))
  ).sort();

  const result: Record<string, { naik: SatdikTrenRow[]; turun: SatdikTrenRow[]; stabil: SatdikTrenRow[]; total: number }> = {};
  
  indikatorKeys.forEach(key => {
    const naik = rows.filter(r => {
      const val = r[key] as SatdikIndikatorTren;
      return val?.tren?.toLowerCase() === "naik";
    });
    const turun = rows.filter(r => {
      const val = r[key] as SatdikIndikatorTren;
      return val?.tren?.toLowerCase() === "turun";
    });
    const stabil = rows.filter(r => {
      const val = r[key] as SatdikIndikatorTren;
      const tren = val?.tren?.toLowerCase();
      return tren === "stabil" || tren === "tidak berubah";
    });
    result[key] = { naik, turun, stabil, total: rows.length };
  });
  
  return result;
}

// Format number with 2 decimal places
export function formatNumber(num: number | null | undefined, defaultValue: string = "-"): string {
  if (num == null || isNaN(num)) return defaultValue;
  return num.toFixed(2);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Get color class based on value
export function getValueColorClass(value: number | null | undefined, thresholds?: { good: number; bad: number }): string {
  if (value == null) return "text-slate-400";
  const { good = 80, bad = 60 } = thresholds || {};
  if (value >= good) return "text-emerald-600";
  if (value >= bad) return "text-amber-600";
  return "text-red-600";
}

// Get background color class based on value
export function getValueBgColorClass(value: number | null | undefined, thresholds?: { good: number; bad: number }): string {
  if (value == null) return "bg-slate-100";
  const { good = 80, bad = 60 } = thresholds || {};
  if (value >= good) return "bg-emerald-100";
  if (value >= bad) return "bg-amber-100";
  return "bg-red-100";
}

// Truncate text
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Parse number from string (handles comma as decimal separator)
export function parseNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  const cleaned = value.toString().replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Get status label for SPM
export function getSPMStatusLabel(value: number | null | undefined): { label: string; color: string } {
  if (value == null) return { label: "Data Tidak Tersedia", color: "bg-slate-100 text-slate-400" };
  if (value >= 80) return { label: "Meningkat Sesuai Standar", color: "bg-emerald-500 text-white" };
  return { label: "Belum Meningkat Sesuai Standar", color: "bg-amber-400 text-white" };
}

// Group data by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Sort array by key
export function sortByKey<T>(array: T[], key: keyof T, ascending: boolean = true): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return ascending ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal);
    const bStr = String(bVal);
    return ascending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
}