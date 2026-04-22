// app/dashboard-provinsi/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, ArrowLeft,
  BookOpen, School, GraduationCap, Building2, ChevronDown,
  AlertCircle, CheckCircle2, XCircle, Info, Search,
  MapPin, Layers, Users, BookMarked, Loader2, PieChart,
  ListChecks, Activity, Filter, Grid3x3, LayoutGrid,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RingkasanCapaian {
  No: number;
  Jenjang: string;
  Capaian: string;
  "Indikator Prioritas": string;
}
interface CapaianProvinsi {
  "Jenis Satuan Pendidikan": string;
  "Status Satuan Pendidikan": string;
  No: string;
  Indikator: string;
  "Label Capaian 2025"?: string;
  "Nilai Capaian 2025"?: string;
  "Perubahan Nilai Capaian dari Tahun Lalu"?: string;
  "Nilai Capaian 2024"?: string;
  "Label Capaian 2024"?: string;
}
interface CapaianKabkot {
  "Kab/Kota": string;
  "Jenis Satuan Pendidikan": string;
  "Status Satuan Pendidikan": string;
  [key: string]: string;
}
interface CapaianSatdik {
  NPSN: string;
  "Nama Satuan Pendidikan": string;
  "Jenis Satuan Pendidikan": string;
  "Status Satuan Pendidikan": string;
  "Kabupaten/Kota": string;
  Kecamatan: string;
  [key: string]: string;
}

type TabId = "ringkasan" | "provinsi" | "grafik-kabkot" | "kabkot-dasmen" | "kabkot-paud" | "satdik-dasmen" | "satdik-paud";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_CODES = ["A.1", "A.2", "A.3", "D.1", "D.3", "D.4", "D.8", "D.10"];

const PRIORITY_INDICATORS = [
  { code: "A.1",  fullName: "Literasi", description: "Kemampuan memahami dan menggunakan informasi" },
  { code: "A.2",  fullName: "Numerasi", description: "Kemampuan bernalar menggunakan matematika" },
  { code: "A.3",  fullName: "Karakter", description: "Penguatan profil pelajar Pancasila" },
  { code: "D.1",  fullName: "Kualitas Pembelajaran", description: "Partisipasi dalam pembelajaran" },
  { code: "D.3",  fullName: "Kepemimpinan Instruksional", description: "Partisipasi dalam kegiatan sekolah" },
  { code: "D.4",  fullName: "Iklim Keamanan", description: "Lingkungan belajar yang aman" },
  { code: "D.8",  fullName: "Iklim Kebinekaan", description: "Penghargaan terhadap keberagaman" },
  { code: "D.10", fullName: "Iklim Inklusifitas", description: "Keterlibatan semua pihak" },
];

function isPriorityIndicator(no: string, indikator?: string): boolean {
  const noClean = (no ?? "").trim().toUpperCase();
  const indClean = (indikator ?? "").trim().toUpperCase();

  return PRIORITY_CODES.some(code => {
    const codeUpper = code.toUpperCase();
    if (noClean === codeUpper) return true;
    if (noClean.startsWith(codeUpper + " ")) return true;
    if (noClean.startsWith(codeUpper + ".")) return true;
    if (indClean.startsWith(codeUpper + " ")) return true;
    if (indClean.startsWith(codeUpper + ".")) return true;
    if (indClean.includes(" " + codeUpper + " ")) return true;
    return false;
  });
}

const LABEL_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Tinggi:  { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  Baik:    { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  Sedang:  { bg: "#fef9c3", text: "#854d0e", border: "#fef08a" },
  Rendah:  { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  Kurang:  { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
  "Capaian Tidak Tersedia": { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
};

const LABEL_ORDER = ["Tinggi", "Baik", "Sedang", "Kurang", "Rendah", "Capaian Tidak Tersedia"];
const LABEL_COLORS_BAR: Record<string, string> = {
  Tinggi: "#22c55e", Baik: "#3b82f6", Sedang: "#eab308",
  Kurang: "#f97316", Rendah: "#ef4444", "Capaian Tidak Tersedia": "#cbd5e1",
};

const TABS: { id: TabId; short: string; icon: React.ReactNode; activeColor: string; activeBorder: string; activeBg: string }[] = [
  { id: "ringkasan",     short: "Ringkasan",           icon: <BookMarked size={14} />, activeColor: "text-emerald-700", activeBorder: "border-emerald-500", activeBg: "bg-emerald-50" },
  { id: "provinsi",      short: "Indikator Prioritas", icon: <BarChart3 size={14} />,  activeColor: "text-blue-700",    activeBorder: "border-blue-500",    activeBg: "bg-blue-50" },
  { id: "grafik-kabkot", short: "Grafik Kab/Kota",    icon: <PieChart size={14} />,   activeColor: "text-cyan-700",    activeBorder: "border-cyan-500",    activeBg: "bg-cyan-50" },
  { id: "kabkot-dasmen", short: "Kab/Kota Dasmen",    icon: <MapPin size={14} />,     activeColor: "text-purple-700",  activeBorder: "border-purple-500",  activeBg: "bg-purple-50" },
  { id: "kabkot-paud",   short: "Kab/Kota PAUD",      icon: <Layers size={14} />,     activeColor: "text-pink-700",    activeBorder: "border-pink-500",    activeBg: "bg-pink-50" },
  { id: "satdik-dasmen", short: "Satdik Dasmen",      icon: <School size={14} />,     activeColor: "text-orange-700",  activeBorder: "border-orange-500",  activeBg: "bg-orange-50" },
  { id: "satdik-paud",   short: "Satdik PAUD",        icon: <GraduationCap size={14} />, activeColor: "text-teal-700", activeBorder: "border-teal-500",    activeBg: "bg-teal-50" },
];

const PAGE_SIZE = 50;

// ─── Mock Data for Development ────────────────────────────────────────────────
const MOCK_DATA_2024 = {
  capaianProv: [
    {
      "Jenis Satuan Pendidikan": "SD",
      "Status Satuan Pendidikan": "Negeri",
      "No": "A.1",
      "Indikator": "A.1 Literasi",
      "Nilai Capaian 2024": "72.5",
      "Label Capaian 2024": "Baik",
      "Nilai Capaian 2025": "74.2",
      "Label Capaian 2025": "Baik",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 1.7 poin"
    },
    {
      "Jenis Satuan Pendidikan": "SD",
      "Status Satuan Pendidikan": "Swasta",
      "No": "A.1",
      "Indikator": "A.1 Literasi",
      "Nilai Capaian 2024": "68.3",
      "Label Capaian 2024": "Sedang",
      "Nilai Capaian 2025": "70.1",
      "Label Capaian 2025": "Baik",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 1.8 poin"
    },
    {
      "Jenis Satuan Pendidikan": "SMP",
      "Status Satuan Pendidikan": "Negeri",
      "No": "A.2",
      "Indikator": "A.2 Numerasi",
      "Nilai Capaian 2024": "65.3",
      "Label Capaian 2024": "Sedang",
      "Nilai Capaian 2025": "67.8",
      "Label Capaian 2025": "Sedang",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 2.5 poin"
    },
    {
      "Jenis Satuan Pendidikan": "SMA",
      "Status Satuan Pendidikan": "Negeri",
      "No": "A.3",
      "Indikator": "A.3 Karakter",
      "Nilai Capaian 2024": "78.9",
      "Label Capaian 2024": "Tinggi",
      "Nilai Capaian 2025": "80.2",
      "Label Capaian 2025": "Tinggi",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 1.3 poin"
    },
    {
      "Jenis Satuan Pendidikan": "SMK",
      "Status Satuan Pendidikan": "Negeri",
      "No": "D.1",
      "Indikator": "D.1 Partisipasi",
      "Nilai Capaian 2024": "71.2",
      "Label Capaian 2024": "Baik",
      "Nilai Capaian 2025": "73.5",
      "Label Capaian 2025": "Baik",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 2.3 poin"
    },
    {
      "Jenis Satuan Pendidikan": "SD",
      "Status Satuan Pendidikan": "Negeri",
      "No": "D.3",
      "Indikator": "D.3 Partisipasi Kegiatan",
      "Nilai Capaian 2024": "64.5",
      "Label Capaian 2024": "Sedang",
      "Nilai Capaian 2025": "66.2",
      "Label Capaian 2025": "Sedang",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 1.7 poin"
    },
    {
      "Jenis Satuan Pendidikan": "SMP",
      "Status Satuan Pendidikan": "Swasta",
      "No": "D.4",
      "Indikator": "D.4 Iklim Keamanan",
      "Nilai Capaian 2024": "55.8",
      "Label Capaian 2024": "Kurang",
      "Nilai Capaian 2025": "58.3",
      "Label Capaian 2025": "Kurang",
      "Perubahan Nilai Capaian dari Tahun Lalu": "Naik 2.5 poin"
    },
  ],
  ringkasan: [
    { No: 1, Jenjang: "SD", Capaian: "Literasi", "Indikator Prioritas": "A.1 Literasi" },
    { No: 2, Jenjang: "SD", Capaian: "Numerasi", "Indikator Prioritas": "A.2 Numerasi" },
    { No: 3, Jenjang: "SMP", Capaian: "Literasi", "Indikator Prioritas": "A.1 Literasi" },
    { No: 4, Jenjang: "SMP", Capaian: "Numerasi", "Indikator Prioritas": "A.2 Numerasi" },
    { No: 5, Jenjang: "SMA", Capaian: "Karakter", "Indikator Prioritas": "A.3 Karakter" },
  ],
  kabkotDasmen: [
    {
      "Kab/Kota": "Bandung",
      "Jenis Satuan Pendidikan": "SD",
      "Status Satuan Pendidikan": "Negeri",
      "A.1_Label Capaian": "Baik",
      "A.2_Label Capaian": "Sedang",
      "A.3_Label Capaian": "Tinggi",
    },
    {
      "Kab/Kota": "Bekasi",
      "Jenis Satuan Pendidikan": "SMP",
      "Status Satuan Pendidikan": "Negeri",
      "A.1_Label Capaian": "Sedang",
      "A.2_Label Capaian": "Baik",
      "A.3_Label Capaian": "Sedang",
    },
    {
      "Kab/Kota": "Bogor",
      "Jenis Satuan Pendidikan": "SMA",
      "Status Satuan Pendidikan": "Swasta",
      "A.1_Label Capaian": "Kurang",
      "A.2_Label Capaian": "Sedang",
      "A.3_Label Capaian": "Baik",
    },
  ],
  kabkotPaud: [
    {
      "Kab/Kota": "Bandung",
      "Jenis Satuan Pendidikan": "PAUD",
      "Status Satuan Pendidikan": "Negeri",
      "A.1_Label Capaian": "Baik",
      "A.2_Label Capaian": "Tinggi",
    },
    {
      "Kab/Kota": "Depok",
      "Jenis Satuan Pendidikan": "PAUD",
      "Status Satuan Pendidikan": "Swasta",
      "A.1_Label Capaian": "Sedang",
      "A.2_Label Capaian": "Sedang",
    },
  ],
  satdikDasmen: [
    {
      NPSN: "12345678",
      "Nama Satuan Pendidikan": "SD Negeri 1 Bandung",
      "Jenis Satuan Pendidikan": "SD",
      "Status Satuan Pendidikan": "Negeri",
      "Kabupaten/Kota": "Bandung",
      Kecamatan: "Bandung Wetan",
      "A.1_Label Capaian": "Baik",
      "A.2_Label Capaian": "Sedang",
    },
    {
      NPSN: "87654321",
      "Nama Satuan Pendidikan": "SMP Negeri 2 Bekasi",
      "Jenis Satuan Pendidikan": "SMP",
      "Status Satuan Pendidikan": "Negeri",
      "Kabupaten/Kota": "Bekasi",
      Kecamatan: "Bekasi Barat",
      "A.1_Label Capaian": "Tinggi",
      "A.2_Label Capaian": "Baik",
    },
  ],
  satdikPaud: [
    {
      NPSN: "11111111",
      "Nama Satuan Pendidikan": "PAUD Harapan Bangsa",
      "Jenis Satuan Pendidikan": "PAUD",
      "Status Satuan Pendidikan": "Swasta",
      "Kabupaten/Kota": "Bogor",
      Kecamatan: "Bogor Selatan",
      "A.1_Label Capaian": "Sedang",
      "A.2_Label Capaian": "Baik",
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function LabelBadge({ label }: { label: string }) {
  const clean = (label ?? "").trim();
  const style = LABEL_STYLE[clean] ?? LABEL_STYLE["Capaian Tidak Tersedia"];
  
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      {clean === "Capaian Tidak Tersedia" ? "Tidak Tersedia" : clean || "Tidak Tersedia"}
    </span>
  );
}

function PerubahanBadge({ val }: { val?: string }) {
  if (!val) return <span className="text-slate-400 text-xs">–</span>;
  const lower = val.toLowerCase();
  if (lower.includes("naik"))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <TrendingUp size={11} />↑ {val}
      </span>
    );
  if (lower.includes("turun"))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
        <TrendingDown size={11} />↓ {val}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
      <Minus size={11} />→ {val}
    </span>
  );
}

function filterNonReligiousSatdik(data: CapaianSatdik[]): CapaianSatdik[] {
  const religiousKeywords = ["madrasah", "pesantren", "agama", "islam", "kristen", "katolik", "hindu", "buddha", "konghucu", "keagamaan"];
  return data.filter(satdik => {
    const nama = (satdik["Nama Satuan Pendidikan"] || "").toLowerCase();
    const jenis = (satdik["Jenis Satuan Pendidikan"] || "").toLowerCase();
    return !religiousKeywords.some(keyword => nama.includes(keyword) || jenis.includes(keyword));
  });
}

function SelectFilter({ value, onChange, options, className = "", icon }: {
  value: string; onChange: (v: string) => void; options: string[]; className?: string; icon?: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">{icon}</div>}
      <select
        className="appearance-none pr-7 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
        style={{ paddingLeft: icon ? '2.25rem' : '0.75rem' }}
        value={value} onChange={e => onChange(e.target.value)}
      >
        {options.filter(o => o !== undefined && o !== null && o !== "").map((o, idx) => <option key={`${o}-${idx}`} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative flex-1 min-w-48">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function DistribusiBar({ data }: { data: Record<string, string>[] }) {
  const counts: Record<string, number> = {};
  for (const row of data) {
    for (const [k, v] of Object.entries(row)) {
      if (k.includes("_Label Capaian")) {
        const c = (v ?? "").trim();
        counts[c] = (counts[c] ?? 0) + 1;
      }
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const labels = LABEL_ORDER.filter(l => counts[l]);
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-2 gap-px mb-3">
        {labels.map(l => (
          <div
            key={l}
            className="transition-all first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(counts[l] / total) * 100}%`, background: LABEL_COLORS_BAR[l] }}
            title={`${l}: ${counts[l]}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {labels.map(l => (
          <span key={l} className="text-xs text-slate-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: LABEL_COLORS_BAR[l] }} />
            <span className="font-medium text-slate-700">{l === "Capaian Tidak Tersedia" ? "Tidak Tersedia" : l}</span>
            <span className="font-bold text-slate-900">{counts[l]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PaginationBar({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 2, total - 4));
  for (let i = start; i <= Math.min(start + 4, total); i++) pages.push(i);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
      <span className="text-xs text-slate-500">Halaman <b className="text-slate-700">{page}</b> dari <b className="text-slate-700">{total}</b></span>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition font-medium text-slate-700 shadow-sm"
        >
          ‹ Prev
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition font-medium shadow-sm ${
              p === page
                ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(total, page + 1))}
          disabled={page === total}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition font-medium text-slate-700 shadow-sm"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

function TabLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="relative w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
        <Loader2 size={22} className="text-blue-500 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Memuat data...</p>
        <p className="text-xs text-slate-400 mt-0.5">Harap tunggu</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{title}</h2>
        {badge && <p className="text-xs text-slate-400 mt-1 font-medium">{badge}</p>}
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color, trend, trendValue, subtitle }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  subtitle?: string;
}) {
  const trendIcon = trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />;
  const trendColor = trend === "up" ? "text-emerald-600 bg-emerald-50" : trend === "down" ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-100";
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shadow-md group-hover:scale-105 transition-transform duration-200`}>
          {icon}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${trendColor}`}>
            {trendIcon}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  );
}

// ─── Label → Nilai Numerik ────────────────────────────────────────────────────
const LABEL_SCORE: Record<string, number> = {
  "Tinggi": 4, "Baik": 3, "Sedang": 2, "Kurang": 1, "Rendah": 1,
  "Capaian Tidak Tersedia": 0, "": 0,
};
const LABEL_COLOR_MAP: Record<string, string> = {
  "Tinggi": "#22c55e", "Baik": "#3b82f6", "Sedang": "#f59e0b",
  "Kurang": "#f97316", "Rendah": "#ef4444", "Capaian Tidak Tersedia": "#cbd5e1",
};

// ─── APK/APM/APS field patterns ──────────────────────────────────────────────
const APX_PATTERNS = ["APK", "APM", "APS"];

function getApxKeys(row: Record<string, string>): string[] {
  return Object.keys(row).filter(k =>
    APX_PATTERNS.some(p => k.toUpperCase().includes(p)) && k.includes("_Nilai")
  );
}

// ─── Stacked Bar Chart (horizontal) per kab/kota ─────────────────────────────
function StackedBarChart({
  title, subtitle, data, jenjangList, selectedJenjang, onJenjangChange, indikatorKeys, colorFn,
}: {
  title: string; subtitle?: string;
  data: CapaianKabkot[];
  jenjangList: string[]; selectedJenjang: string; onJenjangChange: (v: string) => void;
  indikatorKeys: string[];
  colorFn?: (key: string) => string;
}) {
  const filtered = selectedJenjang === "Semua"
    ? data : data.filter(r => r["Jenis Satuan Pendidikan"] === selectedJenjang);

  // Ambil semua kab/kota unik
  const kabList = [...new Set(filtered.map(r => r["Kab/Kota"]))].sort();

  // Untuk setiap kab/kota, hitung score rata-rata per indikator
  const chartData = kabList.map(kab => {
    const rows = filtered.filter(r => r["Kab/Kota"] === kab);
    const scores: Record<string, number> = {};
    for (const key of indikatorKeys) {
      const vals = rows.map(r => LABEL_SCORE[((r[key] ?? "")).trim()] ?? 0);
      scores[key] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
    return { kab, scores };
  });

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
        <p className="text-sm text-slate-400">Tidak ada data tersedia untuk filter ini</p>
      </div>
    );
  }

  const barH = 28;
  const gap = 8;
  const labelW = 110;
  const chartW = 560;
  const totalH = chartData.length * (barH + gap) + 40;
  const maxScore = 4;

  const shortKey = (k: string) => k.replace("_Label Capaian", "").replace("_Nilai Capaian", "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {jenjangList.map(j => (
            <button key={j} onClick={() => onJenjangChange(j)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                selectedJenjang === j
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}>{j}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 pt-4 pb-2 flex flex-wrap gap-3">
        {indikatorKeys.map(k => (
          <span key={k} className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0"
              style={{ background: colorFn ? colorFn(k) : "#3b82f6" }} />
            {shortKey(k)}
          </span>
        ))}
        <span className="text-[10px] text-slate-400 ml-2">Skala: 1=Kurang · 2=Sedang · 3=Baik · 4=Tinggi</span>
      </div>

      <div className="overflow-x-auto px-5 pb-5">
        <svg width={labelW + chartW + 40} height={totalH} className="overflow-visible">
          {/* Gridlines */}
          {[0, 1, 2, 3, 4].map(v => {
            const x = labelW + (v / maxScore) * chartW;
            return (
              <g key={v}>
                <line x1={x} y1={20} x2={x} y2={totalH - 20} stroke="#e2e8f0" strokeWidth={1} strokeDasharray={v === 0 ? "0" : "4,3"} />
                <text x={x} y={14} textAnchor="middle" fontSize={9} fill="#94a3b8">{v}</text>
              </g>
            );
          })}

          {chartData.map(({ kab, scores }, i) => {
            const y = 20 + i * (barH + gap);
            const segW = barH / indikatorKeys.length;
            return (
              <g key={kab}>
                {/* Label kab */}
                <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={9.5} fill="#475569" fontWeight="500">
                  {kab.length > 14 ? kab.substring(0, 13) + "…" : kab}
                </text>
                {/* Bars per indikator (stacked vertically dalam row) */}
                {indikatorKeys.map((k, ki) => {
                  const score = scores[k] ?? 0;
                  const barWidth = (score / maxScore) * chartW;
                  const ky = y + ki * segW;
                  const col = colorFn ? colorFn(k) : "#3b82f6";
                  return (
                    <g key={k}>
                      <rect x={labelW} y={ky} width={chartW} height={segW - 1} fill="#f1f5f9" rx={2} />
                      <rect x={labelW} y={ky} width={barWidth} height={segW - 1} fill={col} rx={2} opacity={0.85} />
                      {barWidth > 30 && (
                        <text x={labelW + barWidth - 4} y={ky + segW / 2 + 3} textAnchor="end" fontSize={8} fill="white" fontWeight="700">
                          {score.toFixed(1)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Trend Chart (naik/turun) ──────────────────────────────────────────────────
function TrendChart({
  title, subtitle, data, jenjangList, selectedJenjang, onJenjangChange,
  tahun, indikatorKeys, colorFn, labelPrefix,
}: {
  title: string; subtitle?: string;
  data: CapaianKabkot[];
  jenjangList: string[]; selectedJenjang: string; onJenjangChange: (v: string) => void;
  tahun: string;
  indikatorKeys: string[];
  colorFn?: (key: string) => string;
  labelPrefix?: string;
}) {
  const filtered = selectedJenjang === "Semua"
    ? data : data.filter(r => r["Jenis Satuan Pendidikan"] === selectedJenjang);

  const kabList = [...new Set(filtered.map(r => r["Kab/Kota"]))].sort();

  // Cari pasangan nilai 2024/2025 — asumsi kolom: X_Nilai Capaian 2025 & X_Nilai Capaian 2024
  // atau X_Label Capaian (satu label tanpa tahun pada data kabkot)
  // Untuk trend: hitung selisih score label 2025 vs 2024 jika ada, otherwise gunakan perubahan sign
  const trendData = kabList.map(kab => {
    const rows = filtered.filter(r => r["Kab/Kota"] === kab);
    let naik = 0, turun = 0, tetap = 0;
    for (const key of indikatorKeys) {
      // Cari pasangan key 2025 dan 2024
      const key25 = key.replace(/_Label Capaian$/, "_Label Capaian 2025").replace(/_Nilai Capaian$/, "_Nilai Capaian 2025");
      const key24 = key.replace(/_Label Capaian$/, "_Label Capaian 2024").replace(/_Nilai Capaian$/, "_Nilai Capaian 2024");
      for (const row of rows) {
        const v25 = row[key25] ?? row[key] ?? "";
        const v24 = row[key24] ?? "";
        if (!v25 || !v24) { tetap++; continue; }
        const s25 = LABEL_SCORE[(v25 as string).trim()] ?? parseFloat(v25 as string) ?? 0;
        const s24 = LABEL_SCORE[(v24 as string).trim()] ?? parseFloat(v24 as string) ?? 0;
        if (s25 > s24) naik++;
        else if (s25 < s24) turun++;
        else tetap++;
      }
    }
    return { kab, naik, turun, tetap, total: naik + turun + tetap };
  }).filter(d => d.total > 0);

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
        <p className="text-sm text-slate-400">Data perubahan tidak tersedia (perlu data 2 tahun)</p>
      </div>
    );
  }

  const barH = 24;
  const gap = 10;
  const labelW = 110;
  const chartW = 560;
  const totalH = trendData.length * (barH + gap) + 40;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {jenjangList.map(j => (
            <button key={j} onClick={() => onJenjangChange(j)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                selectedJenjang === j
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}>{j}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 pt-4 pb-2 flex gap-4">
        {[
          { color: "#22c55e", label: "Meningkat" },
          { color: "#ef4444", label: "Menurun" },
          { color: "#94a3b8", label: "Tetap / Tidak ada data" },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto px-5 pb-5">
        <svg width={labelW + chartW + 40} height={totalH} className="overflow-visible">
          {/* Gridlines at 25%, 50%, 75%, 100% */}
          {[0, 25, 50, 75, 100].map(pct => {
            const x = labelW + (pct / 100) * chartW;
            return (
              <g key={pct}>
                <line x1={x} y1={20} x2={x} y2={totalH - 20} stroke="#e2e8f0" strokeWidth={1} strokeDasharray={pct === 0 ? "0" : "4,3"} />
                <text x={x} y={14} textAnchor="middle" fontSize={9} fill="#94a3b8">{pct}%</text>
              </g>
            );
          })}

          {trendData.map(({ kab, naik, turun, tetap, total }, i) => {
            const y = 20 + i * (barH + gap);
            const naikW = (naik / total) * chartW;
            const turunW = (turun / total) * chartW;
            const tetapW = (tetap / total) * chartW;
            return (
              <g key={kab}>
                <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={9.5} fill="#475569" fontWeight="500">
                  {kab.length > 14 ? kab.substring(0, 13) + "…" : kab}
                </text>
                {/* Background */}
                <rect x={labelW} y={y} width={chartW} height={barH} fill="#f1f5f9" rx={4} />
                {/* Naik */}
                {naikW > 0 && <rect x={labelW} y={y} width={naikW} height={barH} fill="#22c55e" rx={4} opacity={0.85} />}
                {/* Turun */}
                {turunW > 0 && <rect x={labelW + naikW} y={y} width={turunW} height={barH} fill="#ef4444" rx={0} opacity={0.85} />}
                {/* Tetap */}
                {tetapW > 0 && <rect x={labelW + naikW + turunW} y={y} width={tetapW} height={barH} fill="#cbd5e1" rx={0} opacity={0.6} style={{ borderRadius: "0 4px 4px 0" }} />}
                {/* Labels */}
                {naikW > 28 && (
                  <text x={labelW + naikW / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight="700">{naik}</text>
                )}
                {turunW > 28 && (
                  <text x={labelW + naikW + turunW / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight="700">{turun}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function DashboardProvinsiPage() {
  const [tahun, setTahun]         = useState<"2024" | "2025">("2024");
  const [activeTab, setActiveTab] = useState<TabId>("provinsi");
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [useMockData, setUseMockData] = useState(false);

  const [filterJenjang, setFilterJenjang] = useState<string>("Semua");
  const [filterCapaian, setFilterCapaian] = useState<string>("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");

  const [ringkasan,    setRingkasan]    = useState<RingkasanCapaian[]>([]);
  const [capaianProv,  setCapaianProv]  = useState<CapaianProvinsi[]>([]);
  const [kabkotDasmen, setKabkotDasmen] = useState<CapaianKabkot[]>([]);
  const [kabkotPaud,   setKabkotPaud]   = useState<CapaianKabkot[]>([]);
  const [satdikDasmen, setSatdikDasmen] = useState<CapaianSatdik[]>([]);
  const [satdikPaud,   setSatdikPaud]   = useState<CapaianSatdik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [sKD, setSKD] = useState(""); const [fKDJ, setFKDJ] = useState("Semua"); const [fKDS, setFKDS] = useState("Semua");
  const [sKP, setSKP] = useState(""); const [fKPS, setFKPS] = useState("Semua");
  const [sSD, setSSD] = useState(""); const [fSDJ, setFSDJ] = useState("Semua"); const [fSDS, setFSDS] = useState("Semua"); const [fSDK, setFSDK] = useState("Semua");
  const [sSP, setSSP] = useState(""); const [fSPJ, setFSPJ] = useState("Semua"); const [fSPS, setFSPS] = useState("Semua"); const [fSPK, setFSPK] = useState("Semua");
  const [pageSD, setPageSD] = useState(1);
  const [pageSP, setPageSP] = useState(1);

  // Chart filter states
  const [chartIndJenjang,  setChartIndJenjang]  = useState("Semua");
  const [chartApxJenjang,  setChartApxJenjang]  = useState("Semua");
  const [chartTrendIndJenjang, setChartTrendIndJenjang] = useState("Semua");
  const [chartTrendApxJenjang, setChartTrendApxJenjang] = useState("Semua");

  // Modal: daftar sekolah per indikator
  const [schoolModal, setSchoolModal] = useState<{
    indCode: string;
    indName: string;
    labelGroup: "Baik / Tinggi" | "Sedang" | "Kurang / Rendah";
  } | null>(null);
  const [schoolModalSearch, setSchoolModalSearch] = useState("");
  const [schoolModalPage, setSchoolModalPage] = useState(1);
  const [schoolModalKabkot, setSchoolModalKabkot] = useState("Semua");
  const [schoolModalKecamatan, setSchoolModalKecamatan] = useState("Semua");
  const SCHOOL_MODAL_PAGE_SIZE = 50;

  const handleTabChange = async (tabId: TabId) => {
    if (tabId === activeTab) return;
    setIsTabSwitching(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActiveTab(tabId);
    setIsTabSwitching(false);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const loadData = async () => {
      try {
        const files = [
          '1_ringkasan_capaian_jenjang.json',
          '2_capaian_provinsi.json',
          '3_capaian_kabkot_dasmen_vokasi.json',
          '4_capaian_kabkot_paud.json',
          '5_capaian_satdik_dasmen_vokasi.json',
          '6_capaian_satdik_paud.json'
        ];
        
        const results = await Promise.allSettled(
          files.map(file => 
            fetch(`/dataProvinsi/${tahun}/${file}`)
              .then(async res => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}: ${file}`);
                }
                const data = await res.json();
                return data;
              })
          )
        );
        
        const [
          ringkasanResult,
          capaianProvResult,
          kabkotDasmenResult,
          kabkotPaudResult,
          satdikDasmenResult,
          satdikPaudResult
        ] = results;
        
        const hasRealData = results.some(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0);
        
        if (!hasRealData && !useMockData) {
          setError(`Tidak ada data ditemukan untuk tahun ${tahun}. Silakan periksa file JSON di folder public/dataProvinsi/${tahun}/ atau gunakan data contoh.`);
          setLoading(false);
          return;
        }
        
        if (hasRealData) {
          setRingkasan(ringkasanResult.status === 'fulfilled' ? ringkasanResult.value : []);
          setCapaianProv(capaianProvResult.status === 'fulfilled' ? capaianProvResult.value : []);
          setKabkotDasmen(kabkotDasmenResult.status === 'fulfilled' ? kabkotDasmenResult.value : []);
          setKabkotPaud(kabkotPaudResult.status === 'fulfilled' ? kabkotPaudResult.value : []);
          setSatdikDasmen(
            satdikDasmenResult.status === 'fulfilled' 
              ? filterNonReligiousSatdik(satdikDasmenResult.value) 
              : []
          );
          setSatdikPaud(
            satdikPaudResult.status === 'fulfilled' 
              ? filterNonReligiousSatdik(satdikPaudResult.value) 
              : []
          );
        } else if (useMockData) {
          // Use mock data
          setRingkasan(MOCK_DATA_2024.ringkasan);
          setCapaianProv(MOCK_DATA_2024.capaianProv);
          setKabkotDasmen(MOCK_DATA_2024.kabkotDasmen);
          setKabkotPaud(MOCK_DATA_2024.kabkotPaud);
          setSatdikDasmen(MOCK_DATA_2024.satdikDasmen);
          setSatdikPaud(MOCK_DATA_2024.satdikPaud);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        
        if (useMockData) {
          // Fallback to mock data
          setRingkasan(MOCK_DATA_2024.ringkasan);
          setCapaianProv(MOCK_DATA_2024.capaianProv);
          setKabkotDasmen(MOCK_DATA_2024.kabkotDasmen);
          setKabkotPaud(MOCK_DATA_2024.kabkotPaud);
          setSatdikDasmen(MOCK_DATA_2024.satdikDasmen);
          setSatdikPaud(MOCK_DATA_2024.satdikPaud);
          setLoading(false);
        } else {
          setError(`Gagal memuat data dari public/dataProvinsi/${tahun}/. Periksa koneksi atau ketersediaan file.`);
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    setPageSD(1);
    setPageSP(1);
  }, [tahun, useMockData]);

  const allPriorityProvData = useMemo(() => {
    return capaianProv.filter(c => isPriorityIndicator(c.No || "", c.Indikator || ""));
  }, [capaianProv]);

  const filteredProvData = useMemo(() => {
    if (filterStatus === "Semua") return allPriorityProvData;
    return allPriorityProvData.filter(c => c["Status Satuan Pendidikan"] === filterStatus);
  }, [allPriorityProvData, filterStatus]);

  const totalDashboardStats = useMemo(() => {
    let baikTinggi = 0, sedang = 0, kurangRendah = 0, tidakTersedia = 0;

    const allSatdik = [...satdikDasmen, ...satdikPaud];
    for (const satdik of allSatdik) {
      if (filterStatus !== "Semua" && satdik["Status Satuan Pendidikan"] !== filterStatus) continue;

      let counted = false;
      for (const code of PRIORITY_CODES) {
        const labelKey = Object.keys(satdik).find(k => {
          const ku = k.toUpperCase();
          const cu = code.toUpperCase();
          return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
        });
        if (!labelKey) continue;
        const labelVal = (satdik[labelKey] ?? "").trim();
        if (!labelVal) continue;
        counted = true;
        if (labelVal === "Tinggi" || labelVal === "Baik") baikTinggi++;
        else if (labelVal === "Sedang") sedang++;
        else if (labelVal === "Kurang" || labelVal === "Rendah") kurangRendah++;
        else tidakTersedia++;
      }
    }

    const total = baikTinggi + sedang + kurangRendah + tidakTersedia;
    return { baikTinggi, sedang, kurangRendah, tidakTersedia, total };
  }, [satdikDasmen, satdikPaud, filterStatus]);

  const jenjangStats = useMemo(() => {
    const stats: Record<string, { baikTinggi: number; sedang: number; kurangRendah: number; tidakTersedia: number; total: number }> = {};

    const allSatdik = [...satdikDasmen, ...satdikPaud];
    for (const satdik of allSatdik) {
      if (filterStatus !== "Semua" && satdik["Status Satuan Pendidikan"] !== filterStatus) continue;
      const jenjang = satdik["Jenis Satuan Pendidikan"] || "Lainnya";
      if (!stats[jenjang]) stats[jenjang] = { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };

      for (const code of PRIORITY_CODES) {
        const labelKey = Object.keys(satdik).find(k => {
          const ku = k.toUpperCase();
          const cu = code.toUpperCase();
          return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
        });
        if (!labelKey) continue;
        const labelVal = (satdik[labelKey] ?? "").trim();
        if (!labelVal) continue;
        if (labelVal === "Tinggi" || labelVal === "Baik") stats[jenjang].baikTinggi++;
        else if (labelVal === "Sedang") stats[jenjang].sedang++;
        else if (labelVal === "Kurang" || labelVal === "Rendah") stats[jenjang].kurangRendah++;
        else stats[jenjang].tidakTersedia++;
        stats[jenjang].total++;
      }
    }
    return stats;
  }, [satdikDasmen, satdikPaud, filterStatus]);

  const indikatorStats = useMemo(() => {
    const stats: Record<string, { baikTinggi: number; sedang: number; kurangRendah: number; tidakTersedia: number; total: number; label: string }> = {};

    // Inisialisasi semua kode prioritas
    for (const p of PRIORITY_INDICATORS) {
      stats[p.code] = { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0, label: p.fullName };
    }

    // Hitung jumlah SEKOLAH (satdik) per indikator prioritas, bukan jumlah baris capaianProv
    const allSatdik = [...satdikDasmen, ...satdikPaud];
    for (const satdik of allSatdik) {
      // Filter status jika ada
      if (filterStatus !== "Semua" && satdik["Status Satuan Pendidikan"] !== filterStatus) continue;

      for (const code of PRIORITY_CODES) {
        if (!stats[code]) continue;
        // Cari kolom label capaian untuk kode ini di data satdik
        const labelKey = Object.keys(satdik).find(k => {
          const ku = k.toUpperCase();
          const cu = code.toUpperCase();
          return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
        });
        if (!labelKey) continue;

        const labelVal = (satdik[labelKey] ?? "").trim();
        if (!labelVal) continue;

        if (labelVal === "Tinggi" || labelVal === "Baik") stats[code].baikTinggi++;
        else if (labelVal === "Sedang") stats[code].sedang++;
        else if (labelVal === "Kurang" || labelVal === "Rendah") stats[code].kurangRendah++;
        else stats[code].tidakTersedia++;
        stats[code].total++;
      }
    }
    return stats;
  }, [satdikDasmen, satdikPaud, filterStatus]);

  const schoolModalRows = useMemo(() => {
    if (!schoolModal) return [];
    const { indCode, labelGroup } = schoolModal;
    const allSatdik = [...satdikDasmen, ...satdikPaud];
    return allSatdik.filter(satdik => {
      if (filterStatus !== "Semua" && satdik["Status Satuan Pendidikan"] !== filterStatus) return false;
      const labelKey = Object.keys(satdik).find(k => {
        const ku = k.toUpperCase();
        const cu = indCode.toUpperCase();
        return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
      });
      if (!labelKey) return false;
      const labelVal = (satdik[labelKey] ?? "").trim();
      if (!labelVal) return false;
      if (labelGroup === "Baik / Tinggi") return labelVal === "Tinggi" || labelVal === "Baik";
      if (labelGroup === "Sedang") return labelVal === "Sedang";
      if (labelGroup === "Kurang / Rendah") return labelVal === "Kurang" || labelVal === "Rendah";
      return false;
    });
  }, [schoolModal, satdikDasmen, satdikPaud, filterStatus]);

  const schoolModalKabkotOptions = useMemo(() => {
    const opts = [...new Set(schoolModalRows.map(r => r["Kabupaten/Kota"]).filter(Boolean))].sort();
    return ["Semua", ...opts];
  }, [schoolModalRows]);

  const schoolModalKecamatanOptions = useMemo(() => {
    const base = schoolModalKabkot !== "Semua"
      ? schoolModalRows.filter(r => r["Kabupaten/Kota"] === schoolModalKabkot)
      : schoolModalRows;
    const opts = [...new Set(base.map(r => r.Kecamatan).filter(Boolean))].sort();
    return ["Semua", ...opts];
  }, [schoolModalRows, schoolModalKabkot]);

  const schoolModalFiltered = useMemo(() => {
    let rows = schoolModalRows;
    if (schoolModalKabkot !== "Semua") rows = rows.filter(r => r["Kabupaten/Kota"] === schoolModalKabkot);
    if (schoolModalKecamatan !== "Semua") rows = rows.filter(r => r.Kecamatan === schoolModalKecamatan);
    if (!schoolModalSearch) return rows;
    const q = schoolModalSearch.toLowerCase();
    return rows.filter(r =>
      r["Nama Satuan Pendidikan"]?.toLowerCase().includes(q) ||
      r.NPSN?.includes(q) ||
      r["Kabupaten/Kota"]?.toLowerCase().includes(q)
    );
  }, [schoolModalRows, schoolModalSearch, schoolModalKabkot, schoolModalKecamatan]);

  const schoolModalTotalPages = Math.ceil(schoolModalFiltered.length / SCHOOL_MODAL_PAGE_SIZE);
  const schoolModalPaged = schoolModalFiltered.slice(
    (schoolModalPage - 1) * SCHOOL_MODAL_PAGE_SIZE,
    schoolModalPage * SCHOOL_MODAL_PAGE_SIZE
  );

  const baikTinggiPercent = totalDashboardStats.total > 0
    ? Math.round((totalDashboardStats.baikTinggi / totalDashboardStats.total) * 100)
    : 0;
  const sedangPercent = totalDashboardStats.total > 0
    ? Math.round((totalDashboardStats.sedang / totalDashboardStats.total) * 100)
    : 0;
  const kurangRendahPercent = totalDashboardStats.total > 0
    ? Math.round((totalDashboardStats.kurangRendah / totalDashboardStats.total) * 100)
    : 0;

  const oKDJ = useMemo(() => ["Semua", ...[...new Set(kabkotDasmen.map(c => c["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()], [kabkotDasmen]);
  const oKDS = useMemo(() => ["Semua", ...[...new Set(kabkotDasmen.map(c => c["Status Satuan Pendidikan"]))].filter(Boolean).sort()], [kabkotDasmen]);
  const oKPS = useMemo(() => ["Semua", ...[...new Set(kabkotPaud.map(c => c["Status Satuan Pendidikan"]))].filter(Boolean).sort()], [kabkotPaud]);

  // Chart: indikator prioritas keys dari kabkotDasmen
  const chartIndKeys = useMemo(() =>
    kabkotDasmen[0] ? Object.keys(kabkotDasmen[0]).filter(k => k.includes("_Label Capaian") &&
      PRIORITY_CODES.some(code => k.toUpperCase().startsWith(code.toUpperCase() + "_"))) : [],
    [kabkotDasmen]
  );

  // Chart: APK/APM/APS keys
  const chartApxKeysDasmen = useMemo(() =>
    kabkotDasmen[0] ? Object.keys(kabkotDasmen[0]).filter(k =>
      APX_PATTERNS.some(p => k.toUpperCase().includes(p)) && k.includes("_Label Capaian")) : [],
    [kabkotDasmen]
  );
  const chartApxKeysPaud = useMemo(() =>
    kabkotPaud[0] ? Object.keys(kabkotPaud[0]).filter(k =>
      APX_PATTERNS.some(p => k.toUpperCase().includes(p)) && k.includes("_Label Capaian")) : [],
    [kabkotPaud]
  );

  // Jenjang list for charts
  const chartJenjangDasmen = useMemo(() =>
    ["Semua", ...[...new Set(kabkotDasmen.map(r => r["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()], [kabkotDasmen]);
  const chartJenjangPaud = useMemo(() =>
    ["Semua", ...[...new Set(kabkotPaud.map(r => r["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()], [kabkotPaud]);
  const chartJenjangAll = useMemo(() =>
    ["Semua", ...[...new Set([...kabkotDasmen, ...kabkotPaud].map(r => r["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()],
    [kabkotDasmen, kabkotPaud]
  );

  // Merged data for all jenjang chart
  const allKabkotData = useMemo(() => ([...kabkotDasmen, ...kabkotPaud] as CapaianKabkot[]), [kabkotDasmen, kabkotPaud]);
  const allChartIndKeys = useMemo(() =>
    allKabkotData[0] ? Object.keys(allKabkotData[0]).filter(k => k.includes("_Label Capaian") &&
      PRIORITY_CODES.some(code => k.toUpperCase().startsWith(code.toUpperCase() + "_"))) : [],
    [allKabkotData]
  );

  // Color palette for indikator keys
  const IND_COLORS: Record<string, string> = {
    "A.1": "#3b82f6", "A.2": "#8b5cf6", "A.3": "#ec4899",
    "D.1": "#f59e0b", "D.3": "#10b981", "D.4": "#ef4444",
    "D.8": "#06b6d4", "D.10": "#f97316",
  };
  const getIndColor = (key: string) => {
    const matched = PRIORITY_CODES.find(c => key.toUpperCase().startsWith(c.toUpperCase() + "_"));
    return matched ? (IND_COLORS[matched] ?? "#64748b") : "#64748b";
  };
  const APX_COLORS: Record<string, string> = { "APK": "#3b82f6", "APM": "#10b981", "APS": "#f59e0b" };
  const getApxColor = (key: string) => {
    const matched = APX_PATTERNS.find(p => key.toUpperCase().includes(p));
    return matched ? (APX_COLORS[matched] ?? "#64748b") : "#64748b";
  };
  const oSDJ = useMemo(() => ["Semua", ...[...new Set(satdikDasmen.map(c => c["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()], [satdikDasmen]);
  const oSDS = useMemo(() => ["Semua", ...[...new Set(satdikDasmen.map(c => c["Status Satuan Pendidikan"]))].filter(Boolean).sort()], [satdikDasmen]);
  const oSDK = useMemo(() => ["Semua", ...[...new Set(satdikDasmen.map(c => c["Kabupaten/Kota"]))].filter(Boolean).sort()], [satdikDasmen]);
  const oSPJ = useMemo(() => ["Semua", ...[...new Set(satdikPaud.map(c => c["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()], [satdikPaud]);
  const oSPS = useMemo(() => ["Semua", ...[...new Set(satdikPaud.map(c => c["Status Satuan Pendidikan"]))].filter(Boolean).sort()], [satdikPaud]);
  const oSPK = useMemo(() => ["Semua", ...[...new Set(satdikPaud.map(c => c["Kabupaten/Kota"]))].filter(Boolean).sort()], [satdikPaud]);

  const fKD = useMemo(() => kabkotDasmen.filter(c =>
    (fKDJ === "Semua" || c["Jenis Satuan Pendidikan"] === fKDJ) &&
    (fKDS === "Semua" || c["Status Satuan Pendidikan"] === fKDS) &&
    (!sKD || c["Kab/Kota"]?.toLowerCase().includes(sKD.toLowerCase()))
  ), [kabkotDasmen, fKDJ, fKDS, sKD]);

  const fKP = useMemo(() => kabkotPaud.filter(c =>
    (fKPS === "Semua" || c["Status Satuan Pendidikan"] === fKPS) &&
    (!sKP || c["Kab/Kota"]?.toLowerCase().includes(sKP.toLowerCase()))
  ), [kabkotPaud, fKPS, sKP]);

  const fSD = useMemo(() => satdikDasmen.filter(c =>
    (fSDJ === "Semua" || c["Jenis Satuan Pendidikan"] === fSDJ) &&
    (fSDS === "Semua" || c["Status Satuan Pendidikan"] === fSDS) &&
    (fSDK === "Semua" || c["Kabupaten/Kota"] === fSDK) &&
    (!sSD || c["Nama Satuan Pendidikan"]?.toLowerCase().includes(sSD.toLowerCase()) || c.NPSN?.includes(sSD))
  ), [satdikDasmen, fSDJ, fSDS, fSDK, sSD]);

  const fSP = useMemo(() => satdikPaud.filter(c =>
    (fSPJ === "Semua" || c["Jenis Satuan Pendidikan"] === fSPJ) &&
    (fSPS === "Semua" || c["Status Satuan Pendidikan"] === fSPS) &&
    (fSPK === "Semua" || c["Kabupaten/Kota"] === fSPK) &&
    (!sSP || c["Nama Satuan Pendidikan"]?.toLowerCase().includes(sSP.toLowerCase()) || c.NPSN?.includes(sSP))
  ), [satdikPaud, fSPJ, fSPS, fSPK, sSP]);

  useEffect(() => setPageSD(1), [fSD.length]);
  useEffect(() => setPageSP(1), [fSP.length]);

  const pagedSD = fSD.slice((pageSD - 1) * PAGE_SIZE, pageSD * PAGE_SIZE);
  const pagedSP = fSP.slice((pageSP - 1) * PAGE_SIZE, pageSP * PAGE_SIZE);

  const iKD = useMemo(() => kabkotDasmen[0] ? Object.keys(kabkotDasmen[0]).filter(k => k.includes("_Label Capaian")) : [], [kabkotDasmen]);
  const iKP = useMemo(() => kabkotPaud[0]   ? Object.keys(kabkotPaud[0]).filter(k => k.includes("_Label Capaian"))   : [], [kabkotPaud]);
  const iSD = useMemo(() => satdikDasmen[0] ? Object.keys(satdikDasmen[0]).filter(k => k.includes("_Label Capaian")) : [], [satdikDasmen]);
  const iSP = useMemo(() => satdikPaud[0]   ? Object.keys(satdikPaud[0]).filter(k => k.includes("_Label Capaian"))   : [], [satdikPaud]);

  const jenjangList = useMemo(() => [...new Set(ringkasan.map(r => r.Jenjang))], [ringkasan]);

  const capaianGroup = (label: string): string => {
    if (["Tinggi", "Baik"].includes(label)) return "Baik / Tinggi";
    if (label === "Sedang") return "Sedang";
    if (["Kurang", "Rendah"].includes(label)) return "Kurang / Rendah";
    return "Tidak Tersedia";
  };

  const borderColorForGroup = (grup: string): string => {
    if (grup === "Baik / Tinggi") return "#22c55e";
    if (grup === "Sedang") return "#eab308";
    if (grup === "Kurang / Rendah") return "#ef4444";
    return "#cbd5e1";
  };

  const jenjangOptionsProvinsi = useMemo(() =>
    ["Semua", ...[...new Set(filteredProvData.map(c => c["Jenis Satuan Pendidikan"]))].filter(Boolean).sort()],
    [filteredProvData]
  );

  const statusOptionsProvinsi = useMemo(() => {
    const statuses = [...new Set(filteredProvData.map(c => c["Status Satuan Pendidikan"]))].filter(Boolean).sort();
    return ["Semua", ...statuses];
  }, [filteredProvData]);

  const groupedProvData = useMemo(() => {
    const grouped: Record<string, Record<string, CapaianProvinsi[]>> = {};
    for (const row of filteredProvData) {
      const jenjang = row["Jenis Satuan Pendidikan"] || "Lainnya";
      const kode = (row.No || "").trim();
      if (!grouped[jenjang]) grouped[jenjang] = {};
      if (!grouped[jenjang][kode]) grouped[jenjang][kode] = [];
      grouped[jenjang][kode].push(row);
    }
    return grouped;
  }, [filteredProvData]);

  const getJenjangGradient = (jenjang: string): string => {
    if (jenjang.toUpperCase().includes("SD")) return "from-blue-500 to-blue-600";
    if (jenjang.toUpperCase().includes("SMP")) return "from-violet-500 to-violet-600";
    if (jenjang.toUpperCase().includes("SMA") || jenjang.toUpperCase().includes("SMK")) return "from-amber-500 to-amber-600";
    if (jenjang.toUpperCase().includes("PAUD") || jenjang.toUpperCase().includes("TK")) return "from-rose-500 to-rose-600";
    return "from-slate-500 to-slate-600";
  };

  function KabkotTable({ rows, indKeys, search, onSearch, jenisList, jenisSel, onJenis, statusList, statusSel, onStatus }: {
    rows: CapaianKabkot[]; indKeys: string[];
    search: string; onSearch: (v: string) => void;
    jenisList?: string[]; jenisSel?: string; onJenis?: (v: string) => void;
    statusList: string[]; statusSel: string; onStatus: (v: string) => void;
  }) {
    const codes = indKeys.map(k => k.replace("_Label Capaian", ""));
    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const [localPage, setLocalPage] = useState(1);
    const pagedRows = rows.slice((localPage - 1) * PAGE_SIZE, localPage * PAGE_SIZE);
    
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <SearchInput value={search} onChange={onSearch} placeholder="Cari kab/kota…" />
          {jenisList && onJenis && jenisSel !== undefined && (
            <SelectFilter value={jenisSel} onChange={onJenis} options={jenisList} className="w-44" />
          )}
          <SelectFilter value={statusSel} onChange={onStatus} options={statusList} className="w-36" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl ml-auto">
            <span className="text-xs font-black text-slate-700">{rows.length}</span>
            <span className="text-xs text-slate-500">wilayah</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Distribusi Capaian</p>
          <DistribusiBar data={rows as unknown as Record<string, string>[]} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] sticky left-0 bg-slate-50 min-w-36">Kab/Kota</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-28">Jenis</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Status</th>
                  {codes.map(c => (
                    <th key={c} className="px-3 py-3 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-16">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={codes.length + 3} className="text-center py-16 text-slate-400">
                      <Search size={20} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs">Tidak ada data ditemukan</p>
                    </td>
                  </tr>
                ) : pagedRows.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-blue-50/30 z-[5]">{row["Kab/Kota"]}</td>
                    <td className="px-4 py-3 text-slate-500">{row["Jenis Satuan Pendidikan"]}</td>
                    <td className="px-4 py-3 text-slate-500">{row["Status Satuan Pendidikan"]}</td>
                    {indKeys.map(k => (
                      <td key={k} className="px-3 py-3 text-center"><LabelBadge label={row[k]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={localPage} total={totalPages} onChange={setLocalPage} />
        </div>
      </div>
    );
  }

  function SatdikTable({ allRows, paged, indKeys, page, totalPages, onPage,
    search, onSearch, jenisList, jenisSel, onJenis,
    statusList, statusSel, onStatus, kabList, kabSel, onKab }: {
    allRows: CapaianSatdik[]; paged: CapaianSatdik[]; indKeys: string[];
    page: number; totalPages: number; onPage: (p: number) => void;
    search: string; onSearch: (v: string) => void;
    jenisList: string[]; jenisSel: string; onJenis: (v: string) => void;
    statusList: string[]; statusSel: string; onStatus: (v: string) => void;
    kabList: string[]; kabSel: string; onKab: (v: string) => void;
  }) {
    const codes = indKeys.map(k => k.replace("_Label Capaian", ""));
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <SearchInput value={search} onChange={onSearch} placeholder="Cari nama satdik atau NPSN…" />
          <SelectFilter value={jenisSel} onChange={onJenis} options={jenisList} className="w-36" />
          <SelectFilter value={statusSel} onChange={onStatus} options={statusList} className="w-32" />
          <SelectFilter value={kabSel} onChange={onKab} options={kabList} className="w-44" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl ml-auto flex-shrink-0">
            <span className="text-xs font-black text-slate-700">{allRows.length.toLocaleString("id")}</span>
            <span className="text-xs text-slate-500">satdik</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Distribusi Capaian</p>
          <DistribusiBar data={allRows as unknown as Record<string, string>[]} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] sticky left-0 bg-slate-50 min-w-52">Nama Satdik</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-24">NPSN</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-32">Kab/Kota</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-28">Jenis</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Status</th>
                  {codes.map(c => (
                    <th key={c} className="px-3 py-3 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-16">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={codes.length + 5} className="text-center py-16 text-slate-400">
                      <Search size={20} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs">Tidak ada data ditemukan</p>
                    </td>
                  </tr>
                ) : paged.map((row, i) => (
                  <tr key={row.NPSN || i} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-blue-50/30 z-[5] leading-snug">{row["Nama Satuan Pendidikan"]}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{row.NPSN}</td>
                    <td className="px-4 py-3 text-slate-500">{row["Kabupaten/Kota"]}</td>
                    <td className="px-4 py-3 text-slate-500">{row["Jenis Satuan Pendidikan"]}</td>
                    <td className="px-4 py-3 text-slate-500">{row["Status Satuan Pendidikan"]}</td>
                    {indKeys.map(k => (
                      <td key={k} className="px-3 py-3 text-center"><LabelBadge label={row[k]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} total={totalPages} onChange={onPage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Modal: Daftar Sekolah per Indikator ── */}
      {schoolModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setSchoolModal(null); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); } }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm"
                  style={{
                    background: schoolModal.labelGroup === "Baik / Tinggi" ? "#22c55e"
                      : schoolModal.labelGroup === "Sedang" ? "#f59e0b" : "#ef4444"
                  }}
                >
                  {schoolModal.indCode}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {schoolModal.indName}
                    <span
                      className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: schoolModal.labelGroup === "Baik / Tinggi" ? "#dcfce7"
                          : schoolModal.labelGroup === "Sedang" ? "#fef9c3" : "#fee2e2",
                        color: schoolModal.labelGroup === "Baik / Tinggi" ? "#166534"
                          : schoolModal.labelGroup === "Sedang" ? "#854d0e" : "#991b1b",
                      }}
                    >
                      {schoolModal.labelGroup}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {schoolModalFiltered.length.toLocaleString("id-ID")} sekolah ditemukan
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSchoolModal(null); setSchoolModalSearch(""); setSchoolModalPage(1); setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); }}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Search & Filters */}
            <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0 space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cari nama sekolah, NPSN, atau kab/kota…"
                  value={schoolModalSearch}
                  onChange={e => { setSchoolModalSearch(e.target.value); setSchoolModalPage(1); }}
                />
              </div>
              {/* Filter dropdowns */}
              <div className="flex gap-3">
                {/* Filter Kabupaten/Kota */}
                <div className="flex-1 relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    value={schoolModalKabkot}
                    onChange={e => {
                      setSchoolModalKabkot(e.target.value);
                      setSchoolModalKecamatan("Semua");
                      setSchoolModalPage(1);
                    }}
                  >
                    {schoolModalKabkotOptions.map(opt => (
                      <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kab/Kota" : opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {/* Filter Kecamatan */}
                <div className="flex-1 relative">
                  <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50"
                    value={schoolModalKecamatan}
                    onChange={e => { setSchoolModalKecamatan(e.target.value); setSchoolModalPage(1); }}
                    disabled={schoolModalKecamatanOptions.length <= 1}
                  >
                    {schoolModalKecamatanOptions.map(opt => (
                      <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kecamatan" : opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {/* Reset filter button */}
                {(schoolModalKabkot !== "Semua" || schoolModalKecamatan !== "Semua") && (
                  <button
                    onClick={() => { setSchoolModalKabkot("Semua"); setSchoolModalKecamatan("Semua"); setSchoolModalPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <XCircle size={12} /> Reset
                  </button>
                )}
              </div>
              {/* Active filter summary */}
              {(schoolModalKabkot !== "Semua" || schoolModalKecamatan !== "Semua") && (
                <div className="flex items-center gap-2 flex-wrap">
                  {schoolModalKabkot !== "Semua" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
                      <MapPin size={10} /> {schoolModalKabkot}
                    </span>
                  )}
                  {schoolModalKecamatan !== "Semua" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold">
                      <Filter size={10} /> Kec. {schoolModalKecamatan}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{schoolModalFiltered.length.toLocaleString("id-ID")} sekolah</span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="text-xs w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-52">Nama Satdik</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-24">NPSN</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-32">Kab/Kota</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Jenis</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Kecamatan</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px]">Capaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolModalPaged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400">
                        <Search size={20} className="mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Tidak ada sekolah ditemukan</p>
                      </td>
                    </tr>
                  ) : schoolModalPaged.map((row, i) => {
                    const labelKey = Object.keys(row).find(k => {
                      const ku = k.toUpperCase();
                      const cu = schoolModal.indCode.toUpperCase();
                      return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
                    });
                    const labelVal = labelKey ? (row[labelKey] ?? "").trim() : "";
                    return (
                      <tr key={row.NPSN || i} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-4 py-3 font-semibold text-slate-800 leading-snug">{row["Nama Satuan Pendidikan"]}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{row.NPSN}</td>
                        <td className="px-4 py-3 text-slate-600">{row["Kabupaten/Kota"]}</td>
                        <td className="px-4 py-3 text-slate-500">{row["Jenis Satuan Pendidikan"]}</td>
                        <td className="px-4 py-3 text-slate-500">{row["Status Satuan Pendidikan"]}</td>
                        <td className="px-4 py-3 text-slate-400 text-[11px]">{row.Kecamatan || "–"}</td>
                        <td className="px-4 py-3 text-center"><LabelBadge label={labelVal} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {schoolModalTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
                <PaginationBar page={schoolModalPage} total={schoolModalTotalPages} onChange={p => setSchoolModalPage(p)} />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 h-16 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition">
            <ArrowLeft size={14} />
          </div>
          <span className="hidden sm:inline">Beranda</span>
        </Link>
        <div className="w-px h-5 bg-slate-200" />

        <nav className="flex gap-1">
          <Link
            href="/pilih-wilayah"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            Pilih Wilayah
          </Link>
          <Link
            href="/dashboard-provinsi"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition"
          >
            Dashboard Provinsi
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-bold text-slate-800">
              JAWA <span className="text-amber-500">BARAT</span>
            </p>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(["2024","2025"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTahun(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  tahun === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="text-white px-6 py-12 relative z-10"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e1b4b 100%)" }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px opacity-5" style={{ background: "linear-gradient(90deg, transparent, white, transparent)" }} />
          </div>
          
          <div className="max-w-6xl mx-auto relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur text-xs font-semibold border border-white/20">
                📊 Rapor Pendidikan {tahun}
              </div>
              {useMockData && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30 text-xs font-semibold text-amber-300">
                  Data Contoh
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">
              Dashboard Provinsi{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                Jawa Barat
              </span>
            </h1>
            <p className="text-sm text-blue-200 max-w-xl leading-relaxed">
              Capaian indikator prioritas provinsi, kab/kota, dan satuan pendidikan — Dasmen, Vokasi &amp; PAUD
            </p>

            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mt-8">
                {[
                  { icon: <BarChart3 size={15} />, label: "Indikator Prioritas", val: filteredProvData.length, gradient: "from-blue-400/80 to-blue-500/80" },
                  { icon: <MapPin size={15} />, label: "Kab/Kota Dasmen", val: new Set(kabkotDasmen.map(k => k["Kab/Kota"])).size, gradient: "from-purple-400/80 to-purple-500/80" },
                  { icon: <Layers size={15} />, label: "Kab/Kota PAUD", val: new Set(kabkotPaud.map(k => k["Kab/Kota"])).size, gradient: "from-pink-400/80 to-pink-500/80" },
                  { icon: <Users size={15} />, label: "Total Satdik", val: satdikDasmen.length + satdikPaud.length, gradient: "from-orange-400/80 to-orange-500/80" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 border border-white/20`}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-black tracking-tight">{s.val.toLocaleString("id")}</p>
                    <p className="text-xs text-blue-200 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 40" fill="#f8fafc" className="w-full">
            <path d="M0,20L60,22C120,24,240,28,360,28C480,28,600,24,720,20C840,16,960,12,1080,14C1200,16,1320,24,1380,26L1440,28L1440,40L0,40Z"/>
          </svg>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isTabSwitching}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${tab.activeColor} ${tab.activeBorder} ${tab.activeBg}`
                    : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                } ${isTabSwitching ? "opacity-50 cursor-wait" : ""}`}
              >
                <span className={activeTab === tab.id ? tab.activeColor : "text-slate-400"}>
                  {tab.icon}
                </span>
                {tab.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        {isTabSwitching && <TabLoadingState />}

        {!isTabSwitching && (
          <>
            {loading && (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200 animate-pulse mb-5">
                  <BarChart3 size={28} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Memuat semua data...</p>
                <p className="text-xs text-slate-400 mt-1">Harap tunggu sebentar</p>
              </div>
            )}

            {error && (
              <div className="bg-white border border-red-100 rounded-2xl p-10 text-center max-w-lg mx-auto mt-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <p className="text-base font-bold text-slate-800 mb-1">Gagal Memuat Data</p>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{error}</p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setUseMockData(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-200"
                  >
                    Gunakan Data Contoh
                  </button>
                  <button
                    onClick={async () => {
                      console.log('Checking data availability for', tahun);
                      const files = [
                        '1_ringkasan_capaian_jenjang.json',
                        '2_capaian_provinsi.json',
                        '3_capaian_kabkot_dasmen_vokasi.json',
                        '4_capaian_kabkot_paud.json',
                        '5_capaian_satdik_dasmen_vokasi.json',
                        '6_capaian_satdik_paud.json'
                      ];
                      
                      for (const file of files) {
                        try {
                          const res = await fetch(`/dataProvinsi/${tahun}/${file}`);
                          console.log(`${file}: ${res.status} ${res.statusText}`);
                          if (res.ok) {
                            const data = await res.json();
                            console.log(`${file} data length:`, Array.isArray(data) ? data.length : 'not array');
                          }
                        } catch (err) {
                          console.error(`${file}: error`, err);
                        }
                      }
                    }}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
                  >
                    Debug Console
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Tab: Ringkasan */}
                {activeTab === "ringkasan" && (
                  <div>
                    <SectionHeader
                      icon={<BookMarked size={18} />}
                      title="Ringkasan Capaian Jenjang"
                      badge={`${jenjangList.length} jenjang · Tahun ${tahun}`}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jenjangList.map(jenjang => {
                        const items = ringkasan.filter(r => r.Jenjang === jenjang);
                        const gradient = getJenjangGradient(jenjang);
                        
                        return (
                          <div key={jenjang} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                            <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center gap-3`}>
                              <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                                {jenjang.includes("SD") && <School size={14} className="text-white" />}
                                {jenjang.includes("SMP") && <BookOpen size={14} className="text-white" />}
                                {jenjang.includes("SMA") && <GraduationCap size={14} className="text-white" />}
                                {jenjang.includes("PAUD") && <Building2 size={14} className="text-white" />}
                              </div>
                              <div>
                                <span className="font-black text-white text-base">{jenjang}</span>
                                <p className="text-white/60 text-[10px] mt-0.5">{items.length} indikator prioritas</p>
                              </div>
                            </div>
                            <div className="divide-y divide-slate-100/70">
                              {items.map((item, i) => (
                                <div key={i} className="px-5 py-3.5 hover:bg-slate-50/80 transition flex items-start gap-3">
                                  <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                      {item.Capaian}
                                    </p>
                                    <p className="text-xs text-slate-700 font-semibold leading-tight">
                                      {item["Indikator Prioritas"]}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab: Indikator Prioritas */}
                {activeTab === "provinsi" && (
                  <div>
                    <SectionHeader
                      icon={<BarChart3 size={18} />}
                      title="Rekap Capaian Indikator Prioritas"
                      badge={`8 Indikator Utama · Tahun ${tahun} · ${filterStatus === "Semua" ? "Negeri + Swasta" : filterStatus}`}
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
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-emerald-600">Baik/Tinggi <span className="text-[9px] font-normal opacity-60 normal-case">↗ klik lihat sekolah</span></th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-amber-600">Sedang <span className="text-[9px] font-normal opacity-60 normal-case">↗ klik</span></th>
                              <th className="px-5 py-3 text-center font-bold text-[10px] uppercase tracking-wider text-red-600">Kurang/Rendah <span className="text-[9px] font-normal opacity-60 normal-case">↗ klik</span></th>
                              <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] min-w-40">Distribusi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {PRIORITY_INDICATORS.map(p => {
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
                                    ) : <span className="text-slate-300">–</span>}
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
                                    ) : <span className="text-slate-300">–</span>}
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
                                    ) : <span className="text-slate-300">–</span>}
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
                                .sort((a, b) => b[1].total - a[1].total)
                                .map(([jenjang, stats]) => {
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
                        {PRIORITY_INDICATORS.map(p => (
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
                          {Object.keys(groupedProvData).filter(j => filterJenjang === "Semua" || j === filterJenjang).length}
                        </span>
                        <span className="text-xs text-slate-500">Jenjang</span>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="space-y-6">
                      {Object.keys(groupedProvData)
                        .filter(j => filterJenjang === "Semua" || j === filterJenjang)
                        .map(jenjang => {
                          const indikatorMap = groupedProvData[jenjang];
                          const indikatorCodes = Object.keys(indikatorMap);
                          const gradient = getJenjangGradient(jenjang);

                          let hasVisible = false;
                          for (const kode of indikatorCodes) {
                            const rows = indikatorMap[kode];
                            let filtered = rows;
                            if (filterStatus !== "Semua") filtered = filtered.filter(r => r["Status Satuan Pendidikan"] === filterStatus);
                            if (filterCapaian !== "Semua") {
                              filtered = filtered.filter(r => {
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
                                      filteredRows = filteredRows.filter(r => r["Status Satuan Pendidikan"] === filterStatus);
                                    }
                                    if (filterCapaian !== "Semua") {
                                      filteredRows = filteredRows.filter(r => {
                                        const label = ((tahun === "2025" ? r["Label Capaian 2025"] : r["Label Capaian 2024"]) ?? "").trim();
                                        return capaianGroup(label) === filterCapaian;
                                      });
                                    }
                                    if (filteredRows.length === 0) return null;

                                    const indicatorInfo = PRIORITY_INDICATORS.find(p => p.code === kode);
                                    const indicatorName = indicatorInfo?.fullName || kode;
                                    const indicatorDesc = indicatorInfo?.description || "";

                                    return filteredRows.map((row, idx) => {
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
                                                    {nilaiVal ?? "–"}
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
                                                      {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
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

                      {Object.keys(groupedProvData).filter(j => filterJenjang === "Semua" || j === filterJenjang).length === 0 && (
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
                )}

                {/* Tab: Grafik Kab/Kota */}
                {activeTab === "grafik-kabkot" && (
                  <div className="space-y-8">
                    <SectionHeader
                      icon={<PieChart size={18} />}
                      title="Grafik Capaian 27 Kab/Kota"
                      badge={`Tahun ${tahun} · Data per kabupaten/kota`}
                    />

                    {/* ── Grafik 1: Indikator Prioritas per Jenjang ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 rounded-full bg-blue-500" />
                        <h3 className="text-base font-black text-slate-800">1. Capaian Indikator Prioritas per Kab/Kota</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 ml-3">
                        Skor rata-rata (1=Kurang · 2=Sedang · 3=Baik · 4=Tinggi) untuk setiap indikator prioritas A.1–D.10
                      </p>
                      {(allChartIndKeys.length > 0 || chartIndKeys.length > 0) ? (
                        <StackedBarChart
                          title="Indikator Prioritas (A.1, A.2, A.3, D.1, D.3, D.4, D.8, D.10)"
                          subtitle="Pilih jenjang untuk memfilter data"
                          data={allKabkotData}
                          jenjangList={chartJenjangAll}
                          selectedJenjang={chartIndJenjang}
                          onJenjangChange={setChartIndJenjang}
                          indikatorKeys={allChartIndKeys.length > 0 ? allChartIndKeys : chartIndKeys}
                          colorFn={getIndColor}
                        />
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                          <p className="text-sm font-semibold text-amber-700">Data indikator prioritas kabkot belum tersedia</p>
                          <p className="text-xs text-amber-600 mt-1">Pastikan kolom <code>A.1_Label Capaian</code>, <code>A.2_Label Capaian</code>, dst. ada di file JSON</p>
                        </div>
                      )}
                    </div>

                    {/* ── Grafik 2: APK, APM, APS per Jenjang ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 rounded-full bg-emerald-500" />
                        <h3 className="text-base font-black text-slate-800">2. Capaian APK, APM, dan APS per Kab/Kota</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 ml-3">
                        Angka Partisipasi Kasar (APK), Murni (APM), dan Sekolah (APS) — skor rata-rata per kab/kota
                      </p>
                      {chartApxKeysDasmen.length > 0 ? (
                        <StackedBarChart
                          title="APK / APM / APS — Dasmen & Vokasi"
                          subtitle="Pilih jenjang SD / SMP / SMA / SMK"
                          data={kabkotDasmen}
                          jenjangList={chartJenjangDasmen}
                          selectedJenjang={chartApxJenjang}
                          onJenjangChange={setChartApxJenjang}
                          indikatorKeys={chartApxKeysDasmen}
                          colorFn={getApxColor}
                        />
                      ) : chartApxKeysPaud.length > 0 ? (
                        <StackedBarChart
                          title="APK / APM / APS — PAUD"
                          subtitle="Data PAUD"
                          data={kabkotPaud}
                          jenjangList={chartJenjangPaud}
                          selectedJenjang={chartApxJenjang}
                          onJenjangChange={setChartApxJenjang}
                          indikatorKeys={chartApxKeysPaud}
                          colorFn={getApxColor}
                        />
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                          <p className="text-sm font-semibold text-amber-700">Data APK/APM/APS kabkot belum tersedia</p>
                          <p className="text-xs text-amber-600 mt-1">Pastikan kolom seperti <code>APK_Label Capaian</code>, <code>APM_Label Capaian</code>, <code>APS_Label Capaian</code> ada di file JSON</p>
                        </div>
                      )}
                    </div>

                    {/* ── Grafik 3: Trend Indikator Prioritas ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 rounded-full bg-purple-500" />
                        <h3 className="text-base font-black text-slate-800">3. Tren Indikator Prioritas — Naik & Turun per Kab/Kota</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 ml-3">
                        Berapa banyak indikator yang meningkat atau menurun dibanding tahun sebelumnya
                      </p>
                      <TrendChart
                        title="Tren Indikator Prioritas (2024 → 2025)"
                        subtitle="Jumlah indikator yang naik (hijau), turun (merah), atau tetap (abu)"
                        data={allKabkotData}
                        jenjangList={chartJenjangAll}
                        selectedJenjang={chartTrendIndJenjang}
                        onJenjangChange={setChartTrendIndJenjang}
                        tahun={tahun}
                        indikatorKeys={allChartIndKeys.length > 0 ? allChartIndKeys : chartIndKeys}
                        colorFn={getIndColor}
                      />
                    </div>

                    {/* ── Grafik 4: Trend APK/APM/APS ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 rounded-full bg-orange-500" />
                        <h3 className="text-base font-black text-slate-800">4. Tren APK, APM, APS — Naik & Turun per Kab/Kota</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 ml-3">
                        Perubahan capaian APK/APM/APS dibandingkan tahun sebelumnya per kab/kota
                      </p>
                      <TrendChart
                        title="Tren APK / APM / APS (2024 → 2025)"
                        subtitle="Jumlah indikator partisipasi yang naik (hijau), turun (merah), atau tetap (abu)"
                        data={chartApxKeysDasmen.length > 0 ? kabkotDasmen : kabkotPaud}
                        jenjangList={chartApxKeysDasmen.length > 0 ? chartJenjangDasmen : chartJenjangPaud}
                        selectedJenjang={chartTrendApxJenjang}
                        onJenjangChange={setChartTrendApxJenjang}
                        tahun={tahun}
                        indikatorKeys={chartApxKeysDasmen.length > 0 ? chartApxKeysDasmen : chartApxKeysPaud}
                        colorFn={getApxColor}
                      />
                    </div>

                    {/* Info box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <p className="text-xs font-bold text-slate-600 mb-2">ℹ️ Tentang Grafik ini</p>
                      <ul className="text-xs text-slate-500 space-y-1">
                        <li>• Skor dihitung dari label capaian: <strong>Tinggi=4, Baik=3, Sedang=2, Kurang/Rendah=1</strong></li>
                        <li>• Jika satu kab/kota memiliki data Negeri dan Swasta, nilai dirata-rata</li>
                        <li>• Data tren memerlukan kolom tahun ganda (<code>_Label Capaian 2024</code> & <code>_Label Capaian 2025</code>) di file JSON</li>
                        <li>• APK/APM/APS akan muncul otomatis jika kolom tersedia di data JSON</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab: Kab/Kota Dasmen */}
                {activeTab === "kabkot-dasmen" && (
                  <div>
                    <SectionHeader
                      icon={<MapPin size={18} />}
                      title="Capaian Kab/Kota — Dasmen & Vokasi"
                      badge={`Tahun ${tahun}`}
                    />
                    <KabkotTable
                      rows={fKD} indKeys={iKD}
                      search={sKD} onSearch={setSKD}
                      jenisList={oKDJ} jenisSel={fKDJ} onJenis={setFKDJ}
                      statusList={oKDS} statusSel={fKDS} onStatus={setFKDS}
                    />
                  </div>
                )}

                {/* Tab: Kab/Kota PAUD */}
                {activeTab === "kabkot-paud" && (
                  <div>
                    <SectionHeader
                      icon={<Layers size={18} />}
                      title="Capaian Kab/Kota — PAUD"
                      badge={`Tahun ${tahun}`}
                    />
                    <KabkotTable
                      rows={fKP} indKeys={iKP}
                      search={sKP} onSearch={setSKP}
                      statusList={oKPS} statusSel={fKPS} onStatus={setFKPS}
                    />
                  </div>
                )}

                {/* Tab: Satdik Dasmen */}
                {activeTab === "satdik-dasmen" && (
                  <div>
                    <SectionHeader
                      icon={<School size={18} />}
                      title="Capaian Satuan Pendidikan — Dasmen & Vokasi"
                      badge={`Tahun ${tahun} · SATDIK keagamaan tidak ditampilkan`}
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
                )}

                {/* Tab: Satdik PAUD */}
                {activeTab === "satdik-paud" && (
                  <div>
                    <SectionHeader
                      icon={<GraduationCap size={18} />}
                      title="Capaian Satuan Pendidikan — PAUD"
                      badge={`Tahun ${tahun} · SATDIK keagamaan tidak ditampilkan`}
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
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}