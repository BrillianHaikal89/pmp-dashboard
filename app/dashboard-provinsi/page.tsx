// app/dashboard-provinsi/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, ArrowLeft,
  BookOpen, School, GraduationCap, Building2, ChevronDown,
  AlertCircle, CheckCircle2, XCircle, Info, Search,
  MapPin, Layers, Users, BookMarked,
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
const LABEL_STYLE: Record<string, React.CSSProperties> = {
  Tinggi:  { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
  Baik:    { background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" },
  Sedang:  { background: "#fef9c3", color: "#854d0e", border: "1px solid #fef08a" },
  Rendah:  { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
  Kurang:  { background: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" },
  "Capaian Tidak Tersedia": { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" },
};
const LABEL_ORDER = ["Tinggi", "Baik", "Sedang", "Kurang", "Rendah", "Capaian Tidak Tersedia"];
const LABEL_COLORS_BAR: Record<string, string> = {
  Tinggi: "#22c55e", Baik: "#3b82f6", Sedang: "#eab308",
  Kurang: "#f97316", Rendah: "#ef4444", "Capaian Tidak Tersedia": "#cbd5e1",
};

const CAPAIAN_TYPE_STYLE: Record<string, { borderStyle: React.CSSProperties; labelStyle: React.CSSProperties; iconColor: string }> = {
  "Peningkatan Tertinggi": {
    borderStyle: { borderLeftColor: "#22c55e", background: "#f0fdf4" },
    labelStyle:  { color: "#166534" },
    iconColor:   "#22c55e",
  },
  "Capaian Terbaik": {
    borderStyle: { borderLeftColor: "#3b82f6", background: "#eff6ff" },
    labelStyle:  { color: "#1d4ed8" },
    iconColor:   "#3b82f6",
  },
  "Capaian Terendah": {
    borderStyle: { borderLeftColor: "#ef4444", background: "#fff1f2" },
    labelStyle:  { color: "#b91c1c" },
    iconColor:   "#ef4444",
  },
};

const TABS: { id: TabId; short: string; icon: React.ReactNode }[] = [
  { id: "ringkasan",     short: "Ringkasan",       icon: <BookMarked size={13} /> },
  { id: "provinsi",      short: "Indikator",        icon: <BarChart3 size={13} /> },
  { id: "kabkot-dasmen", short: "Kab/Kota Dasmen", icon: <MapPin size={13} /> },
  { id: "kabkot-paud",   short: "Kab/Kota PAUD",   icon: <Layers size={13} /> },
  { id: "satdik-dasmen", short: "Satdik Dasmen",   icon: <School size={13} /> },
  { id: "satdik-paud",   short: "Satdik PAUD",     icon: <GraduationCap size={13} /> },
];

const PAGE_SIZE = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function LabelBadge({ label }: { label: string }) {
  const clean = (label ?? "").trim();
  const sty = LABEL_STYLE[clean] ?? LABEL_STYLE["Capaian Tidak Tersedia"];
  const icon =
    clean === "Tinggi" || clean === "Baik" ? <CheckCircle2 size={10} /> :
    clean === "Sedang" ? <Info size={10} /> :
    clean === "Rendah" || clean === "Kurang" ? <XCircle size={10} /> : null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={sty}
    >
      {icon}
      {clean === "Capaian Tidak Tersedia" ? "N/A" : clean || "N/A"}
    </span>
  );
}

function PerubahanBadge({ val }: { val?: string }) {
  if (!val) return <span className="text-slate-400 text-xs">–</span>;
  const lower = val.toLowerCase();
  if (lower.startsWith("naik"))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <TrendingUp size={11} />{val}
      </span>
    );
  if (lower.startsWith("turun"))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
        <TrendingDown size={11} />{val}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
      <Minus size={11} />{val}
    </span>
  );
}

function SelectFilter({ value, onChange, options, className = "" }: {
  value: string; onChange: (v: string) => void; options: string[]; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        className="appearance-none pl-3 pr-7 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
        value={value} onChange={e => onChange(e.target.value)}
      >
        {options.map((o, idx) => <option key={`${o}-${idx}`}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative flex-1 min-w-48">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
      <div className="flex rounded-full overflow-hidden h-3 gap-px mb-3">
        {labels.map(l => (
          <div
            key={l}
            className="transition-all first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(counts[l] / total) * 100}%`, background: LABEL_COLORS_BAR[l] }}
            title={`${l}: ${counts[l]}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {labels.map(l => (
          <span key={l} className="text-xs text-slate-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: LABEL_COLORS_BAR[l] }} />
            <span className="font-medium text-slate-700">{l === "Capaian Tidak Tersedia" ? "N/A" : l}</span>
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
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
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

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-blue-200">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900 leading-tight">{title}</h2>
        {badge && <p className="text-xs text-slate-500 mt-0.5">{badge}</p>}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function DashboardProvinsiPage() {
  const [tahun, setTahun]       = useState<"2024" | "2025">("2025");
  const [activeTab, setActiveTab] = useState<TabId>("ringkasan");

  // Data states
  const [ringkasan,    setRingkasan]    = useState<RingkasanCapaian[]>([]);
  const [capaianProv,  setCapaianProv]  = useState<CapaianProvinsi[]>([]);
  const [kabkotDasmen, setKabkotDasmen] = useState<CapaianKabkot[]>([]);
  const [kabkotPaud,   setKabkotPaud]   = useState<CapaianKabkot[]>([]);
  const [satdikDasmen, setSatdikDasmen] = useState<CapaianSatdik[]>([]);
  const [satdikPaud,   setSatdikPaud]   = useState<CapaianSatdik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Filter states
  const [sProv, setSProv] = useState(""); const [fProvJ, setFProvJ] = useState("Semua"); const [fProvS, setFProvS] = useState("Semua");
  const [sKD,   setSKD]   = useState(""); const [fKDJ,   setFKDJ]   = useState("Semua"); const [fKDS,   setFKDS]   = useState("Semua");
  const [sKP,   setSKP]   = useState(""); const [fKPS,   setFKPS]   = useState("Semua");
  const [sSD,   setSSD]   = useState(""); const [fSDJ,   setFSDJ]   = useState("Semua"); const [fSDS, setFSDS] = useState("Semua"); const [fSDK, setFSDK] = useState("Semua");
  const [sSP,   setSSP]   = useState(""); const [fSPJ,   setFSPJ]   = useState("Semua"); const [fSPS, setFSPS] = useState("Semua"); const [fSPK, setFSPK] = useState("Semua");
  const [pageSD, setPageSD] = useState(1);
  const [pageSP, setPageSP] = useState(1);

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([
      fetch(`/dataProvinsi/${tahun}/1_ringkasan_capaian_jenjang.json`).then(r => r.json()),
      fetch(`/dataProvinsi/${tahun}/2_capaian_provinsi.json`).then(r => r.json()),
      fetch(`/dataProvinsi/${tahun}/3_capaian_kabkot_dasmen_vokasi.json`).then(r => r.json()),
      fetch(`/dataProvinsi/${tahun}/4_capaian_kabkot_paud.json`).then(r => r.json()),
      fetch(`/dataProvinsi/${tahun}/5_capaian_satdik_dasmen_vokasi.json`).then(r => r.json()),
      fetch(`/dataProvinsi/${tahun}/6_capaian_satdik_paud.json`).then(r => r.json()),
    ])
      .then(([r1, r2, r3, r4, r5, r6]) => {
        setRingkasan(r1); setCapaianProv(r2);
        setKabkotDasmen(r3); setKabkotPaud(r4);
        setSatdikDasmen(r5); setSatdikPaud(r6);
        setLoading(false);
      })
      .catch(() => {
        setError(`Gagal memuat data dari public/dataProvinsi/${tahun}/`);
        setLoading(false);
      });
    setPageSD(1); setPageSP(1);
  }, [tahun]);

  // Options
  const oProvJ  = useMemo(() => ["Semua", ...new Set(capaianProv.map(c => c["Jenis Satuan Pendidikan"]))], [capaianProv]);
  const oProvS  = useMemo(() => ["Semua", ...new Set(capaianProv.map(c => c["Status Satuan Pendidikan"]))], [capaianProv]);
  const oKDJ    = useMemo(() => ["Semua", ...new Set(kabkotDasmen.map(c => c["Jenis Satuan Pendidikan"]))], [kabkotDasmen]);
  const oKDS    = useMemo(() => ["Semua", ...new Set(kabkotDasmen.map(c => c["Status Satuan Pendidikan"]))], [kabkotDasmen]);
  const oKPS    = useMemo(() => ["Semua", ...new Set(kabkotPaud.map(c => c["Status Satuan Pendidikan"]))], [kabkotPaud]);
  const oSDJ    = useMemo(() => ["Semua", ...new Set(satdikDasmen.map(c => c["Jenis Satuan Pendidikan"]))], [satdikDasmen]);
  const oSDS    = useMemo(() => ["Semua", ...new Set(satdikDasmen.map(c => c["Status Satuan Pendidikan"]))], [satdikDasmen]);
  const oSDK    = useMemo(() => ["Semua", ...[...new Set(satdikDasmen.map(c => c["Kabupaten/Kota"]))].sort()], [satdikDasmen]);
  const oSPJ    = useMemo(() => ["Semua", ...new Set(satdikPaud.map(c => c["Jenis Satuan Pendidikan"]))], [satdikPaud]);
  const oSPS    = useMemo(() => ["Semua", ...new Set(satdikPaud.map(c => c["Status Satuan Pendidikan"]))], [satdikPaud]);
  const oSPK    = useMemo(() => ["Semua", ...[...new Set(satdikPaud.map(c => c["Kabupaten/Kota"]))].sort()], [satdikPaud]);

  // Filtered data
  const fProv = useMemo(() => capaianProv.filter(c =>
    (fProvJ === "Semua" || c["Jenis Satuan Pendidikan"] === fProvJ) &&
    (fProvS === "Semua" || c["Status Satuan Pendidikan"] === fProvS) &&
    (!sProv || c.Indikator?.toLowerCase().includes(sProv.toLowerCase()) || c.No?.toLowerCase().includes(sProv.toLowerCase()))
  ), [capaianProv, fProvJ, fProvS, sProv]);

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
  const labelKey = tahun === "2025" ? "Label Capaian 2025" : "Label Capaian 2024";

  // ── Tabel Kab/Kota ──
  function KabkotTable({ rows, indKeys, search, onSearch, jenisList, jenisSel, onJenis, statusList, statusSel, onStatus }: {
    rows: CapaianKabkot[]; indKeys: string[];
    search: string; onSearch: (v: string) => void;
    jenisList?: string[]; jenisSel?: string; onJenis?: (v: string) => void;
    statusList: string[]; statusSel: string; onStatus: (v: string) => void;
  }) {
    const codes = indKeys.map(k => k.replace("_Label Capaian", ""));
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <SearchInput value={search} onChange={onSearch} placeholder="Cari kab/kota…" />
          {jenisList && onJenis && jenisSel !== undefined && (
            <SelectFilter value={jenisSel} onChange={onJenis} options={jenisList} className="w-44" />
          )}
          <SelectFilter value={statusSel} onChange={onStatus} options={statusList} className="w-36" />
          <div className="flex items-center px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
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
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide sticky left-0 bg-slate-50 min-w-36 z-10">Kab/Kota</th>
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide min-w-28">Jenis</th>
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide min-w-20">Status</th>
                  {codes.map(c => (
                    <th key={c} className="px-3 py-3.5 text-center font-bold text-slate-600 uppercase tracking-wide min-w-16">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={codes.length + 3} className="text-center py-16 text-slate-400">
                      <Search size={24} className="mx-auto mb-2 opacity-40" />
                      <p>Tidak ada data ditemukan</p>
                    </td>
                  </tr>
                ) : rows.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-blue-50/40 z-[5] transition-colors">{row["Kab/Kota"]}</td>
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
        </div>
      </div>
    );
  }

  // ── Tabel Satdik ──
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
        <div className="flex flex-wrap gap-2">
          <SearchInput value={search} onChange={onSearch} placeholder="Cari nama satdik atau NPSN…" />
          <SelectFilter value={jenisSel} onChange={onJenis} options={jenisList} className="w-40" />
          <SelectFilter value={statusSel} onChange={onStatus} options={statusList} className="w-32" />
          <SelectFilter value={kabSel} onChange={onKab} options={kabList} className="w-44" />
          <div className="flex items-center px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
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
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide sticky left-0 bg-slate-50 min-w-52 z-10">Nama Satdik</th>
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide min-w-24">NPSN</th>
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide min-w-32">Kab/Kota</th>
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide min-w-28">Jenis</th>
                  <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide min-w-20">Status</th>
                  {codes.map(c => (
                    <th key={c} className="px-3 py-3.5 text-center font-bold text-slate-600 uppercase tracking-wide min-w-16">{c}</th>
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
                    <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-blue-50/40 z-[5] transition-colors leading-snug">{row["Nama Satuan Pendidikan"]}</td>
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Beranda
        </Link>
        <div className="w-px h-5 bg-slate-200" />

        {/* ── 2 Menu utama ── */}
        <nav className="flex gap-1">
          <Link
            href="/pilih-wilayah"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Pilih Wilayah
          </Link>
          <Link
            href="/dashboard-provinsi"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white transition"
          >
            Dashboard Provinsi
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <p className="text-sm font-bold text-slate-900 hidden sm:block">
            JAWA <span className="text-amber-500">BARAT</span>
            <span className="font-normal text-slate-400 ml-2 text-xs">Rapor Pendidikan 2024 &amp; 2025</span>
          </p>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="flex gap-1.5">
            {(["2024","2025"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTahun(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${
                  tahun === t
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div
        className="text-white px-6 py-8"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 60%, #312e81 100%)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#93c5fd" }}>
            Rapor Pendidikan {tahun}
          </p>
          <h1 className="text-3xl font-black mb-1 text-white leading-tight">
            Dashboard Provinsi{" "}
            <span style={{ color: "#fcd34d" }}>Jawa Barat</span>
          </h1>
          <p className="text-sm mb-6" style={{ color: "#bfdbfe" }}>
            Capaian indikator provinsi, kab/kota, dan satuan pendidikan — Dasmen, Vokasi &amp; PAUD
          </p>

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {[
                { icon: <BarChart3 size={15} />, label: "Indikator Provinsi",      val: capaianProv.length },
                { icon: <MapPin size={15} />,    label: "Kab/Kota Dasmen",         val: new Set(kabkotDasmen.map(k => k["Kab/Kota"])).size },
                { icon: <Layers size={15} />,    label: "Kab/Kota PAUD",           val: new Set(kabkotPaud.map(k => k["Kab/Kota"])).size },
                { icon: <Users size={15} />,     label: "Total Satuan Pendidikan",  val: satdikDasmen.length + satdikPaud.length },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                >
                  <div className="mb-2" style={{ color: "#93c5fd" }}>{s.icon}</div>
                  <p className="text-2xl font-black text-white">{s.val.toLocaleString("id")}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "#bfdbfe" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[73px] z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 overflow-x-auto">
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 flex-shrink-0 py-3.5 px-4 text-sm font-semibold border-b-2 transition -mb-px whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <span className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"}>{tab.icon}</span>
                {tab.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-blue-600 animate-pulse" />
            </div>
            <p className="text-sm font-medium">Memuat semua data…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <p className="text-sm font-semibold text-red-700 mb-1">Gagal Memuat Data</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ══ 1. Ringkasan Jenjang ══ */}
            {activeTab === "ringkasan" && (
              <div>
                <SectionHeader
                  icon={<BookMarked size={16} />}
                  title="Ringkasan Capaian Jenjang"
                  badge={`${jenjangList.length} jenjang · Tahun ${tahun}`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jenjangList.map(jenjang => {
                    const items = ringkasan.filter(r => r.Jenjang === jenjang);
                    const isSD  = jenjang.includes("SD");
                    const isSMP = jenjang.includes("SMP");
                    const isSMA = jenjang.includes("SMA") || jenjang.includes("SMK");
                    const iconBg = isSD ? "bg-blue-600" : isSMP ? "bg-violet-600" : isSMA ? "bg-amber-500" : "bg-rose-600";
                    const iconEl = isSD
                      ? <School size={14} className="text-white" />
                      : isSMP
                      ? <BookOpen size={14} className="text-white" />
                      : isSMA
                      ? <GraduationCap size={14} className="text-white" />
                      : <Building2 size={14} className="text-white" />;

                    return (
                      <div key={jenjang} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                            {iconEl}
                          </div>
                          <span className="font-black text-slate-800 text-sm">{jenjang}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {items.map((item, i) => {
                            const sty = CAPAIAN_TYPE_STYLE[item.Capaian];
                            return (
                              <div
                                key={i}
                                className="px-5 py-4 border-l-4"
                                style={sty?.borderStyle ?? { borderLeftColor: "#e2e8f0", background: "#fff" }}
                              >
                                <p
                                  className="text-[10px] font-black uppercase tracking-widest mb-1"
                                  style={sty?.labelStyle ?? { color: "#94a3b8" }}
                                >
                                  {item.Capaian}
                                </p>
                                <p className="text-sm text-slate-700 font-medium leading-snug">
                                  {item["Indikator Prioritas"]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ 2. Capaian Provinsi ══ */}
            {activeTab === "provinsi" && (
              <div>
                <SectionHeader
                  icon={<BarChart3 size={16} />}
                  title="Capaian Indikator Provinsi"
                  badge={`Tahun ${tahun}`}
                />

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      label: "Total Indikator",
                      val: fProv.length,
                      cls: "border-slate-200",
                      valCls: "text-slate-900",
                    },
                    {
                      label: "Tinggi / Baik",
                      val: fProv.filter(c => ["Tinggi","Baik"].includes((c[labelKey as keyof CapaianProvinsi] ?? "") as string)).length,
                      cls: "border-emerald-200 bg-emerald-50",
                      valCls: "text-emerald-700",
                    },
                    {
                      label: "Rendah / Kurang",
                      val: fProv.filter(c => ["Rendah","Kurang"].includes((c[labelKey as keyof CapaianProvinsi] ?? "") as string)).length,
                      cls: "border-red-200 bg-red-50",
                      valCls: "text-red-700",
                    },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-2xl border p-4 bg-white shadow-sm ${s.cls}`}>
                      <p className={`text-3xl font-black ${s.valCls}`}>{s.val}</p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <SearchInput value={sProv} onChange={setSProv} placeholder="Cari kode atau nama indikator…" />
                  <SelectFilter value={fProvJ} onChange={setFProvJ} options={oProvJ} className="w-44" />
                  <SelectFilter value={fProvS} onChange={setFProvS} options={oProvS} className="w-36" />
                  <div className="flex items-center px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">{fProv.length} <span className="font-normal">indikator</span></span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs">
                          <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide w-16">No</th>
                          <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide">Indikator</th>
                          <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide w-32">Jenis</th>
                          <th className="px-4 py-3.5 text-center font-bold text-slate-600 uppercase tracking-wide w-24">Nilai {tahun}</th>
                          <th className="px-4 py-3.5 text-center font-bold text-slate-600 uppercase tracking-wide w-28">Label</th>
                          {tahun === "2025" && (
                            <>
                              <th className="px-4 py-3.5 text-center font-bold text-slate-600 uppercase tracking-wide w-24">Nilai 2024</th>
                              <th className="px-4 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wide w-40">Perubahan</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fProv.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-16 text-slate-400">
                              <Search size={24} className="mx-auto mb-2 opacity-40" />
                              <p>Tidak ada data ditemukan</p>
                            </td>
                          </tr>
                        ) : fProv.map((c, i) => {
                          const lv = c[labelKey as keyof CapaianProvinsi] as string;
                          const nv = tahun === "2025" ? c["Nilai Capaian 2025"] : c["Nilai Capaian 2024"];
                          return (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3.5 font-mono font-bold text-blue-600 text-xs">{c.No}</td>
                              <td className="px-4 py-3.5">
                                <p className="text-slate-800 font-semibold leading-snug">{c.Indikator?.split("\n")[0]}</p>
                                {c.Indikator?.split("\n")[1] && (
                                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{c.Indikator.split("\n")[1]}</p>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-600">{c["Jenis Satuan Pendidikan"]}</td>
                              <td className="px-4 py-3.5 text-center font-black text-slate-900">{nv ?? "–"}</td>
                              <td className="px-4 py-3.5 text-center"><LabelBadge label={lv ?? ""} /></td>
                              {tahun === "2025" && (
                                <>
                                  <td className="px-4 py-3.5 text-center text-slate-500 text-xs">{c["Nilai Capaian 2024"] ?? "–"}</td>
                                  <td className="px-4 py-3.5">
                                    <PerubahanBadge val={c["Perubahan Nilai Capaian dari Tahun Lalu"]} />
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══ 3. Kabkot Dasmen ══ */}
            {activeTab === "kabkot-dasmen" && (
              <div>
                <SectionHeader
                  icon={<MapPin size={16} />}
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

            {/* ══ 4. Kabkot PAUD ══ */}
            {activeTab === "kabkot-paud" && (
              <div>
                <SectionHeader
                  icon={<Layers size={16} />}
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

            {/* ══ 5. Satdik Dasmen ══ */}
            {activeTab === "satdik-dasmen" && (
              <div>
                <SectionHeader
                  icon={<School size={16} />}
                  title="Capaian Satuan Pendidikan — Dasmen & Vokasi"
                  badge={`Tahun ${tahun}`}
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

            {/* ══ 6. Satdik PAUD ══ */}
            {activeTab === "satdik-paud" && (
              <div>
                <SectionHeader
                  icon={<GraduationCap size={16} />}
                  title="Capaian Satuan Pendidikan — PAUD"
                  badge={`Tahun ${tahun}`}
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
      </div>
    </div>
  );
}