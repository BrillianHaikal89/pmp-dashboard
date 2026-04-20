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

type TabId = "ringkasan" | "provinsi" | "kabkot-dasmen" | "kabkot-paud" | "satdik-dasmen" | "satdik-paud";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_CODES = ["A.1", "A.2", "A.3", "D.1", "D.3", "D.4", "D.8", "D.10"];

const PRIORITY_INDICATORS = [
  { code: "A.1",  fullName: "Literasi", description: "Kemampuan memahami dan menggunakan informasi" },
  { code: "A.2",  fullName: "Numerasi", description: "Kemampuan bernalar menggunakan matematika" },
  { code: "A.3",  fullName: "Karakter", description: "Penguatan profil pelajar Pancasila" },
  { code: "D.1",  fullName: "Partisipasi D.1", description: "Partisipasi dalam pembelajaran" },
  { code: "D.3",  fullName: "Partisipasi D.3", description: "Partisipasi dalam kegiatan sekolah" },
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
        {options.map((o, idx) => <option key={`${o}-${idx}`}>{o}</option>)}
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
    <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center animate-pulse">
        <Loader2 size={24} className="text-blue-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">Memuat data...</p>
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
    
    for (const row of filteredProvData) {
      const label = ((tahun === "2025" ? row["Label Capaian 2025"] : row["Label Capaian 2024"]) ?? "").trim();
      if (label === "Tinggi" || label === "Baik") baikTinggi++;
      else if (label === "Sedang") sedang++;
      else if (label === "Kurang" || label === "Rendah") kurangRendah++;
      else tidakTersedia++;
    }
    
    return { baikTinggi, sedang, kurangRendah, tidakTersedia, total: filteredProvData.length };
  }, [filteredProvData, tahun]);

  const jenjangStats = useMemo(() => {
    const stats: Record<string, { baikTinggi: number; sedang: number; kurangRendah: number; tidakTersedia: number; total: number }> = {};
    
    for (const row of filteredProvData) {
      const jenjang = row["Jenis Satuan Pendidikan"] || "Lainnya";
      const label = ((tahun === "2025" ? row["Label Capaian 2025"] : row["Label Capaian 2024"]) ?? "").trim();
      
      if (!stats[jenjang]) {
        stats[jenjang] = { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
      }
      
      if (label === "Tinggi" || label === "Baik") stats[jenjang].baikTinggi++;
      else if (label === "Sedang") stats[jenjang].sedang++;
      else if (label === "Kurang" || label === "Rendah") stats[jenjang].kurangRendah++;
      else stats[jenjang].tidakTersedia++;
      
      stats[jenjang].total++;
    }
    
    return stats;
  }, [filteredProvData, tahun]);

  const baikTinggiPercent = totalDashboardStats.total > 0 
    ? Math.round((totalDashboardStats.baikTinggi / totalDashboardStats.total) * 100) 
    : 0;
  const sedangPercent = totalDashboardStats.total > 0 
    ? Math.round((totalDashboardStats.sedang / totalDashboardStats.total) * 100) 
    : 0;
  const kurangRendahPercent = totalDashboardStats.total > 0 
    ? Math.round((totalDashboardStats.kurangRendah / totalDashboardStats.total) * 100) 
    : 0;

  const oKDJ = useMemo(() => ["Semua", ...new Set(kabkotDasmen.map(c => c["Jenis Satuan Pendidikan"]))], [kabkotDasmen]);
  const oKDS = useMemo(() => ["Semua", ...new Set(kabkotDasmen.map(c => c["Status Satuan Pendidikan"]))], [kabkotDasmen]);
  const oKPS = useMemo(() => ["Semua", ...new Set(kabkotPaud.map(c => c["Status Satuan Pendidikan"]))], [kabkotPaud]);
  const oSDJ = useMemo(() => ["Semua", ...new Set(satdikDasmen.map(c => c["Jenis Satuan Pendidikan"]))], [satdikDasmen]);
  const oSDS = useMemo(() => ["Semua", ...new Set(satdikDasmen.map(c => c["Status Satuan Pendidikan"]))], [satdikDasmen]);
  const oSDK = useMemo(() => ["Semua", ...[...new Set(satdikDasmen.map(c => c["Kabupaten/Kota"]))].sort()], [satdikDasmen]);
  const oSPJ = useMemo(() => ["Semua", ...new Set(satdikPaud.map(c => c["Jenis Satuan Pendidikan"]))], [satdikPaud]);
  const oSPS = useMemo(() => ["Semua", ...new Set(satdikPaud.map(c => c["Status Satuan Pendidikan"]))], [satdikPaud]);
  const oSPK = useMemo(() => ["Semua", ...[...new Set(satdikPaud.map(c => c["Kabupaten/Kota"]))].sort()], [satdikPaud]);

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
    ["Semua", ...new Set(filteredProvData.map(c => c["Jenis Satuan Pendidikan"]))],
    [filteredProvData]
  );

  const statusOptionsProvinsi = useMemo(() => {
    const statuses = new Set(filteredProvData.map(c => c["Status Satuan Pendidikan"]));
    return ["Semua", ...Array.from(statuses)];
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
        <div className="flex flex-wrap gap-2 items-center">
          <SearchInput value={search} onChange={onSearch} placeholder="Cari kab/kota…" />
          {jenisList && onJenis && jenisSel !== undefined && (
            <SelectFilter value={jenisSel} onChange={onJenis} options={jenisList} className="w-44" />
          )}
          <SelectFilter value={statusSel} onChange={onStatus} options={statusList} className="w-36" />
          <div className="flex items-center px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-500">{rows.length} <span className="font-normal">wilayah</span></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Distribusi Capaian</p>
          <DistribusiBar data={rows as unknown as Record<string, string>[]} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide sticky left-0 bg-slate-50 min-w-36">Kab/Kota</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide min-w-28">Jenis</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide min-w-20">Status</th>
                  {codes.map(c => (
                    <th key={c} className="px-3 py-3 text-center font-bold text-slate-600 uppercase tracking-wide min-w-16">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={codes.length + 3} className="text-center py-16 text-slate-400">
                      <Search size={24} className="mx-auto mb-2 opacity-40" />
                      <p>Tidak ada data ditemukan</p>
                    </td>
                  </tr>
                ) : pagedRows.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-blue-50/40 z-[5]">{row["Kab/Kota"]}</td>
                    <td className="px-4 py-3 text-slate-600">{row["Jenis Satuan Pendidikan"]}</td>
                    <td className="px-4 py-3 text-slate-600">{row["Status Satuan Pendidikan"]}</td>
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
        <div className="flex flex-wrap gap-2 items-center">
          <SearchInput value={search} onChange={onSearch} placeholder="Cari nama satdik atau NPSN…" />
          <SelectFilter value={jenisSel} onChange={onJenis} options={jenisList} className="w-40" />
          <SelectFilter value={statusSel} onChange={onStatus} options={statusList} className="w-32" />
          <SelectFilter value={kabSel} onChange={onKab} options={kabList} className="w-44" />
          <div className="flex items-center px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-500">{allRows.length.toLocaleString("id")} <span className="font-normal">satdik</span></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Distribusi Capaian (hasil filter)</p>
          <DistribusiBar data={allRows as unknown as Record<string, string>[]} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide sticky left-0 bg-slate-50 min-w-52">Nama Satdik</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide min-w-24">NPSN</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide min-w-32">Kab/Kota</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide min-w-28">Jenis</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wide min-w-20">Status</th>
                  {codes.map(c => (
                    <th key={c} className="px-3 py-3 text-center font-bold text-slate-600 uppercase tracking-wide min-w-16">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={codes.length + 5} className="text-center py-16 text-slate-400">
                      <Search size={24} className="mx-auto mb-2 opacity-40" />
                      <p>Tidak ada data ditemukan</p>
                    </td>
                  </tr>
                ) : paged.map((row, i) => (
                  <tr key={row.NPSN || i} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-blue-50/40 z-[5] leading-snug">{row["Nama Satuan Pendidikan"]}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">{row.NPSN}</td>
                    <td className="px-4 py-3 text-slate-600">{row["Kabupaten/Kota"]}</td>
                    <td className="px-4 py-3 text-slate-600">{row["Jenis Satuan Pendidikan"]}</td>
                    <td className="px-4 py-3 text-slate-600">{row["Status Satuan Pendidikan"]}</td>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {jenjangList.map(jenjang => {
                        const items = ringkasan.filter(r => r.Jenjang === jenjang);
                        const gradient = getJenjangGradient(jenjang);
                        
                        return (
                          <div key={jenjang} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200">
                            <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center gap-2`}>
                              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                                {jenjang.includes("SD") && <School size={12} className="text-white" />}
                                {jenjang.includes("SMP") && <BookOpen size={12} className="text-white" />}
                                {jenjang.includes("SMA") && <GraduationCap size={12} className="text-white" />}
                                {jenjang.includes("PAUD") && <Building2 size={12} className="text-white" />}
                              </div>
                              <span className="font-bold text-white text-sm">{jenjang}</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                              {items.map((item, i) => (
                                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                    {item.Capaian}
                                  </p>
                                  <p className="text-xs text-slate-700 font-medium">
                                    {item["Indikator Prioritas"]}
                                  </p>
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
                        subtitle={`${totalDashboardStats.baikTinggi} dari ${totalDashboardStats.total} indikator`}
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

                    {/* Progress Ringkasan */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <PieChart size={14} className="text-white" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">Ringkasan Capaian</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                          >
                            <Grid3x3 size={16} />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                          >
                            <LayoutGrid size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex rounded-full overflow-hidden h-3 gap-px mb-4">
                        <div
                          className="flex items-center justify-center text-xs font-bold text-white transition-all"
                          style={{ width: `${baikTinggiPercent}%`, background: "#22c55e" }}
                        >
                          {baikTinggiPercent > 12 && `${baikTinggiPercent}%`}
                        </div>
                        <div
                          className="flex items-center justify-center text-xs font-bold text-white transition-all"
                          style={{ width: `${sedangPercent}%`, background: "#eab308" }}
                        >
                          {sedangPercent > 12 && `${sedangPercent}%`}
                        </div>
                        <div
                          className="flex items-center justify-center text-xs font-bold text-white transition-all"
                          style={{ width: `${kurangRendahPercent}%`, background: "#ef4444" }}
                        >
                          {kurangRendahPercent > 12 && `${kurangRendahPercent}%`}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-slate-600">Baik/Tinggi</span>
                          <span className="font-bold text-slate-800">{totalDashboardStats.baikTinggi}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="text-slate-600">Sedang</span>
                          <span className="font-bold text-slate-800">{totalDashboardStats.sedang}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-slate-600">Kurang/Rendah</span>
                          <span className="font-bold text-slate-800">{totalDashboardStats.kurangRendah}</span>
                        </span>
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                      <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-200 flex items-center justify-center">
                          <Info size={12} className="text-blue-700" />
                        </div>
                        Indikator Prioritas yang Ditampilkan
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {PRIORITY_INDICATORS.map(p => (
                          <div key={p.code} className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              {p.code}
                            </span>
                            <span className="text-xs text-slate-600">{p.fullName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-3 mb-6 items-center">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Filter size={12} />
                        <span>Filter:</span>
                      </div>
                      <SelectFilter
                        value={filterJenjang}
                        onChange={setFilterJenjang}
                        options={jenjangOptionsProvinsi}
                        className="w-48"
                        icon={<School size={12} />}
                      />
                      <SelectFilter
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={statusOptionsProvinsi}
                        className="w-36"
                        icon={<Building2 size={12} />}
                      />
                      <div className="flex gap-1.5">
                        {(["Semua", "Baik / Tinggi", "Sedang", "Kurang / Rendah"] as const).map(opt => {
                          const isActive = filterCapaian === opt;
                          let activeClass = "bg-slate-800 text-white border-slate-800";
                          let bgClass = "";
                          if (opt === "Baik / Tinggi") { activeClass = "bg-emerald-600 text-white border-emerald-600"; bgClass = "hover:bg-emerald-50"; }
                          if (opt === "Sedang") { activeClass = "bg-yellow-500 text-white border-yellow-500"; bgClass = "hover:bg-yellow-50"; }
                          if (opt === "Kurang / Rendah") { activeClass = "bg-red-600 text-white border-red-600"; bgClass = "hover:bg-red-50"; }
                          if (opt === "Semua") { activeClass = "bg-slate-800 text-white border-slate-800"; bgClass = "hover:bg-slate-100"; }
                          
                          return (
                            <button
                              key={opt}
                              onClick={() => setFilterCapaian(opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                isActive 
                                  ? activeClass 
                                  : `bg-white text-slate-600 border-slate-200 ${bgClass} hover:border-slate-300`
                              }`}
                            >
                              {opt === "Semua" ? "Semua Capaian" : opt}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center px-3 py-1.5 bg-slate-100 rounded-lg ml-auto">
                        <span className="text-xs font-semibold text-slate-600">
                          {Object.keys(groupedProvData).filter(j => filterJenjang === "Semua" || j === filterJenjang).length} Jenjang
                        </span>
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
                            <div key={jenjang} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                              <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                    {jenjang.includes("SD") && <School size={13} className="text-white" />}
                                    {jenjang.includes("SMP") && <BookOpen size={13} className="text-white" />}
                                    {jenjang.includes("SMA") && <GraduationCap size={13} className="text-white" />}
                                    {jenjang.includes("PAUD") && <Building2 size={13} className="text-white" />}
                                  </div>
                                  <span className="font-bold text-white">{jenjang}</span>
                                  <span className="text-white/70 text-xs ml-2">{indikatorCodes.length} indikator</span>
                                </div>
                              </div>

                              <div className="p-5">
                                <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4`}>
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
                                          className="group relative rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
                                        >
                                          <div 
                                            className="px-4 py-3 flex items-center justify-between"
                                            style={{ 
                                              background: `linear-gradient(135deg, ${borderColor}15 0%, ${borderColor}08 100%)`,
                                              borderBottom: `2px solid ${borderColor}30`
                                            }}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div 
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                style={{ background: borderColor }}
                                              >
                                                {kode.split('.')[0]}
                                              </div>
                                              <div>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="font-mono text-xs font-bold text-slate-700">
                                                    {kode}
                                                  </span>
                                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                    isNegeri ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                                  }`}>
                                                    {status}
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                  {indicatorName}
                                                </p>
                                              </div>
                                            </div>
                                            <LabelBadge label={label} />
                                          </div>

                                          <div className="p-4">
                                            {indicatorDesc && (
                                              <p className="text-[10px] text-slate-400 mb-3 line-clamp-2">
                                                {indicatorDesc}
                                              </p>
                                            )}

                                            <div className="mb-3">
                                              <div className="flex items-baseline justify-between mb-1">
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                  Nilai Capaian {tahun}
                                                </p>
                                                {tahun === "2025" && row["Nilai Capaian 2024"] && (
                                                  <p className="text-[9px] text-slate-400">
                                                    vs {row["Nilai Capaian 2024"]} (2024)
                                                  </p>
                                                )}
                                              </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-slate-900">
                                                  {nilaiVal ?? "–"}
                                                </span>
                                                {nilaiVal && (
                                                  <span className="text-xs text-slate-500">
                                                    / 100
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {numericValue !== null && !isNaN(numericValue) && (
                                              <div className="mb-3">
                                                <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                                  <div 
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${numericValue}%`, background: borderColor }}
                                                  />
                                                </div>
                                                <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                                                  <span>0</span>
                                                  <span>50</span>
                                                  <span>100</span>
                                                </div>
                                              </div>
                                            )}

                                            {perubahan && (
                                              <div className="mt-3 pt-3 border-t border-slate-100">
                                                <PerubahanBadge val={perubahan} />
                                              </div>
                                            )}

                                            {row["Nilai Capaian 2024"] && tahun === "2025" && (
                                              <div className="mt-2 text-[10px] text-slate-400">
                                                {(() => {
                                                  const oldVal = parseFloat(row["Nilai Capaian 2024"]);
                                                  const newVal = parseFloat(nilaiVal || "0");
                                                  const diff = newVal - oldVal;
                                                  if (!isNaN(diff) && diff !== 0) {
                                                    return (
                                                      <span className={diff > 0 ? "text-emerald-600" : "text-red-600"}>
                                                        {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(1)} poin dari tahun lalu
                                                      </span>
                                                    );
                                                  }
                                                  return null;
                                                })()}
                                              </div>
                                            )}
                                          </div>

                                          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                            <span>Rapor Pendidikan {tahun}</span>
                                            <div className="flex items-center gap-1">
                                              <BarChart3 size={10} />
                                              <span>Asesmen Nasional</span>
                                            </div>
                                          </div>
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
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-500">Tidak ada data yang ditemukan</p>
                          <p className="text-xs text-slate-400 mt-1">Coba ubah filter yang dipilih</p>
                        </div>
                      )}
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