// app/dashboard/kab_bandung/page.tsx
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  LayoutDashboard, MapPin, School, Baby, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Search, ChevronLeft,
  ChevronRight, ArrowUpDown, Menu, Award, Target, BookOpen,
  Filter, GitCompare, Calendar, ArrowRight, CheckCircle, XCircle,
  Layers
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type TahunFilter = "2024" | "2025" | "banding";

interface KabkotRow {
  jenis_satdik: string; status: string; no: string;
  indikator_short: string; label_2024: string;
  nilai_2024_num: number | null; nilai_2023_num: number | null;
  perubahan: string; peringkat_provinsi: string;
  capaian_status?: string;
}
interface SatdikRow {
  npsn: string; nama: string; jenis: string; status: string;
  kabkot: string; kecamatan: string;
  label_literasi: string; label_numerasi: string; label_karakter: string;
  tahun?: string;
}
interface PaudRow {
  npsn: string; nama: string; jenis: string; status: string;
  kabkot: string; kecamatan: string;
  label_perencanaan: string; label_proses: string;
  label_kemampuan_fondasi: string; label_sarana: string;
  tahun?: string;
}
interface AkarRow {
  kelompok: string; kategori: string; indikator_kinerja: string;
  indikator_prioritas: string; kelompok_akar: string; no_akar: string;
  indikator_akar: string; mengapa: string;
}
interface DashData {
  spm_value: string; tahun?: string; ringkasan: any[];
  spm_nilai_num?: number | null;
  capaian_status?: string;
  kabkot: KabkotRow[]; satdik: SatdikRow[];
  paud: PaudRow[]; akar_masalah: AkarRow[];
}

// ─── Color helpers ────────────────────────────────────────────────────────────
const labelBg: Record<string, string> = {
  "Baik": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Sedang": "bg-amber-100 text-amber-700 border border-amber-200",
  "Kurang": "bg-red-100 text-red-700 border border-red-200",
  "Rendah": "bg-red-100 text-red-700 border border-red-200",
  "Tinggi": "bg-blue-100 text-blue-700 border border-blue-200",
  "Di atas": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Mencapai": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Di bawah": "bg-amber-100 text-amber-700 border border-amber-200",
  "Jauh di bawah": "bg-red-100 text-red-700 border border-red-200",
  "Capaian Tidak Tersedia": "bg-slate-100 text-slate-500 border border-slate-200",
};
const labelScore: Record<string, number> = {
  "Baik": 3, "Di atas": 3, "Mencapai": 3, "Tinggi": 3,
  "Sedang": 2, "Di bawah": 2,
  "Kurang": 1, "Rendah": 1, "Jauh di bawah": 1,
};

function Badge({ label }: { label: string }) {
  const cls = labelBg[label] ?? "bg-slate-100 text-slate-500 border border-slate-200";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label || "—"}</span>;
}

function TrendBadge({ val24, val25 }: { val24: string; val25: string }) {
  const s24 = labelScore[val24] ?? 0;
  const s25 = labelScore[val25] ?? 0;
  if (!s24 || !s25) return null;
  if (s25 > s24) return <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><TrendingUp size={10} />Naik</span>;
  if (s25 < s24) return <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><TrendingDown size={10} />Turun</span>;
  return <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200"><Minus size={10} />Sama</span>;
}

function KpiCard({ title, value, sub, icon: Icon, color, accent }: {
  title: string; value: string | number; sub?: string; icon: any; color: string; accent?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4 ${accent ?? "border-slate-100"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Year Switcher (global, top-level) ───────────────────────────────────────
function YearSwitcher({ tahun, setTahun }: { tahun: TahunFilter; setTahun: (t: TahunFilter) => void }) {
  const tabs: { id: TahunFilter; label: string; icon: any; color: string }[] = [
    { id: "2024", label: "Tahun 2024", icon: Calendar, color: "bg-blue-600 text-white shadow-blue-200 shadow-md" },
    { id: "2025", label: "Tahun 2025", icon: Calendar, color: "bg-violet-600 text-white shadow-violet-200 shadow-md" },
    { id: "banding", label: "Perbandingan", icon: GitCompare, color: "bg-rose-500 text-white shadow-rose-200 shadow-md" },
  ];
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTahun(t.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${tahun === t.id ? t.color : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}>
          <t.icon size={13} />{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const MENU = [
  { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
  { id: "kabkot", label: "Capaian Kab/Kota", icon: MapPin },
  { id: "satdik", label: "Capaian Satdik", icon: School },
  { id: "paud", label: "PAUD", icon: Baby },
  { id: "akar", label: "Akar Masalah", icon: AlertTriangle },
  { id: "pemda", label: "Capaian Mutu SPM", icon: CheckCircle },
];

function Sidebar({ active, setActive, open, setOpen, tahun }: {
  active: string; setActive: (s: string) => void; open: boolean; setOpen: (b: boolean) => void; tahun: TahunFilter;
}) {
  const tahunColor = "from-slate-900 to-slate-800";
  const activeColor = "bg-blue-600";
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b ${tahunColor} z-30 flex flex-col shadow-2xl transition-all duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-400">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-tight">JAWA <span className="text-amber-300">BARAT</span></p>
              <p className="text-white/50 text-xs">Kab. Bandung</p>
            </div>
          </div>
        </div>

        {/* Year indicator */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-white/10 border border-white/10">
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Mode Aktif</p>
          <p className="text-white text-xs font-bold flex items-center gap-1.5">
            {tahun === "banding" ? <><GitCompare size={12} className="text-rose-300" />Perbandingan 2024 vs 2025</>
              : <><Calendar size={12} className={tahun === "2025" ? "text-violet-300" : "text-blue-300"} />Tahun {tahun}</>}
          </p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {MENU.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActive(id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active === id ? `${activeColor} text-white shadow-lg` : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-2">
          <a href="/pilih-wilayah" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <ChevronLeft size={16} />Pilih Wilayah
          </a>
        </div>
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-white/30 text-[10px]">Data: 2024 & 2025</p>
        </div>
      </aside>
    </>
  );
}

// ─── SPM Comparison Card ──────────────────────────────────────────────────────
function SpmCompare({ d24, d25 }: { d24: DashData; d25: DashData }) {
  const spm24 = parseFloat((d24.spm_value ?? "0").replace(",", ".")) || 0;
  const spm25 = parseFloat((d25.spm_value ?? "0").replace(",", ".")) || 0;
  const delta = spm25 - spm24;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">📅 SPM Tahun 2024</p>
        <p className="text-4xl font-black">{d24.spm_value}</p>
        <p className="text-blue-200 text-xs mt-2">Indeks SPM Kab. Bandung</p>
      </div>
      <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-1">📅 SPM Tahun 2025</p>
        <p className="text-4xl font-black">{d25.spm_value}</p>
        <p className="text-violet-200 text-xs mt-2">Indeks SPM Kab. Bandung</p>
      </div>
      <div className={`rounded-2xl p-5 text-white shadow-lg ${delta >= 0 ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-red-600 to-red-700"}`}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">📊 Perubahan</p>
        <p className="text-4xl font-black flex items-center gap-2">
          {delta >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
        </p>
        <p className="text-white/70 text-xs mt-2">{delta >= 0 ? "Meningkat" : "Menurun"} dari 2024 ke 2025</p>
      </div>
    </div>
  );
}

// ─── Ringkasan: single year ───────────────────────────────────────────────────
function RingkasanSingle({ data, tahun }: { data: DashData; tahun: string }) {
  const { spm_value, ringkasan } = data;
  const jenjangMap: Record<string, any> = {};
  ringkasan?.forEach((r: any) => {
    const j = r.jenjang; if (!j) return;
    if (!jenjangMap[j]) jenjangMap[j] = { capaian_terbaik: "", capaian_terendah: "", peningkatan: "" };
    if (r.capaian === "Capaian Terbaik") jenjangMap[j].capaian_terbaik = r.indikator;
    if (r.capaian === "Capaian Terendah") jenjangMap[j].capaian_terendah = r.indikator;
    if (r.capaian === "Peningkatan Tertinggi") jenjangMap[j].peningkatan = r.indikator;
  });
  const jenjangList = Object.entries(jenjangMap);
  const gradColor = tahun === "2025" ? "from-violet-600 to-violet-700" : "from-blue-600 to-blue-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ringkasan Capaian Jenjang</h1>
        <p className="text-slate-500 text-sm mt-1">Kab. Bandung — Tahun {tahun}</p>
      </div>
      <div className={`bg-gradient-to-r ${gradColor} rounded-2xl p-6 text-white shadow-lg`}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Indeks SPM {tahun}</p>
        <p className="text-5xl font-black">{spm_value}</p>
        <p className="text-white/70 text-sm mt-2">Berdasarkan agregasi seluruh indikator per jenjang kewenangan</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Jenjang" value={jenjangList.length} sub="Jenjang pendidikan" icon={Target} color={tahun === "2025" ? "bg-violet-500" : "bg-blue-500"} />
        <KpiCard title="Indikator Dipantau" value={ringkasan?.length ?? 0} sub="Indikator aktif" icon={Award} color="bg-emerald-500" />
        <KpiCard title="Tahun Laporan" value={tahun} sub="Rapor Pendidikan" icon={BookOpen} color="bg-amber-500" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Detail per Jenjang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jenjangList.map(([jenjang, info]) => (
            <div key={jenjang} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tahun === "2025" ? "bg-violet-50" : "bg-blue-50"}`}>
                  <School size={16} className={tahun === "2025" ? "text-violet-600" : "text-blue-600"} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{jenjang}</h3>
              </div>
              <div className="space-y-2">
                {info.peningkatan && <div className="flex gap-2"><TrendingUp size={13} className="text-blue-500 mt-0.5 flex-shrink-0" /><div><p className="text-xs font-semibold text-slate-500">Peningkatan Tertinggi</p><p className="text-xs text-slate-700">{info.peningkatan}</p></div></div>}
                {info.capaian_terbaik && <div className="flex gap-2"><Award size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" /><div><p className="text-xs font-semibold text-slate-500">Capaian Terbaik</p><p className="text-xs text-slate-700">{info.capaian_terbaik}</p></div></div>}
                {info.capaian_terendah && <div className="flex gap-2"><AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs font-semibold text-slate-500">Capaian Terendah</p><p className="text-xs text-slate-700">{info.capaian_terendah}</p></div></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Ringkasan: Perbandingan ──────────────────────────────────────────────────
function RingkasanBanding({ d24, d25 }: { d24: DashData; d25: DashData }) {
  const spm24 = parseFloat((d24.spm_value ?? "0").replace(",", ".")) || 0;
  const spm25 = parseFloat((d25.spm_value ?? "0").replace(",", ".")) || 0;

  // Build jenjang map per tahun
  const buildMap = (data: DashData) => {
    const m: Record<string, any> = {};
    data.ringkasan?.forEach((r: any) => {
      const j = r.jenjang; if (!j) return;
      if (!m[j]) m[j] = {};
      if (r.capaian === "Capaian Terbaik") m[j].capaian_terbaik = r.indikator;
      if (r.capaian === "Capaian Terendah") m[j].capaian_terendah = r.indikator;
      if (r.capaian === "Peningkatan Tertinggi") m[j].peningkatan = r.indikator;
    });
    return m;
  };
  const map24 = buildMap(d24);
  const map25 = buildMap(d25);
  const allJenjang = Array.from(new Set([...Object.keys(map24), ...Object.keys(map25)]));

  const spmChartData = [
    { name: "2024", value: spm24, fill: "#3b82f6" },
    { name: "2025", value: spm25, fill: "#7c3aed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perbandingan 2024 vs 2025</h1>
        <p className="text-slate-500 text-sm mt-1">Kab. Bandung — Analisis perubahan antar tahun</p>
      </div>

      <SpmCompare d24={d24} d25={d25} />

      {/* SPM Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Layers size={16} className="text-rose-500" /> Perbandingan Indeks SPM</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={spmChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 700 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => v + "%"} />
            <Tooltip formatter={(v: any) => [v.toFixed(2), "Indeks SPM"]} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} label={{ position: "top", fontSize: 13, fontWeight: "bold" }}>
              {spmChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per Jenjang comparison */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Detail Perbandingan per Jenjang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allJenjang.map(jenjang => {
            const i24 = map24[jenjang] ?? {};
            const i25 = map25[jenjang] ?? {};
            return (
              <div key={jenjang} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <School size={15} className="text-rose-500" />
                  <h3 className="font-bold text-slate-900 text-sm">{jenjang}</h3>
                </div>
                <div className="space-y-3">
                  {["peningkatan", "capaian_terbaik", "capaian_terendah"].map(key => {
                    const label = key === "peningkatan" ? "Peningkatan Tertinggi" : key === "capaian_terbaik" ? "Capaian Terbaik" : "Capaian Terendah";
                    const Icon = key === "peningkatan" ? TrendingUp : key === "capaian_terbaik" ? Award : AlertTriangle;
                    const iconColor = key === "peningkatan" ? "text-blue-500" : key === "capaian_terbaik" ? "text-emerald-500" : "text-red-400";
                    if (!i24[key] && !i25[key]) return null;
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-1 mb-1.5"><Icon size={12} className={iconColor} /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                            <p className="text-[9px] font-bold text-blue-400 mb-0.5">2024</p>
                            <p className="text-xs text-blue-800 leading-tight">{i24[key] || "—"}</p>
                          </div>
                          <div className="bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
                            <p className="text-[9px] font-bold text-violet-400 mb-0.5">2025</p>
                            <p className="text-xs text-violet-800 leading-tight">{i25[key] || "—"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── KabKot Single ────────────────────────────────────────────────────────────
function KabkotSingle({ data, tahun }: { data: KabkotRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterLabel, setFilterLabel] = useState("Semua");
  const [sortCol, setSortCol] = useState("nilai_2024_num");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.jenis_satdik))).filter(Boolean)], [data]);
  const labelOptions = ["Semua", "Baik", "Sedang", "Kurang", "Rendah", "Tinggi", "Di atas", "Mencapai", "Di bawah", "Jauh di bawah"];

  const filtered = useMemo(() => {
    let r = data;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis_satdik === filterJenis);
    if (filterLabel !== "Semua") r = r.filter(d => d.label_2024 === filterLabel);
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => {
      const va = (a as any)[sortCol] ?? -Infinity, vb = (b as any)[sortCol] ?? -Infinity;
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [data, filterJenis, filterLabel, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const withVal = data.filter(d => d.nilai_2024_num != null);
  const vals = withVal.map(d => d.nilai_2024_num as number);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "-";
  const max = vals.length ? Math.max(...vals).toFixed(2) : "-";
  const min = vals.length ? Math.min(...vals).toFixed(2) : "-";
  const top10 = [...withVal].sort((a, b) => (b.nilai_2024_num ?? 0) - (a.nilai_2024_num ?? 0)).slice(0, 10);
  const bottom10 = [...withVal].sort((a, b) => (a.nilai_2024_num ?? 0) - (b.nilai_2024_num ?? 0)).slice(0, 10);
  const accentCol = tahun === "2025" ? "bg-violet-500" : "bg-blue-500";
  const accentBar = tahun === "2025" ? "#7c3aed" : "#3b82f6";

  const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } setPage(1); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Capaian Kab/Kota</h1>
        <p className="text-slate-500 text-sm mt-1">Seluruh indikator capaian per jenjang — Tahun {tahun}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Rata-rata Nilai" value={avg} sub="Semua indikator" icon={Target} color={accentCol} />
        <KpiCard title="Nilai Tertinggi" value={max} sub="Capaian terbaik" icon={TrendingUp} color="bg-emerald-500" />
        <KpiCard title="Nilai Terendah" value={min} sub="Perlu perhatian" icon={TrendingDown} color="bg-red-500" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Top 10</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="no" tick={{ fontSize: 10 }} width={55} />
              <Tooltip formatter={(v: any) => [v, "Nilai"]} />
              <Bar dataKey="nilai_2024_num" radius={[0, 4, 4, 0]}>
                {top10.map((_, i) => <Cell key={i} fill={accentBar} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingDown size={16} className="text-red-500" /> Bottom 10</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bottom10} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="no" tick={{ fontSize: 10 }} width={55} />
              <Tooltip formatter={(v: any) => [v, "Nilai"]} />
              <Bar dataKey="nilai_2024_num" radius={[0, 4, 4, 0]}>
                {bottom10.map((_, i) => <Cell key={i} fill="#ef4444" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Cari indikator atau kode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>
            {jenisOptions.slice(0, 15).map(j => <option key={j}>{j}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterLabel} onChange={e => { setFilterLabel(e.target.value); setPage(1); }}>
            {labelOptions.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">{filtered.length} indikator ditemukan</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[{ key: "no", label: "Kode" }, { key: "jenis_satdik", label: "Jenjang" }, { key: "indikator_short", label: "Indikator" }, { key: "label_2024", label: "Label" }, { key: "nilai_2024_num", label: `Nilai ${tahun}` }, { key: "nilai_2023_num", label: `Nilai ${+tahun - 1}` }, { key: "perubahan", label: "Perubahan" }].map(col => (
                  <th key={col.key} className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800 select-none whitespace-nowrap rounded" onClick={() => toggleSort(col.key)}>
                    <span className="flex items-center gap-1">{col.label}<ArrowUpDown size={11} className={sortCol === col.key ? "text-blue-500" : "text-slate-300"} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => {
                const p = row.perubahan ?? "";
                const isNaik = p.toLowerCase().startsWith("naik");
                const isTurun = p.toLowerCase().startsWith("turun");
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 font-bold">{row.no}</td>
                    <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">{row.jenis_satdik}</td>
                    <td className="py-3 px-3 text-xs text-slate-700 max-w-xs truncate font-medium">{row.indikator_short}</td>
                    <td className="py-3 px-3"><Badge label={row.label_2024 ?? ""} /></td>
                    <td className="py-3 px-3 font-bold text-slate-900">{row.nilai_2024_num != null ? row.nilai_2024_num.toFixed(2) : "-"}</td>
                    <td className="py-3 px-3 text-slate-600">{row.nilai_2023_num != null ? row.nilai_2023_num.toFixed(2) : "-"}</td>
                    <td className="py-3 px-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${isNaik ? "text-emerald-600" : isTurun ? "text-red-500" : "text-slate-400"}`}>
                        {isNaik ? <TrendingUp size={12} /> : isTurun ? <TrendingDown size={12} /> : <Minus size={12} />}{p || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"><ChevronLeft size={15} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i; return pg <= totalPages ? (<button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold transition ${pg === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>{pg}</button>) : null; })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KabKot Perbandingan ──────────────────────────────────────────────────────
function KabkotBanding({ d24, d25 }: { d24: KabkotRow[]; d25: KabkotRow[] }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Build lookup by no
  const map25 = useMemo(() => {
    const m: Record<string, KabkotRow> = {};
    d25.forEach(r => { m[r.no] = r; });
    return m;
  }, [d25]);

  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(d24.map(d => d.jenis_satdik))).filter(Boolean)], [d24]);

  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.no] ?? null }));
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis_satdik === filterJenis);
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterJenis, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Chart: compare avg by jenjang
  const jenjangSet = Array.from(new Set(d24.map(d => d.jenis_satdik))).filter(Boolean).slice(0, 8);
  const jenjangChart = jenjangSet.map(j => {
    const rows24 = d24.filter(d => d.jenis_satdik === j && d.nilai_2024_num != null);
    const rows25 = d25.filter(d => d.jenis_satdik === j && d.nilai_2024_num != null);
    const avg24 = rows24.length ? +(rows24.reduce((a, b) => a + (b.nilai_2024_num ?? 0), 0) / rows24.length).toFixed(2) : 0;
    const avg25 = rows25.length ? +(rows25.reduce((a, b) => a + (b.nilai_2024_num ?? 0), 0) / rows25.length).toFixed(2) : 0;
    return { name: j.split("/")[0].trim(), avg24, avg25 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perbandingan Capaian Kab/Kota</h1>
        <p className="text-slate-500 text-sm mt-1">2024 vs 2025 — Perubahan nilai per indikator</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><GitCompare size={16} className="text-rose-500" /> Rata-rata per Jenjang</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={jenjangChart} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg24" name="2024" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg25" name="2025" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Cari indikator..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>
            {jenisOptions.slice(0, 15).map(j => <option key={j}>{j}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">{merged.length} indikator</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Kode</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Indikator</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase tracking-wide whitespace-nowrap">Label 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase tracking-wide whitespace-nowrap">Nilai 2024</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase tracking-wide whitespace-nowrap">Label 2025</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase tracking-wide whitespace-nowrap">Nilai 2025</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-rose-500 uppercase tracking-wide">Tren</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => {
                const r25 = row.r25;
                const v24 = row.nilai_2024_num;
                const v25 = r25?.nilai_2024_num ?? null;
                const delta = v24 != null && v25 != null ? v25 - v24 : null;
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-700 max-w-[200px] truncate font-medium">{row.indikator_short}</td>
                    <td className="py-2.5 px-3"><Badge label={row.label_2024 ?? ""} /></td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">{v24 != null ? v24.toFixed(2) : "-"}</td>
                    <td className="py-2.5 px-3">{r25 ? <Badge label={r25.label_2024 ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td>
                    <td className="py-2.5 px-3 font-bold text-violet-700">{v25 != null ? v25.toFixed(2) : "-"}</td>
                    <td className="py-2.5 px-3">
                      {delta != null ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${delta > 0 ? "bg-emerald-50 text-emerald-700" : delta < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                          {delta > 0 ? <TrendingUp size={10} /> : delta < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                          {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                        </span>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Satdik Single ────────────────────────────────────────────────────────────
function SatdikSingle({ data, tahun }: { data: SatdikRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.jenis))).filter(Boolean).sort()], [data]);
  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kecamatan))).filter(Boolean).sort()], [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis === filterJenis);
    if (filterKecamatan !== "Semua") r = r.filter(d => d.kecamatan === filterKecamatan);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()) || d.npsn?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [data, filterJenis, filterKecamatan, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8"];
  const distLit = ["Baik", "Sedang", "Kurang", "Capaian Tidak Tersedia"].map(l => ({ name: l, value: data.filter(d => d.label_literasi === l).length })).filter(d => d.value > 0);
  const distNum = ["Baik", "Sedang", "Kurang", "Capaian Tidak Tersedia"].map(l => ({ name: l, value: data.filter(d => d.label_numerasi === l).length })).filter(d => d.value > 0);
  const belowStd = data.filter(d => d.label_literasi === "Kurang" || d.label_numerasi === "Kurang").length;
  const accentColor = tahun === "2025" ? "bg-violet-500" : "bg-blue-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Capaian Satuan Pendidikan</h1>
          <p className="text-slate-500 text-sm mt-1">Dasmen &amp; Vokasi — Kab. Bandung {tahun}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterKecamatan !== "Semua" && <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">📍{filterKecamatan}<button onClick={() => setFilterKecamatan("Semua")} className="ml-1 hover:text-blue-900 font-bold">✕</button></span>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Satdik" value={data.length} sub="Dalam database" icon={School} color={accentColor} />
        <KpiCard title="Di Bawah Standar" value={belowStd} sub="Literasi/Numerasi Kurang" icon={AlertTriangle} color="bg-red-500" />
        <KpiCard title="Jenis Satdik" value={jenisOptions.length - 1} sub="Kategori berbeda" icon={Filter} color="bg-amber-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[{ dist: distLit, title: "Distribusi Literasi" }, { dist: distNum, title: "Distribusi Numerasi" }].map(({ dist, title }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">{title}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={dist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {dist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari nama, kecamatan, NPSN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>
            {jenisOptions.map(j => <option key={j}>{j}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterKecamatan} onChange={e => { setFilterKecamatan(e.target.value); setPage(1); }}>
            {kecOptions.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">{filtered.length} satdik ditemukan</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["NPSN", "Nama Sekolah", "Jenis", "Kecamatan", "Literasi", "Numerasi", "Karakter"].map(h => (
                <th key={h} className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>{paged.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-slate-500">{row.npsn}</td>
                <td className="py-3 px-3 text-xs font-semibold text-slate-800 max-w-[170px] truncate">{row.nama}</td>
                <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">{row.jenis}</td>
                <td className="py-3 px-3 text-xs text-slate-600">{row.kecamatan}</td>
                <td className="py-3 px-3"><Badge label={row.label_literasi ?? ""} /></td>
                <td className="py-3 px-3"><Badge label={row.label_numerasi ?? ""} /></td>
                <td className="py-3 px-3"><Badge label={row.label_karakter ?? ""} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Satdik Perbandingan ──────────────────────────────────────────────────────
function SatdikBanding({ d24, d25 }: { d24: SatdikRow[]; d25: SatdikRow[] }) {
  const [filterKec, setFilterKec] = useState("Semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set([...d24, ...d25].map(d => d.kecamatan))).filter(Boolean).sort()], [d24, d25]);

  // Match by NPSN
  const map25 = useMemo(() => { const m: Record<string, SatdikRow> = {}; d25.forEach(r => { m[r.npsn] = r; }); return m; }, [d25]);

  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.npsn] ?? null }));
    if (filterKec !== "Semua") r = r.filter(d => d.kecamatan === filterKec);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterKec, search]);

  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats
  const improved = merged.filter(r => (labelScore[r.r25?.label_literasi ?? ""]) > (labelScore[r.label_literasi ?? ""])).length;
  const declined = merged.filter(r => (labelScore[r.r25?.label_literasi ?? ""]) < (labelScore[r.label_literasi ?? ""])).length;
  const same = merged.filter(r => r.r25 && (labelScore[r.r25.label_literasi ?? ""]) === (labelScore[r.label_literasi ?? ""])).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perbandingan Satdik 2024 vs 2025</h1>
        <p className="text-slate-500 text-sm mt-1">Perubahan capaian per satuan pendidikan</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
          <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-3xl font-black text-emerald-700">{improved}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Meningkat</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
          <Minus size={24} className="text-slate-400 mx-auto mb-2" />
          <p className="text-3xl font-black text-slate-600">{same}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Tetap</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <XCircle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-3xl font-black text-red-600">{declined}</p>
          <p className="text-xs font-semibold text-red-500 mt-1">Menurun</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Cari nama sekolah atau kecamatan..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterKec} onChange={e => { setFilterKec(e.target.value); setPage(1); }}>
            {kecOptions.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">{merged.length} satdik (matched by NPSN)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">NPSN</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Nama</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Kecamatan</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase tracking-wide whitespace-nowrap">Literasi 2024</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase tracking-wide whitespace-nowrap">Literasi 2025</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase tracking-wide whitespace-nowrap">Numerasi 2024</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase tracking-wide whitespace-nowrap">Numerasi 2025</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-rose-500 uppercase tracking-wide">Tren</th>
            </tr></thead>
            <tbody>{paged.map((row, i) => (
              <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!row.r25 ? "opacity-50" : ""}`}>
                <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{row.npsn}</td>
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-800 max-w-[160px] truncate">{row.nama}</td>
                <td className="py-2.5 px-3 text-xs text-slate-500">{row.kecamatan}</td>
                <td className="py-2.5 px-3"><Badge label={row.label_literasi ?? ""} /></td>
                <td className="py-2.5 px-3">{row.r25 ? <Badge label={row.r25.label_literasi ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td>
                <td className="py-2.5 px-3"><Badge label={row.label_numerasi ?? ""} /></td>
                <td className="py-2.5 px-3">{row.r25 ? <Badge label={row.r25.label_numerasi ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td>
                <td className="py-2.5 px-3">{row.r25 ? <TrendBadge val24={row.label_literasi} val25={row.r25.label_literasi} /> : null}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAUD Single ──────────────────────────────────────────────────────────────
function PaudSingle({ data, tahun }: { data: PaudRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.jenis))).filter(Boolean).sort()], [data]);
  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kecamatan))).filter(Boolean).sort()], [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis === filterJenis);
    if (filterKecamatan !== "Semua") r = r.filter(d => d.kecamatan === filterKecamatan);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()) || d.npsn?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [data, filterJenis, filterKecamatan, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inds = [{ key: "label_perencanaan", name: "Perencanaan" }, { key: "label_proses", name: "Proses" }, { key: "label_kemampuan_fondasi", name: "Fondasi" }, { key: "label_sarana", name: "Sarana" }];
  const chartData = inds.map(ind => ({ name: ind.name, baik: data.filter(d => (d as any)[ind.key] === "Baik").length, sedang: data.filter(d => (d as any)[ind.key] === "Sedang").length, kurang: data.filter(d => (d as any)[ind.key] === "Kurang").length }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Capaian Satdik PAUD</h1>
          <p className="text-slate-500 text-sm mt-1">Pendidikan Anak Usia Dini — Kab. Bandung {tahun}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterKecamatan !== "Semua" && <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">📍{filterKecamatan}<button onClick={() => setFilterKecamatan("Semua")} className="ml-1 hover:text-blue-900 font-bold">✕</button></span>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total PAUD" value={data.length} sub="Satuan terdaftar" icon={Baby} color={tahun === "2025" ? "bg-violet-500" : "bg-pink-500"} />
        <KpiCard title="Jenis PAUD" value={jenisOptions.length - 1} sub="Jenis lembaga" icon={School} color="bg-amber-500" />
        <KpiCard title="Capaian Baik" value={data.filter(d => d.label_perencanaan === "Baik").length} sub="Perencanaan baik" icon={Award} color="bg-emerald-500" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm">Distribusi Capaian per Indikator PAUD</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip /><Legend />
            <Bar dataKey="baik" name="Baik" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sedang" name="Sedang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="kurang" name="Kurang" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari nama, kecamatan, NPSN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>
            {jenisOptions.map(j => <option key={j}>{j}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterKecamatan} onChange={e => { setFilterKecamatan(e.target.value); setPage(1); }}>
            {kecOptions.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">{filtered.length} PAUD ditemukan</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["NPSN", "Nama", "Jenis", "Kecamatan", "Perencanaan", "Proses", "Fondasi", "Sarana"].map(h => (
                <th key={h} className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>{paged.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-3 font-mono text-xs text-slate-400">{row.npsn}</td>
                <td className="py-3 px-3 text-xs font-semibold text-slate-800 max-w-[150px] truncate">{row.nama}</td>
                <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">{row.jenis}</td>
                <td className="py-3 px-3 text-xs text-slate-600">{row.kecamatan}</td>
                <td className="py-3 px-3"><Badge label={row.label_perencanaan ?? ""} /></td>
                <td className="py-3 px-3"><Badge label={row.label_proses ?? ""} /></td>
                <td className="py-3 px-3"><Badge label={row.label_kemampuan_fondasi ?? ""} /></td>
                <td className="py-3 px-3"><Badge label={row.label_sarana ?? ""} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {filtered.length} data</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAUD Perbandingan ────────────────────────────────────────────────────────
function PaudBanding({ d24, d25 }: { d24: PaudRow[]; d25: PaudRow[] }) {
  const [filterKec, setFilterKec] = useState("Semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const kecOptions = useMemo(() => ["Semua", ...Array.from(new Set([...d24, ...d25].map(d => d.kecamatan))).filter(Boolean).sort()], [d24, d25]);
  const map25 = useMemo(() => { const m: Record<string, PaudRow> = {}; d25.forEach(r => { m[r.npsn] = r; }); return m; }, [d25]);
  const merged = useMemo(() => {
    let r = d24.map(row => ({ ...row, r25: map25[row.npsn] ?? null }));
    if (filterKec !== "Semua") r = r.filter(d => d.kecamatan === filterKec);
    if (search) r = r.filter(d => d.nama?.toLowerCase().includes(search.toLowerCase()) || d.kecamatan?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [d24, map25, filterKec, search]);
  const totalPages = Math.ceil(merged.length / PAGE_SIZE);
  const paged = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const improved = merged.filter(r => (labelScore[r.r25?.label_perencanaan ?? ""]) > (labelScore[r.label_perencanaan ?? ""])).length;
  const declined = merged.filter(r => (labelScore[r.r25?.label_perencanaan ?? ""]) < (labelScore[r.label_perencanaan ?? ""])).length;
  const same = merged.filter(r => r.r25 && (labelScore[r.r25.label_perencanaan ?? ""]) === (labelScore[r.label_perencanaan ?? ""])).length;

  // Comparison chart per indicator
  const inds = ["label_perencanaan", "label_proses", "label_kemampuan_fondasi", "label_sarana"];
  const indNames = ["Perencanaan", "Proses", "Fondasi", "Sarana"];
  const cmpChart = inds.map((key, idx) => ({
    name: indNames[idx],
    baik24: d24.filter(d => (d as any)[key] === "Baik").length,
    baik25: d25.filter(d => (d as any)[key] === "Baik").length,
  }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Perbandingan PAUD 2024 vs 2025</h1><p className="text-slate-500 text-sm mt-1">Perubahan capaian per satuan PAUD</p></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center"><CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" /><p className="text-3xl font-black text-emerald-700">{improved}</p><p className="text-xs font-semibold text-emerald-600 mt-1">Meningkat</p></div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center"><Minus size={24} className="text-slate-400 mx-auto mb-2" /><p className="text-3xl font-black text-slate-600">{same}</p><p className="text-xs font-semibold text-slate-500 mt-1">Tetap</p></div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center"><XCircle size={24} className="text-red-400 mx-auto mb-2" /><p className="text-3xl font-black text-red-600">{declined}</p><p className="text-xs font-semibold text-red-500 mt-1">Menurun</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm flex items-center gap-2"><GitCompare size={15} className="text-rose-500" /> Jumlah Capaian Baik per Indikator</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cmpChart} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} />
            <Tooltip /><Legend />
            <Bar dataKey="baik24" name="Baik 2024" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="baik25" name="Baik 2025" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Cari nama atau kecamatan..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterKec} onChange={e => { setFilterKec(e.target.value); setPage(1); }}>
            {kecOptions.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">{merged.length} PAUD</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase">NPSN</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase">Nama</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase">Kecamatan</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase whitespace-nowrap">Perencanaan 2024</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase whitespace-nowrap">Perencanaan 2025</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-blue-500 uppercase whitespace-nowrap">Sarana 2024</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-violet-500 uppercase whitespace-nowrap">Sarana 2025</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-rose-500 uppercase">Tren</th>
            </tr></thead>
            <tbody>{paged.map((row, i) => (
              <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!row.r25 ? "opacity-50" : ""}`}>
                <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{row.npsn}</td>
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-800 max-w-[150px] truncate">{row.nama}</td>
                <td className="py-2.5 px-3 text-xs text-slate-500">{row.kecamatan}</td>
                <td className="py-2.5 px-3"><Badge label={row.label_perencanaan ?? ""} /></td>
                <td className="py-2.5 px-3">{row.r25 ? <Badge label={row.r25.label_perencanaan ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td>
                <td className="py-2.5 px-3"><Badge label={row.label_sarana ?? ""} /></td>
                <td className="py-2.5 px-3">{row.r25 ? <Badge label={row.r25.label_sarana ?? ""} /> : <span className="text-xs text-slate-300">—</span>}</td>
                <td className="py-2.5 px-3">{row.r25 ? <TrendBadge val24={row.label_perencanaan} val25={row.r25.label_perencanaan} /> : null}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages}</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Akar Masalah ─────────────────────────────────────────────────────────────
function AkarPage({ data, tahun }: { data: AkarRow[]; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");

  const kelompokOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kelompok))).filter(Boolean)], [data]);
  const kategoriOptions = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.kategori))).filter(Boolean)], [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (filterKelompok !== "Semua") r = r.filter(d => d.kelompok === filterKelompok);
    if (filterKategori !== "Semua") r = r.filter(d => d.kategori === filterKategori);
    if (search) r = r.filter(d => d.indikator_akar?.toLowerCase().includes(search.toLowerCase()) || d.indikator_prioritas?.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [data, filterKelompok, filterKategori, search]);

  const kategoriCount = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(d => { m[d.kategori] = (m[d.kategori] ?? 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name.split(" ")[0], value }));
  }, [data]);

  const accentColor = tahun === "2025" ? "bg-violet-500" : "bg-amber-500";

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Akar Masalah & Pembenahan</h1><p className="text-slate-500 text-sm mt-1">Identifikasi, refleksi, dan rencana pembenahan — {tahun}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Akar Masalah" value={data.length} sub="Dalam database" icon={AlertTriangle} color={accentColor} />
        <KpiCard title="Kelompok Indikator" value={kelompokOptions.length - 1} sub="Kategori berbeda" icon={Filter} color="bg-blue-500" />
        <KpiCard title="Ditampilkan" value={filtered.length} sub="Setelah filter" icon={Target} color="bg-emerald-500" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm">Distribusi per Kategori</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={kategoriCount} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
            <Tooltip />
            <Bar dataKey="value" name="Jumlah" radius={[0, 4, 4, 0]}>
              {kategoriCount.map((_, i) => <Cell key={i} fill={["#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"][i % 5]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari akar masalah atau indikator..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterKelompok} onChange={e => setFilterKelompok(e.target.value)}>
          {kelompokOptions.map(k => <option key={k}>{k}</option>)}
        </select>
        <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none" value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
          {kategoriOptions.map(k => <option key={k}>{k}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{item.kategori}</span>
              {item.no_akar && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{item.no_akar}</span>}
            </div>
            {item.indikator_prioritas && <p className="text-xs font-bold text-slate-800 border-l-4 border-blue-400 pl-3">{item.indikator_prioritas}</p>}
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Akar Masalah</p><p className="text-sm text-slate-800 font-semibold">{item.indikator_akar}</p></div>
            {item.mengapa && <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Mengapa</p><p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.mengapa}</p></div>}
            <div><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle size={10} className="mr-1" />{item.kelompok}</span></div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-slate-400"><AlertTriangle size={36} className="mx-auto mb-3 opacity-30" /><p>Tidak ada data yang sesuai filter</p></div>}
    </div>
  );
}

// ─── Pemda Capaian Mutu SPM ───────────────────────────────────────────────────
function capaianStatusFn(nilai: number | null | undefined): string {
  if (nilai == null) return "Data Tidak Tersedia";
  return nilai > 80 ? "Meningkat Sesuai Standar" : "Belum Meningkat Sesuai Standar";
}

function CapaianBadge({ status }: { status?: string }) {
  if (!status || status === "Data Tidak Tersedia") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">
        <Minus size={11} />Data Tidak Tersedia
      </span>
    );
  }
  if (status === "Meningkat Sesuai Standar") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500 text-white shadow-sm">
        <CheckCircle size={11} />Meningkat Sesuai Standar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-400 text-white shadow-sm">
      <XCircle size={11} />Belum Meningkat Sesuai Standar
    </span>
  );
}

function PemdaTable({ data, tahun }: { data: DashData; tahun: string }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<"no" | "nilai">("nilai");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const spmNilai = data.spm_nilai_num ?? null;
  const spmStatus = data.capaian_status ?? capaianStatusFn(spmNilai);
  const rows = useMemo(() => data.kabkot ?? [], [data]);
  const jenisOptions = useMemo(() => ["Semua", ...Array.from(new Set(rows.map(r => r.jenis_satdik))).filter(Boolean).sort()], [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (filterJenis !== "Semua") r = r.filter(d => d.jenis_satdik === filterJenis);
    if (filterStatus === "Meningkat") r = r.filter(d => (d.capaian_status ?? capaianStatusFn(d.nilai_2024_num)) === "Meningkat Sesuai Standar");
    if (filterStatus === "Belum") r = r.filter(d => (d.capaian_status ?? capaianStatusFn(d.nilai_2024_num)) === "Belum Meningkat Sesuai Standar");
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => {
      if (sortCol === "nilai") {
        const va = a.nilai_2024_num ?? -Infinity, vb = b.nilai_2024_num ?? -Infinity;
        return sortDir === "desc" ? vb - va : va - vb;
      }
      return sortDir === "desc" ? b.no.localeCompare(a.no) : a.no.localeCompare(b.no);
    });
  }, [rows, filterJenis, filterStatus, search, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const meningkatCount = rows.filter(r => (r.capaian_status ?? capaianStatusFn(r.nilai_2024_num)) === "Meningkat Sesuai Standar").length;
  const belumCount     = rows.filter(r => (r.capaian_status ?? capaianStatusFn(r.nilai_2024_num)) === "Belum Meningkat Sesuai Standar").length;
  const pctMeningkat   = rows.length ? Math.round((meningkatCount / rows.length) * 100) : 0;

  const toggleSort = (col: "no" | "nilai") => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
    setPage(1);
  };

  const accentGrad = tahun === "2025" ? "from-violet-600 to-violet-700" : "from-blue-600 to-blue-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle size={22} className="text-emerald-500" />
          Data Pemda Meningkat Capaian Mutu Sesuai SPM
        </h1>
        <p className="text-slate-500 text-sm mt-1">Kab. Bandung — Tahun {tahun} · Nilai SPM &gt; 80 = Meningkat Sesuai Standar</p>
      </div>

      <div className={`bg-gradient-to-r ${accentGrad} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Indeks SPM {tahun}</p>
            <p className="text-5xl font-black">{data.spm_value ?? "—"}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <CapaianBadge status={spmStatus} />
            <p className="text-white/60 text-xs">Threshold: Nilai &gt; 80</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Indikator" value={rows.length} sub={`${filtered.length} setelah filter`} icon={Target} color={tahun === "2025" ? "bg-violet-500" : "bg-blue-500"} />
        <KpiCard title="Meningkat Sesuai Standar" value={meningkatCount} sub={`${pctMeningkat}% dari total`} icon={CheckCircle} color="bg-emerald-500" accent="border-emerald-100" />
        <KpiCard title="Belum Meningkat" value={belumCount} sub={`${100 - pctMeningkat}% dari total`} icon={XCircle} color="bg-amber-500" accent="border-amber-100" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Proporsi Capaian Indikator</p>
          <p className="text-sm font-bold text-slate-900">{pctMeningkat}% Meningkat</p>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pctMeningkat}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Meningkat Sesuai Standar ({meningkatCount})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Belum Meningkat ({belumCount})</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari indikator atau kode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Show</span>
            <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none"
              value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-xs text-slate-500">entries</span>
          </div>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none"
            value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }}>
            {jenisOptions.slice(0, 15).map(j => <option key={j}>{j}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white focus:outline-none"
            value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="Semua">Semua Status</option>
            <option value="Meningkat">Meningkat Sesuai Standar</option>
            <option value="Belum">Belum Meningkat</option>
          </select>
        </div>

        <p className="text-xs text-slate-400 mb-3">{filtered.length} indikator ditemukan</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide w-12">#</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => toggleSort("no")}>
                  <span className="flex items-center gap-1">Kode <ArrowUpDown size={11} className={sortCol === "no" ? "text-blue-500" : "text-slate-300"} /></span>
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Tahun</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[240px]">Indikator / Prov. Kab. Kota</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800 whitespace-nowrap" onClick={() => toggleSort("nilai")}>
                  <span className="flex items-center gap-1">SPM <ArrowUpDown size={11} className={sortCol === "nilai" ? "text-blue-500" : "text-slate-300"} /></span>
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Capaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((row, i) => {
                const rowNum = (page - 1) * pageSize + i + 1;
                const st = row.capaian_status ?? capaianStatusFn(row.nilai_2024_num);
                const isMeningkat = st === "Meningkat Sesuai Standar";
                return (
                  <tr key={i} className={`hover:bg-slate-50 transition-colors ${isMeningkat ? "" : "bg-amber-50/30"}`}>
                    <td className="py-3 px-4 text-xs text-slate-400 font-medium">{rowNum}</td>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-slate-500">{row.no}</span></td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">{tahun}</td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-blue-600 truncate max-w-xs">{row.indikator_short || row.jenis_satdik}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{row.jenis_satdik} · {row.status}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-bold ${isMeningkat ? "text-emerald-700" : "text-amber-700"}`}>
                        {row.nilai_2024_num != null ? row.nilai_2024_num.toFixed(2) : "—"}
                      </span>
                      {row.nilai_2024_num != null && (
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${isMeningkat ? "bg-emerald-500" : "bg-amber-400"}`}
                            style={{ width: `${Math.min(100, row.nilai_2024_num)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4"><CapaianBadge status={st} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages} · Menampilkan {paged.length} dari {filtered.length} data</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition text-xs font-bold">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"><ChevronLeft size={15} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return pg <= totalPages ? (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${pg === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>{pg}</button>
              ) : null;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"><ChevronRight size={15} /></button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition text-xs font-bold">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PemdaBanding({ d24, d25 }: { d24: DashData; d25: DashData }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const spm24 = d24.spm_nilai_num ?? null;
  const spm25 = d25.spm_nilai_num ?? null;
  const delta = spm24 != null && spm25 != null ? spm25 - spm24 : null;

  const rows24 = d24.kabkot ?? [];
  const rows25 = d25.kabkot ?? [];

  const map25 = useMemo(() => {
    const m: Record<string, KabkotRow> = {};
    rows25.forEach(r => { m[r.no] = r; });
    return m;
  }, [rows25]);

  const combined = useMemo(() => {
    let r = rows24.map(row => ({ ...row, r25: map25[row.no] ?? null }));
    if (search) r = r.filter(d => d.indikator_short.toLowerCase().includes(search.toLowerCase()) || d.no.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [rows24, map25, search]);

  const totalPages = Math.max(1, Math.ceil(combined.length / PAGE_SIZE));
  const paged = combined.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle size={22} className="text-emerald-500" />
          Perbandingan Capaian Mutu SPM 2024 vs 2025
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">SPM 2024</p>
          <p className="text-4xl font-black mb-3">{d24.spm_value ?? "—"}</p>
          <CapaianBadge status={d24.capaian_status ?? capaianStatusFn(spm24)} />
        </div>
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">SPM 2025</p>
          <p className="text-4xl font-black mb-3">{d25.spm_value ?? "—"}</p>
          <CapaianBadge status={d25.capaian_status ?? capaianStatusFn(spm25)} />
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-lg ${(delta ?? 0) >= 0 ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-red-600 to-red-700"}`}>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Perubahan</p>
          <p className="text-4xl font-black flex items-center gap-2">
            {(delta ?? 0) >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
            {delta != null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}` : "—"}
          </p>
          <p className="text-white/70 text-xs mt-2">{(delta ?? 0) >= 0 ? "Meningkat" : "Menurun"} dari 2024 ke 2025</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <GitCompare size={15} className="text-rose-500" />Perbandingan Status per Indikator
        </h3>
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="Cari indikator atau kode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <p className="text-xs text-slate-400 mb-3">{combined.length} indikator</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">#</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Kode</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Indikator</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-blue-500 uppercase tracking-wide whitespace-nowrap">Nilai 2024</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-blue-500 uppercase tracking-wide whitespace-nowrap">Status 2024</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-violet-500 uppercase tracking-wide whitespace-nowrap">Nilai 2025</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-violet-500 uppercase tracking-wide whitespace-nowrap">Status 2025</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-rose-500 uppercase tracking-wide">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((row, i) => {
                const v24  = row.nilai_2024_num;
                const v25  = row.r25?.nilai_2024_num ?? null;
                const diff = v24 != null && v25 != null ? v25 - v24 : null;
                const st24 = row.capaian_status ?? capaianStatusFn(v24);
                const st25 = row.r25 ? (row.r25.capaian_status ?? capaianStatusFn(v25)) : undefined;
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-xs text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="py-2.5 px-4 font-mono text-xs font-bold text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-4 text-xs text-slate-700 max-w-[200px] truncate font-medium">{row.indikator_short}</td>
                    <td className="py-2.5 px-4 font-bold text-blue-700 text-xs">{v24 != null ? v24.toFixed(2) : "—"}</td>
                    <td className="py-2.5 px-4"><CapaianBadge status={st24} /></td>
                    <td className="py-2.5 px-4 font-bold text-violet-700 text-xs">{v25 != null ? v25.toFixed(2) : "—"}</td>
                    <td className="py-2.5 px-4">{st25 ? <CapaianBadge status={st25} /> : <span className="text-xs text-slate-300">—</span>}</td>
                    <td className="py-2.5 px-4">
                      {diff != null ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${diff > 0 ? "bg-emerald-50 text-emerald-700" : diff < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                          {diff > 0 ? <TrendingUp size={10} /> : diff < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                          {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                        </span>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">Hal. {page}/{totalPages} · {combined.length} data</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading & Error screens ──────────────────────────────────────────────────
function LoadingScreen({ msg }: { msg?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">{msg ?? "Memuat data..."}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function KabBandungDashboard() {
  const [active, setActive] = useState("ringkasan");
  const [tahun, setTahun] = useState<TahunFilter>("2024");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data24, setData24] = useState<DashData | null>(null);
  const [data25, setData25] = useState<DashData | null>(null);
  const [loading24, setLoading24] = useState(true);
  const [loading25, setLoading25] = useState(true);
  const [err24, setErr24] = useState<string | null>(null);
  const [err25, setErr25] = useState<string | null>(null);

  useEffect(() => {
    fetch("/kab_bandung/dashboard_data.json")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(d => { setData24(d); setLoading24(false); })
      .catch((e: Error) => { setErr24(e.message); setLoading24(false); });
    fetch("/kab_bandung/dashboard_data_2025.json")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(d => { setData25(d); setLoading25(false); })
      .catch((e: Error) => { setErr25(e.message); setLoading25(false); });
  }, []);

  const activeLabel = MENU.find(m => m.id === active)?.label ?? "";
  const activeData = tahun === "2025" ? data25 : data24;
  const bothLoaded = !loading24 && !loading25;
  const isLoading = tahun === "banding" ? (loading24 || loading25) : (tahun === "2025" ? loading25 : loading24);

  const spm24 = data24?.spm_value ?? "—";
  const spm25 = data25?.spm_value ?? "—";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} tahun={tahun} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-5 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition" onClick={() => setSidebarOpen(true)}>
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-sm truncate">{activeLabel}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Rapor Pendidikan Kab. Bandung</p>
          </div>

          {/* Year switcher — center */}
          <div className="flex-1 flex justify-center">
            <YearSwitcher tahun={tahun} setTahun={setTahun} />
          </div>

          {/* SPM badges */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {data24 && <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100"><span className="text-blue-400">2024</span> {spm24}</span>}
            {data25 && <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-100"><span className="text-violet-400">2025</span> {spm25}</span>}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? <LoadingScreen msg={`Memuat data ${tahun === "banding" ? "2024 & 2025" : "tahun " + tahun}...`} /> : (
            <>
              {/* ── Ringkasan ── */}
              {active === "ringkasan" && (
                tahun === "banding"
                  ? (data24 && data25 ? <RingkasanBanding d24={data24} d25={data25} /> : <LoadingScreen />)
                  : (activeData ? <RingkasanSingle data={activeData} tahun={tahun} /> : <LoadingScreen />)
              )}
              {/* ── KabKot ── */}
              {active === "kabkot" && (
                tahun === "banding"
                  ? (data24 && data25 ? <KabkotBanding d24={data24.kabkot ?? []} d25={data25.kabkot ?? []} /> : <LoadingScreen />)
                  : (activeData ? <KabkotSingle data={activeData.kabkot ?? []} tahun={tahun} /> : <LoadingScreen />)
              )}
              {/* ── Satdik ── */}
              {active === "satdik" && (
                tahun === "banding"
                  ? (data24 && data25 ? <SatdikBanding d24={data24.satdik ?? []} d25={data25.satdik ?? []} /> : <LoadingScreen />)
                  : (activeData ? <SatdikSingle data={activeData.satdik ?? []} tahun={tahun} /> : <LoadingScreen />)
              )}
              {/* ── PAUD ── */}
              {active === "paud" && (
                tahun === "banding"
                  ? (data24 && data25 ? <PaudBanding d24={data24.paud ?? []} d25={data25.paud ?? []} /> : <LoadingScreen />)
                  : (activeData ? <PaudSingle data={activeData.paud ?? []} tahun={tahun} /> : <LoadingScreen />)
              )}
              {/* ── Akar ── */}
              {active === "akar" && (
                tahun === "banding"
                  ? (data24 && data25 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <AkarPage data={data24.akar_masalah ?? []} tahun="2024" />
                      <AkarPage data={data25.akar_masalah ?? []} tahun="2025" />
                    </div>
                  ) : <LoadingScreen />)
                  : (activeData ? <AkarPage data={activeData.akar_masalah ?? []} tahun={tahun} /> : <LoadingScreen />)
              )}
              {/* ── Pemda ── */}
              {active === "pemda" && (
                tahun === "banding"
                  ? (data24 && data25 ? <PemdaBanding d24={data24} d25={data25} /> : <LoadingScreen />)
                  : (activeData ? <PemdaTable data={activeData} tahun={tahun} /> : <LoadingScreen />)
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function KabBandungPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <KabBandungDashboard />
    </Suspense>
  );
}