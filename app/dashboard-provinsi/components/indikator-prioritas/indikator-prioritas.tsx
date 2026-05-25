"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart3, CheckCircle2, Info, AlertCircle, ListChecks, Filter,
  HelpCircle, TrendingUp, TrendingDown, Minus, ArrowUpDown, Trophy,
  Download, PieChart, BarChart2, ChevronDown, XCircle, MapPin, Search,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart as RPieChart, Pie, LabelList,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChartDownloadData {
  groups: { label: string; items: { name: string; color: string; pct: number }[] }[];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onDownload: () => Promise<void> | void;
  id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const JENJANG_OPTIONS = [
  { value: "Semua", label: "Semua" },
  { value: "SD",    label: "SD"    },
  { value: "SMP",   label: "SMP"   },
  { value: "SMA",   label: "SMA"   },
];

function normalizeJenjang(jenis: string): string {
  const j = (jenis ?? "").toUpperCase();
  if (j.startsWith("TK") || j.startsWith("KB") || j.startsWith("TPA") || j.startsWith("SPS") || j.startsWith("PAUD")) return "PAUD";
  if (j.startsWith("SD") || j.startsWith("MI"))   return "SD";
  if (j.startsWith("SMP") || j.startsWith("MTS")) return "SMP";
  if (j.startsWith("SMA") || j.startsWith("SMK") || j.startsWith("MA")) return "SMA";
  return jenis;
}

// ─── Excel Export Helper ──────────────────────────────────────────────────────
function exportToExcel(
  sheets: { name: string; data: Record<string, unknown>[] }[],
  filename: string
) {
  const wb = XLSX.utils.book_new();
  for (const { name, data } of sheets) {
    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths: { wch: number }[] = [];
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      keys.forEach((key, i) => {
        const maxLen = Math.max(
          key.length,
          ...data.map(row => String(row[key] ?? "").length)
        );
        colWidths[i] = { wch: Math.min(maxLen + 2, 60) };
      });
      ws['!cols'] = colWidths;
    }
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ─── Download Chart as PNG ────────────────────────────────────────────────────
async function downloadChartAsPng(
  containerId: string,
  filename: string,
  chartData?: ChartDownloadData
): Promise<void> {
  try {
    const el = document.getElementById(containerId);
    if (!el) return;

    const allSvgs = Array.from(el.querySelectorAll("svg")) as SVGSVGElement[];
    if (allSvgs.length === 0) return;

    const chartSvg = allSvgs.reduce<SVGSVGElement>((best, cur) => {
      const bRect = best.getBoundingClientRect();
      const cRect = cur.getBoundingClientRect();
      return cRect.width * cRect.height > bRect.width * bRect.height ? cur : best;
    }, allSvgs[0]);

    const cardEl       = el.closest?.(".bg-white") ?? el.parentElement;
    const titleText    = (cardEl?.querySelector("h3")?.textContent ?? filename).trim();
    const subtitleText = (cardEl?.querySelector("p.text-\\[10px\\]")?.textContent ?? "").trim();

    const groupDataList = chartData?.groups ?? [];
    const hasDetail     = groupDataList.length > 0;
    const numGroups     = groupDataList.length;

    // ── Hitung lebar minimal yang dibutuhkan tabel detail ─────────────
    const MIN_COL_W   = 160;
    const TABLE_PAD_H = 20;
    const minTableW   = hasDetail ? numGroups * MIN_COL_W + TABLE_PAD_H * 2 : 0;

    const svgRect   = chartSvg.getBoundingClientRect();
    const CHART_RAW = Math.max(svgRect.width, 640);
    const W         = Math.max(CHART_RAW, minTableW + 24);

    const CHART_H  = svgRect.height || 300;
    const HEADER_H = 64;

    // ── Ukuran tabel ──────────────────────────────────────────────────
    const maxRows    = hasDetail ? Math.max(...groupDataList.map(g => g.items.length)) : 0;
    const COL_W      = hasDetail ? Math.floor((W - 24 - TABLE_PAD_H * 2) / numGroups) : 0;
    const ROW_H      = 24;
    const TABLE_HEAD = 36;
    const FOOTER_PAD = 16;
    const TABLE_H    = hasDetail ? TABLE_HEAD + (maxRows + 1) * ROW_H + FOOTER_PAD : 0;
    const GAP_H      = hasDetail ? 16 : 0;
    const TOTAL_H    = HEADER_H + CHART_H + GAP_H + TABLE_H + 16;

    const scale  = 2;
    const canvas = document.createElement("canvas");
    canvas.width  = W * scale;
    canvas.height = TOTAL_H * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Background putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, TOTAL_H);

    // ── Header ────────────────────────────────────────────────────────
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, HEADER_H);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(W, HEADER_H); ctx.stroke();

    const grad = ctx.createRadialGradient(36, 32, 0, 36, 32, 20);
    grad.addColorStop(0, "#8b5cf6"); grad.addColorStop(1, "#4f46e5");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(36, 32, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(28, 34, 4, 6); ctx.fillRect(33, 28, 4, 12); ctx.fillRect(38, 30, 4, 10);

    ctx.fillStyle    = "#0f172a";
    ctx.font         = "bold 15px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
    ctx.textAlign    = "left";
    ctx.textBaseline = "top";
    ctx.fillText(titleText, 62, 14);

    if (subtitleText) {
      ctx.fillStyle = "#94a3b8";
      ctx.font      = "11px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
      ctx.fillText(subtitleText, 62, 34);
    }

    // ── Render SVG Chart ──────────────────────────────────────────────
    const clone = chartSvg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width",   String(W));
    clone.setAttribute("height",  String(CHART_H));
    clone.setAttribute("viewBox", `0 0 ${svgRect.width} ${svgRect.height}`);
    const bgR = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgR.setAttribute("width", String(W));
    bgR.setAttribute("height", String(CHART_H));
    bgR.setAttribute("fill", "#ffffff");
    clone.insertBefore(bgR, clone.firstChild);

    const svgStr  = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl  = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, HEADER_H, W, CHART_H);
        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = () => { URL.revokeObjectURL(svgUrl); reject(); };
      img.src = svgUrl;
    });

    // ── Tabel Detail Persentase ───────────────────────────────────────
    if (hasDetail) {
      const tableY = HEADER_H + CHART_H + GAP_H;
      const CARD_X = 12;
      const CARD_W = W - 24;

      // Card background
      ctx.fillStyle   = "#f8fafc";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(CARD_X, tableY, CARD_W, TABLE_H, 10);
      else               ctx.rect(CARD_X, tableY, CARD_W, TABLE_H);
      ctx.fill();
      ctx.stroke();

      // Heading tabel
      ctx.fillStyle    = "#1e293b";
      ctx.font         = "bold 12px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("Detail Persentase per Kategori", CARD_X + 12, tableY + TABLE_HEAD / 2);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(CARD_X, tableY + TABLE_HEAD);
      ctx.lineTo(CARD_X + CARD_W, tableY + TABLE_HEAD);
      ctx.stroke();

      const startX     = CARD_X + TABLE_PAD_H;
      const dataStartY = tableY + TABLE_HEAD + 8;

      groupDataList.forEach((group, gIdx) => {
        const colX = startX + gIdx * COL_W;

        // Badge label kolom
        const BADGE_H = 20;
        const BADGE_W = Math.min(COL_W - 16, 80);
        const badgeX  = colX + (COL_W - BADGE_W) / 2;
        ctx.fillStyle = "#dbeafe";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(badgeX, dataStartY, BADGE_W, BADGE_H, 5);
        else               ctx.rect(badgeX, dataStartY, BADGE_W, BADGE_H);
        ctx.fill();

        ctx.fillStyle    = "#1d4ed8";
        ctx.font         = "bold 10px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        let labelTxt = group.label;
        while (ctx.measureText(labelTxt).width > BADGE_W - 8 && labelTxt.length > 1) {
          labelTxt = labelTxt.slice(0, -1);
        }
        if (labelTxt !== group.label) labelTxt += "…";
        ctx.fillText(labelTxt, colX + COL_W / 2, dataStartY + BADGE_H / 2);

        // Rows per item
        const ITEM_START_Y = dataStartY + BADGE_H + 6;
        const DOT_R        = 4.5;
        const DOT_OFFSET_X = 10;
        const TEXT_X       = colX + DOT_OFFSET_X * 2 + DOT_R;
        const MAX_NAME_W   = COL_W - DOT_OFFSET_X * 2 - DOT_R - 52;

        group.items.forEach((item, rIdx) => {
          const rowY    = ITEM_START_Y + rIdx * ROW_H;
          const centerY = rowY + ROW_H / 2;

          // Dot
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(colX + DOT_OFFSET_X, centerY, DOT_R, 0, Math.PI * 2);
          ctx.fill();

          // Nama kategori
          ctx.fillStyle    = "#475569";
          ctx.font         = "10px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
          ctx.textAlign    = "left";
          ctx.textBaseline = "middle";
          let nm = item.name;
          while (ctx.measureText(nm).width > MAX_NAME_W && nm.length > 1) {
            nm = nm.slice(0, -1);
          }
          if (nm !== item.name) nm += "…";
          ctx.fillText(nm, TEXT_X, centerY);

          // Nilai persen
          ctx.fillStyle    = "#0f172a";
          ctx.font         = "bold 11px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
          ctx.textAlign    = "right";
          ctx.fillText(`${item.pct.toFixed(2)}%`, colX + COL_W - 8, centerY);
        });

        // Pemisah antar kolom
        if (gIdx < groupDataList.length - 1) {
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth   = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(colX + COL_W, tableY + TABLE_HEAD + 6);
          ctx.lineTo(colX + COL_W, tableY + TABLE_H - 6);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // ── Download ──────────────────────────────────────────────────────
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href     = canvas.toDataURL("image/png");
    link.click();

  } catch (e) {
    console.error("Download chart failed", e);
  }
}

// ─── Chart wrapper card dengan loading state ──────────────────────────────────
function ChartCard({ title, subtitle, children, onDownload, id }: ChartCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDone, setIsDone]               = useState(false);

  const handleClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setIsDone(false);
    try {
      await onDownload();
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setIsDownloading(false);
      }, 1800);
    } catch {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chart-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%);  }
        }
        @keyframes chart-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes chart-done-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes chart-progress {
          0%   { width: 0%; }
          60%  { width: 75%; }
          100% { width: 100%; }
        }
      `}</style>

      <div id={id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart2 size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* ── Download button ─────────────────────────────────── */}
          {/* ── Download button ─────────────────────────────────── */}
          <button
            onClick={handleClick}
            disabled={isDownloading}
            title="Download grafik sebagai PNG"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border overflow-hidden select-none ${
              !isDownloading && !isDone
                ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                : ""
            }`}
            style={{
              minWidth: 110,
              justifyContent: "center",
              background: isDone ? "#ecfdf5" : isDownloading ? "#eef2ff" : undefined,
              color: isDone ? "#065f46" : isDownloading ? "#4338ca" : undefined,
              borderColor: isDone ? "#a7f3d0" : isDownloading ? "#c7d2fe" : undefined,
              cursor: isDownloading ? "not-allowed" : "pointer",
            }}
          >
            {/* Shimmer sweep — hanya saat loading */}
            {isDownloading && !isDone && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                  animation: "chart-shimmer 1.3s ease-in-out infinite",
                }}
              />
            )}

            {/* Progress bar di bawah tombol */}
            {isDownloading && !isDone && (
              <span
                className="absolute bottom-0 left-0 h-[2px] rounded-full bg-indigo-400"
                style={{ animation: "chart-progress 2s ease-out forwards" }}
              />
            )}

            {/* ── Konten tombol ─────────────────────────────────── */}
            {isDone ? (
              /* State: selesai ✓ */
              <span
                className="flex items-center gap-1.5"
                style={{ animation: "chart-done-pop 0.35s ease-out" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6.5" fill="#22c55e" />
                  <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="relative font-bold">Tersimpan!</span>
              </span>
            ) : isDownloading ? (
              /* State: sedang proses */
              <span className="flex items-center gap-1.5 relative">
                <span
                  className="block w-3 h-3 rounded-full border-2 border-indigo-200 border-t-indigo-600 flex-shrink-0"
                  style={{ animation: "chart-spin 0.75s linear infinite" }}
                />
                <span>Menyiapkan…</span>
              </span>
            ) : (
              /* State: normal */
              <>
                <Download size={12} />
                Unduh PNG
              </>
            )}
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </>
  );
}

// ─── Tooltip kustom ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs min-w-[160px]">
      <p className="font-black text-slate-800 mb-2 border-b border-slate-100 pb-1.5">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-slate-500">{p.name}</span>
          </span>
          <span className="font-bold text-slate-800">{typeof p.value === "number" ? p.value.toFixed(2) : p.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────
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

// ─── Label Badge warna capaian ────────────────────────────────────────────────
function CapaianBadge({ label }: { label: string }) {
  const l = (label || "").toLowerCase();
  if (l === "baik" || l === "tinggi")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{label}</span>;
  if (l === "sedang")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{label}</span>;
  if (l === "kurang" || l === "rendah")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">{label}</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{label || "–"}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function IndikatorPrioritas(props: Record<string, any>) {
  const {
    tahun, SectionHeader, DashboardCard, LabelBadge,
    totalDashboardStats,
    filterStatus, setFilterStatus, indikatorStats,
    setSchoolModal, setSchoolModalSearch, setSchoolModalPage,
    setSchoolModalKabkot, setSchoolModalKecamatan, PRIORITY_INDICATORS,
    jenjangStats,
    indikatorMenurunMeningkat,
    indikatorTertinggiTerendah,
    ttTahunSumber,
    rekapCapaian, satdikDasmen, satdikPaud,
  } = props;

  // ─── Local state ──────────────────────────────────────────────────────
  const [filterJenjangRekap, setFilterJenjangRekap] = useState<string>("Semua");
  const [filterIndikatorTT,  setFilterIndikatorTT]  = useState<string>("Semua");
  const [filterJenjangTT,    setFilterJenjangTT]    = useState<string>("Semua");
  const [filterStatusTT,     setFilterStatusTT]     = useState<string>("Semua");
  const [filterJenjangMMT,   setFilterJenjangMMT]   = useState<string>("Semua");
  const [filterStatusMMT,    setFilterStatusMMT]    = useState<string>("Semua");
  const [pageMMT,            setPageMMT]            = useState<number>(1);

  // ─── Internal School Modal ────────────────────────────────────────────
  const [schoolModal, setInternalSchoolModal] = useState<{
    indCode: string;
    indName: string;
    labelGroup: string;
    filterJenjang: string;
  } | null>(null);
  const [schoolModalSearch,     setSchoolModalSearchLocal]     = useState("");
  const [schoolModalKabkot,     setSchoolModalKabkotLocal]     = useState("Semua");
  const [schoolModalKecamatan,  setSchoolModalKecamatanLocal]  = useState("Semua");
  const [schoolModalPage,       setSchoolModalPageLocal]       = useState(1);
  const SCHOOL_MODAL_PAGE_SIZE = 50;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detailModal, setDetailModal] = useState<{ rows: Record<string, string>[]; title: string; label: string } | null>(null);

  // ─── Rekap TT Modal state ─────────────────────────────────────────────
  const [rekapTTModal, setRekapTTModal] = useState<{
    code: string;
    kategori: "Meningkat" | "Menurun" | "Tetap" | "Tidak Tersedia";
  } | null>(null);
  const [rekapTTSearch,    setRekapTTSearch]    = useState("");
  const [rekapTTKabkot,    setRekapTTKabkot]    = useState("Semua");
  const [rekapTTKecamatan, setRekapTTKecamatan] = useState("Semua");
  const [rekapTTPage,      setRekapTTPage]      = useState(1);
  const REKAP_TT_PAGE_SIZE = 50;

  const PRIORITY_CODES_TT = ["A.1", "A.2", "A.3", "D.1", "D.3", "D.4", "D.8", "D.10"];
  const MMT_PAGE_SIZE     = 10;

  // ─── Source rows ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sourceRows: any[] = useMemo(() => {
    if (rekapCapaian?.length > 0) return rekapCapaian;
    return [...(satdikDasmen || []), ...(satdikPaud || [])];
  }, [rekapCapaian, satdikDasmen, satdikPaud]);

  const useRekap = rekapCapaian?.length > 0;

  // ─── Normalized jenjang stats ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedJenjangStats = useMemo<Record<string, any>>(() => {
    const result: Record<string, { baikTinggi: number; sedang: number; kurangRendah: number; tidakTersedia: number; total: number }> = {
      PAUD: { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      SD:   { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      SMP:  { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      SMA:  { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
    };
    if (!jenjangStats) return result;
    for (const [rawJenis, s] of Object.entries(jenjangStats)) {
      const norm  = normalizeJenjang(rawJenis);
      if (!result[norm]) result[norm] = { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stats = s as any;
      result[norm].baikTinggi    += stats.baikTinggi    || 0;
      result[norm].sedang        += stats.sedang        || 0;
      result[norm].kurangRendah  += stats.kurangRendah  || 0;
      result[norm].tidakTersedia += stats.tidakTersedia || 0;
      result[norm].total         += stats.total         || 0;
    }
    return result;
  }, [jenjangStats]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedIndikatorStats = useMemo<Record<string, Record<string, any>>>(() => {
    const PRIORITY_CODES = Object.keys(indikatorStats || {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, Record<string, any>> = {};
    for (const code of PRIORITY_CODES) {
      result[code] = {
        Semua: { ...(indikatorStats[code] || {}) },
        PAUD:  { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SD:    { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SMP:   { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
        SMA:   { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 },
      };
    }
    for (const row of sourceRows) {
      const rawJenis = row["Jenis Satuan Pendidikan"] || "";
      const norm     = normalizeJenjang(rawJenis);
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) continue;
      for (const code of PRIORITY_CODES) {
        if (!result[code]) continue;
        let labelVal = "";
        if (useRekap) {
          labelVal = ((row[code] as string) ?? "").trim();
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const labelKey = Object.keys(row).find((k: any) => {
            const ku = k.toUpperCase(), cu = code.toUpperCase();
            return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
          });
          labelVal = labelKey ? (row[labelKey] ?? "").trim() : "";
        }
        if (labelVal === "Tinggi" || labelVal === "Baik") result[code][norm].baikTinggi++;
        else if (labelVal === "Sedang")                   result[code][norm].sedang++;
        else if (labelVal === "Kurang" || labelVal === "Rendah") result[code][norm].kurangRendah++;
        else                                              result[code][norm].tidakTersedia++;
        result[code][norm].total++;
      }
    }
    return result;
  }, [indikatorStats, sourceRows, useRekap]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStats = (code: string): any => {
    const byCode = normalizedIndikatorStats[code];
    if (!byCode) return indikatorStats[code] || null;
    if (filterJenjangRekap === "Semua") return byCode.Semua || indikatorStats[code];
    return byCode[filterJenjangRekap] || { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardStats = useMemo<any>(() => {
    if (filterJenjangRekap === "Semua") return totalDashboardStats;
    return normalizedJenjangStats[filterJenjangRekap] || { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
  }, [filterJenjangRekap, totalDashboardStats, normalizedJenjangStats]);

  const pct = (n: number) => (cardStats?.total || 0) > 0 ? ((n / cardStats.total) * 100).toFixed(2) : "0.00";

  function getLabelForCode(row: Record<string, unknown>, code: string): string {
    if (useRekap) {
      return ((row[code] as string) ?? "").trim();
    }
    const labelKey = Object.keys(row).find(k => {
      const ku = k.toUpperCase(), cu = code.toUpperCase();
      return ku.startsWith(cu + "_") && ku.includes("LABEL CAPAIAN");
    });
    return labelKey ? ((row[labelKey] as string) ?? "").trim() : "";
  }

  function labelToGroup(label: string): "Baik / Tinggi" | "Sedang" | "Kurang / Rendah" | "Tidak Tersedia" {
    const l = label.toLowerCase();
    if (l === "baik" || l === "tinggi")  return "Baik / Tinggi";
    if (l === "sedang")                  return "Sedang";
    if (l === "kurang" || l === "rendah") return "Kurang / Rendah";
    return "Tidak Tersedia";
  }

  // ─── School Modal rows ────────────────────────────────────────────────
  const schoolModalAllRows = useMemo(() => {
    if (!schoolModal) return [];
    return sourceRows.filter(row => {
      const norm   = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
      const status = (row["Status Satuan Pendidikan"] || "").trim();
      if (!["Negeri", "Swasta"].includes(status)) return false;
      if (schoolModal.filterJenjang !== "Semua" && norm !== schoolModal.filterJenjang) return false;
      const label = getLabelForCode(row, schoolModal.indCode);
      return labelToGroup(label) === schoolModal.labelGroup;
    });
  }, [schoolModal, sourceRows, useRekap]);

  const schoolModalKabkotOptions = useMemo(() => {
    const opts = [...new Set(schoolModalAllRows.map((r: Record<string, unknown>) => r["Kabupaten/Kota"] as string).filter(Boolean))].sort();
    return ["Semua", ...opts];
  }, [schoolModalAllRows]);

  const schoolModalKecamatanOptions = useMemo(() => {
    const base = schoolModalKabkot !== "Semua"
      ? schoolModalAllRows.filter((r: Record<string, unknown>) => r["Kabupaten/Kota"] === schoolModalKabkot)
      : schoolModalAllRows;
    const opts = [...new Set(base.map((r: Record<string, unknown>) => r["Kecamatan"] as string).filter(Boolean))].sort();
    return ["Semua", ...opts];
  }, [schoolModalAllRows, schoolModalKabkot]);

  const schoolModalFiltered = useMemo(() => {
    let rows = schoolModalAllRows;
    if (schoolModalKabkot    !== "Semua") rows = rows.filter((r: Record<string, unknown>) => r["Kabupaten/Kota"] === schoolModalKabkot);
    if (schoolModalKecamatan !== "Semua") rows = rows.filter((r: Record<string, unknown>) => r["Kecamatan"]      === schoolModalKecamatan);
    if (!schoolModalSearch) return rows;
    const q = schoolModalSearch.toLowerCase();
    return rows.filter((r: Record<string, unknown>) =>
      String(r["Nama Satuan Pendidikan"] ?? "").toLowerCase().includes(q) ||
      String(r["NPSN"] ?? "").includes(q) ||
      String(r["Kabupaten/Kota"] ?? "").toLowerCase().includes(q)
    );
  }, [schoolModalAllRows, schoolModalSearch, schoolModalKabkot, schoolModalKecamatan]);

  const schoolModalTotalPages = Math.ceil(schoolModalFiltered.length / SCHOOL_MODAL_PAGE_SIZE);
  const schoolModalPaged = schoolModalFiltered.slice(
    (schoolModalPage - 1) * SCHOOL_MODAL_PAGE_SIZE,
    schoolModalPage * SCHOOL_MODAL_PAGE_SIZE
  );

  function getNilaiForCode(row: Record<string, unknown>, code: string): { nilaiIni: string; nilaiLalu: string; definisi: string } {
    if (useRekap) {
      const nilaiKey = Object.keys(row).find(k => {
        const ku = k.toUpperCase(), cu = code.toUpperCase();
        return ku.startsWith(cu) && ku.includes("NILAI") && !ku.includes("LALU");
      });
      const nilaiLaluKey = Object.keys(row).find(k => {
        const ku = k.toUpperCase(), cu = code.toUpperCase();
        return ku.startsWith(cu) && (ku.includes("NILAI LALU") || ku.includes("TAHUN LALU"));
      });
      const definisiKey = Object.keys(row).find(k => {
        const ku = k.toUpperCase(), cu = code.toUpperCase();
        return ku.startsWith(cu) && ku.includes("DEFINISI");
      });
      return {
        nilaiIni: nilaiKey ? String(row[nilaiKey] ?? "–") : "–",
        nilaiLalu: nilaiLaluKey ? String(row[nilaiLaluKey] ?? "–") : "–",
        definisi: definisiKey ? String(row[definisiKey] ?? "") : "",
      };
    }
    const nilaiKey = Object.keys(row).find(k => {
      const ku = k.toUpperCase(), cu = code.toUpperCase();
      return ku.startsWith(cu + "_") && ku.includes("NILAI CAPAIAN") && !ku.includes("LALU") && !ku.includes("2023") && !ku.includes("2022");
    });
    const nilaiLaluKey = Object.keys(row).find(k => {
      const ku = k.toUpperCase(), cu = code.toUpperCase();
      return ku.startsWith(cu + "_") && ku.includes("NILAI CAPAIAN") && (ku.includes("LALU") || ku.includes("2023") || ku.includes("2022"));
    });
    const definisiKey = Object.keys(row).find(k => {
      const ku = k.toUpperCase(), cu = code.toUpperCase();
      return ku.startsWith(cu + "_") && ku.includes("DEFINISI");
    });
    return {
      nilaiIni: nilaiKey ? String(row[nilaiKey] ?? "–") : "–",
      nilaiLalu: nilaiLaluKey ? String(row[nilaiLaluKey] ?? "–") : "–",
      definisi: definisiKey ? String(row[definisiKey] ?? "") : "",
    };
  }

  const handleExportSchoolModal = useCallback(() => {
    if (!schoolModal) return;
    const exportRows = schoolModalFiltered.map((row: Record<string, unknown>) => {
      const label = getLabelForCode(row, schoolModal.indCode);
      return {
        "Nama Satuan Pendidikan":  String(row["Nama Satuan Pendidikan"] ?? ""),
        "NPSN":                    String(row["NPSN"] ?? ""),
        "Jenis Satuan Pendidikan": String(row["Jenis Satuan Pendidikan"] ?? ""),
        "Jenjang (Normalisasi)":   normalizeJenjang(String(row["Jenis Satuan Pendidikan"] ?? "")),
        "Status Satuan Pendidikan":String(row["Status Satuan Pendidikan"] ?? ""),
        "Kabupaten/Kota":          String(row["Kabupaten/Kota"] ?? ""),
        "Kecamatan":               String(row["Kecamatan"] ?? ""),
        "Kode Indikator":          schoolModal.indCode,
        "Nama Indikator":          schoolModal.indName,
        "Kategori Capaian":        schoolModal.labelGroup,
        "Label Capaian":           label,
      };
    });
    const safeKabkot = schoolModalKabkot !== "Semua" ? `-${schoolModalKabkot.replace(/[^a-zA-Z0-9]/g, "").substring(0, 15)}` : "";
    const safeKec    = schoolModalKecamatan !== "Semua" ? `-${schoolModalKecamatan.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10)}` : "";
    exportToExcel(
      [{ name: `${schoolModal.indCode} - ${schoolModal.labelGroup.replace("/", "-")}`, data: exportRows }],
      `sekolah-${schoolModal.indCode}-${schoolModal.labelGroup.replace(/[\s/]/g, "-")}-${tahun}${safeKabkot}${safeKec}`
    );
  }, [schoolModal, schoolModalFiltered, schoolModalKabkot, schoolModalKecamatan, tahun]);

  function closeSchoolModal() {
    setInternalSchoolModal(null);
    setSchoolModalSearchLocal("");
    setSchoolModalPageLocal(1);
    setSchoolModalKabkotLocal("Semua");
    setSchoolModalKecamatanLocal("Semua");
    if (setSchoolModal) setSchoolModal(null);
  }

  function openSchoolModal(params: { indCode: string; indName: string; labelGroup: string; filterJenjang: string }) {
    setInternalSchoolModal(params);
    setSchoolModalSearchLocal("");
    setSchoolModalPageLocal(1);
    setSchoolModalKabkotLocal("Semua");
    setSchoolModalKecamatanLocal("Semua");
    if (setSchoolModal) {
      setSchoolModal(params);
      if (setSchoolModalSearch) setSchoolModalSearch("");
      if (setSchoolModalPage)   setSchoolModalPage(1);
      if (setSchoolModalKabkot)    setSchoolModalKabkot("Semua");
      if (setSchoolModalKecamatan) setSchoolModalKecamatan("Semua");
    }
  }

  function getLabelGroupStyle(group: string) {
    if (group === "Baik / Tinggi")   return { grad: "from-emerald-500 to-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", bg: "#ecfdf5", dot: "#22c55e" };
    if (group === "Sedang")          return { grad: "from-amber-400 to-amber-500",    badge: "bg-amber-50 text-amber-700 border-amber-200",       text: "text-amber-700",   bg: "#fffbeb", dot: "#f59e0b" };
    if (group === "Kurang / Rendah") return { grad: "from-red-500 to-red-600",        badge: "bg-red-50 text-red-700 border-red-200",             text: "text-red-700",     bg: "#fff1f2", dot: "#ef4444" };
    return                                  { grad: "from-slate-400 to-slate-500",    badge: "bg-slate-100 text-slate-500 border-slate-200",      text: "text-slate-500",   bg: "#f8fafc", dot: "#94a3b8" };
  }

  // ─── Chart data: distribusi per indikator ─────────────────────────────
  const indikatorChartData = useMemo(() => {
    if (!PRIORITY_INDICATORS) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (PRIORITY_INDICATORS as any[]).map((p: any) => {
      const s     = getStats(p.code);
      if (!s) return null;
      const total = (s.baikTinggi || 0) + (s.sedang || 0) + (s.kurangRendah || 0) + (s.tidakTersedia || 0);
      return {
        name:          p.code,
        label:         p.fullName,
        baikTinggi:    total > 0 ? +((s.baikTinggi     / total) * 100).toFixed(2) : 0,
        sedang:        total > 0 ? +((s.sedang          / total) * 100).toFixed(2) : 0,
        kurang:        total > 0 ? +((s.kurangRendah    / total) * 100).toFixed(2) : 0,
        tidakTersedia: total > 0 ? +((s.tidakTersedia   / total) * 100).toFixed(2) : 0,
      };
    }).filter(Boolean);
  }, [PRIORITY_INDICATORS, normalizedIndikatorStats, filterJenjangRekap]);

  // ─── Donut data ───────────────────────────────────────────────────────
  const donutData = useMemo(() => {
    const total   = cardStats?.total || 0;
    const calcPct = (n: number) => total > 0 ? +((n / total) * 100).toFixed(2) : 0;
    return [
      { name: "Baik/Tinggi",    value: calcPct(cardStats?.baikTinggi    || 0), fill: "#22c55e" },
      { name: "Sedang",         value: calcPct(cardStats?.sedang         || 0), fill: "#f59e0b" },
      { name: "Kurang/Rendah",  value: calcPct(cardStats?.kurangRendah  || 0), fill: "#ef4444" },
      { name: "Tidak Tersedia", value: calcPct(cardStats?.tidakTersedia || 0), fill: "#cbd5e1" },
    ];
  }, [cardStats]);

  // ─── MMT data ─────────────────────────────────────────────────────────
  const mmtData: Record<string, string>[] = useMemo(
    () => (Array.isArray(indikatorMenurunMeningkat) ? indikatorMenurunMeningkat : []),
    [indikatorMenurunMeningkat]
  );

  const MMT_JENJANG_OPTIONS = ["Semua", "PAUD", "SD", "SMP", "SMA"] as const;
  const MMT_STATUS_OPTIONS  = ["Semua", "Negeri", "Swasta"]          as const;

  function classifyPerubahan(val: string): "Naik" | "Turun" | "Tidak Berubah" | "Tidak Tersedia" {
    const v = (val ?? "").toLowerCase();
    if (v.includes("naik"))          return "Naik";
    if (v.includes("turun"))         return "Turun";
    if (v.includes("tidak berubah")) return "Tidak Berubah";
    return "Tidak Tersedia";
  }

  const perubahanKey = useMemo(() => {
    if (!mmtData.length) return "Perubahan Nilai Capaian dari Tahun 2023";
    const row = mmtData[0];
    return Object.keys(row).find(k => k.toLowerCase().startsWith("perubahan nilai capaian dari tahun"))
      ?? "Perubahan Nilai Capaian dari Tahun 2023";
  }, [mmtData]);

  const { nilaiCapaianKeyTahunIni, nilaiCapaianKeyTahunLalu, labelTahunIni, labelTahunLalu } = useMemo(() => {
    if (!mmtData.length) return { nilaiCapaianKeyTahunIni: "Nilai Capaian 2024", nilaiCapaianKeyTahunLalu: "Nilai Capaian 2023", labelTahunIni: "2024", labelTahunLalu: "2023" };
    const row       = mmtData[0];
    const nilaiKeys = Object.keys(row).filter(k => /nilai capaian 20\d\d$/i.test(k)).sort((a, b) => b.localeCompare(a));
    const keyIni    = nilaiKeys[0] ?? "Nilai Capaian 2024";
    const keyLalu   = nilaiKeys[1] ?? "Nilai Capaian 2023";
    return {
      nilaiCapaianKeyTahunIni:  keyIni,
      nilaiCapaianKeyTahunLalu: keyLalu,
      labelTahunIni:  keyIni.match(/\d{4}/)?.[0]  ?? "2024",
      labelTahunLalu: keyLalu.match(/\d{4}/)?.[0] ?? "2023",
    };
  }, [mmtData]);

  const mmtFiltered = useMemo(() => mmtData.filter(row => {
    const norm   = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
    if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
    const status = (row["Status Satuan Pendidikan"] || "").trim();
    if (!["Negeri", "Swasta"].includes(status)) return false;
    if (filterJenjangMMT !== "Semua" && norm   !== filterJenjangMMT) return false;
    if (filterStatusMMT  !== "Semua" && status !== filterStatusMMT ) return false;
    return true;
  }), [mmtData, filterJenjangMMT, filterStatusMMT]);

  const mmtSummary = useMemo(() => {
    let naik = 0, turun = 0, tetap = 0, tidakTersedia = 0;
    for (const row of mmtFiltered) {
      const cls = classifyPerubahan(row[perubahanKey] || "");
      if (cls === "Naik")               naik++;
      else if (cls === "Turun")         turun++;
      else if (cls === "Tidak Berubah") tetap++;
      else                              tidakTersedia++;
    }
    return { naik, turun, tetap, tidakTersedia, total: naik + turun + tetap + tidakTersedia };
  }, [mmtFiltered, perubahanKey]);

  const mmtChartData = useMemo(() => {
    const groups: Record<string, { naik: number; turun: number; tetap: number; total: number }> = {};
    for (const row of mmtFiltered) {
      const norm = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
      if (!groups[norm]) groups[norm] = { naik: 0, turun: 0, tetap: 0, total: 0 };
      const cls = classifyPerubahan(row[perubahanKey] || "");
      if (cls === "Naik")  groups[norm].naik++;
      if (cls === "Turun") groups[norm].turun++;
      if (cls === "Tidak Berubah") groups[norm].tetap++;
      groups[norm].total++;
    }
    return Object.entries(groups).map(([jenjang, d]) => ({
      name:      jenjang,
      Meningkat: d.total > 0 ? +((d.naik  / d.total) * 100).toFixed(2) : 0,
      Menurun:   d.total > 0 ? +((d.turun / d.total) * 100).toFixed(2) : 0,
      Tetap:     d.total > 0 ? +((d.tetap / d.total) * 100).toFixed(2) : 0,
    }));
  }, [mmtFiltered, perubahanKey]);

  // ─── TT data ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttData: any[] = useMemo(
    () => (Array.isArray(indikatorTertinggiTerendah) ? indikatorTertinggiTerendah : []),
    [indikatorTertinggiTerendah]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttProcessed = useMemo<{ row: any; skor: number; indDetail: Record<string, { arah: string; nilai: number }> }[]>(() => {
    if (!ttData.length) return [];
    const codes = filterIndikatorTT === "Semua" ? PRIORITY_CODES_TT : [filterIndikatorTT];
    return ttData
      .filter(row => {
        const norm   = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
        if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
        const status = (row["Status Satuan Pendidikan"] || "").trim();
        if (!["Negeri", "Swasta"].includes(status)) return false;
        if (filterJenjangTT !== "Semua" && norm   !== filterJenjangTT) return false;
        if (filterStatusTT  !== "Semua" && status !== filterStatusTT ) return false;
        return true;
      })
      .map(row => {
        const indDetail: Record<string, { arah: string; nilai: number }> = {};
        let totalNilai = 0, countValid = 0;
        for (const code of codes) {
          const flatArahKey  = `${code} - Perubahan dari Tahun Lalu`;
          const flatNilaiKey = `${code} - Perubahan Nilai`;
          let arah = "", nilaiStr = "";
          if (flatArahKey in row) {
            arah     = (row[flatArahKey] as string) ?? "";
            nilaiStr = ((row[flatNilaiKey] as string) ?? "").replace(",", ".");
          } else {
            const ind = row[code];
            if (!ind || typeof ind !== "object") continue;
            arah     = (ind["Perubahan dari Tahun Lalu"] as string) ?? "";
            nilaiStr = ((ind["Perubahan Nilai"]          as string) ?? "").replace(",", ".");
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

  const top10Tertinggi = useMemo(() => [...ttProcessed].sort((a, b) => b.skor - a.skor).slice(0, 10), [ttProcessed]);
  const top10Terendah  = useMemo(() => [...ttProcessed].sort((a, b) => a.skor - b.skor).slice(0, 10), [ttProcessed]);

  const ttSummaryPerInd = useMemo(() => {
    const result: Record<string, { meningkat: number; menurun: number; tetap: number; tidakTersedia: number; total: number }> = {};
    for (const code of PRIORITY_CODES_TT) result[code] = { meningkat: 0, menurun: 0, tetap: 0, tidakTersedia: 0, total: 0 };
    for (const rawRow of ttData) {
      const norm   = normalizeJenjang(rawRow["Jenis Satuan Pendidikan"] || "");
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) continue;
      const status = (rawRow["Status Satuan Pendidikan"] || "").trim();
      if (!["Negeri", "Swasta"].includes(status)) continue;
      if (filterJenjangTT !== "Semua" && norm   !== filterJenjangTT) continue;
      if (filterStatusTT  !== "Semua" && status !== filterStatusTT ) continue;
      for (const code of PRIORITY_CODES_TT) {
        const flatArahKey  = `${code} - Perubahan dari Tahun Lalu`;
        const flatNilaiKey = `${code} - Perubahan Nilai`;
        let arah = "";
        if (flatArahKey in rawRow) {
          arah = (rawRow[flatArahKey] as string) ?? "";
        } else {
          const ind = rawRow[code];
          if (!ind || typeof ind !== "object") { result[code].tidakTersedia++; result[code].total++; continue; }
          arah = (ind["Perubahan dari Tahun Lalu"] as string) ?? "";
        }
        const flatNilai  = flatNilaiKey in rawRow ? parseFloat(((rawRow[flatNilaiKey] as string) ?? "").replace(",", ".")) : NaN;
        const nilaiValid = !isNaN(flatNilai) || flatArahKey in rawRow;
        if (arah.toLowerCase().includes("tidak tersedia") || (!nilaiValid && !(flatArahKey in rawRow))) result[code].tidakTersedia++;
        else if (arah.toLowerCase() === "naik")  result[code].meningkat++;
        else if (arah.toLowerCase() === "turun") result[code].menurun++;
        else                                     result[code].tetap++;
        result[code].total++;
      }
    }
    return result;
  }, [ttData, filterJenjangTT, filterStatusTT]);

  const ttRekapChartData = useMemo(() =>
    PRIORITY_CODES_TT.map(code => {
      const s = ttSummaryPerInd[code];
      if (!s || s.total === 0) return null;
      return {
        name:      code,
        Meningkat: +((s.meningkat / s.total) * 100).toFixed(2),
        Menurun:   +((s.menurun   / s.total) * 100).toFixed(2),
        Tetap:     +((s.tetap     / s.total) * 100).toFixed(2),
      };
    }).filter(Boolean)
  , [ttSummaryPerInd]);

  // ─── Rekap TT Modal ───────────────────────────────────────────────────
  const rekapTTRows = useMemo(() => {
    if (!rekapTTModal) return [] as Record<string, string>[];
    const { code, kategori } = rekapTTModal;
    const arahKey = `${code} - Perubahan dari Tahun Lalu`;
    return ttData.filter(row => {
      const norm   = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
      if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
      const status = (row["Status Satuan Pendidikan"] || "").trim();
      if (!["Negeri", "Swasta"].includes(status)) return false;
      if (filterJenjangTT !== "Semua" && norm   !== filterJenjangTT) return false;
      if (filterStatusTT  !== "Semua" && status !== filterStatusTT ) return false;
      let arah = "";
      if (arahKey in row) { arah = ((row[arahKey] as string) ?? "").toLowerCase(); }
      else {
        const ind = row[code];
        if (ind && typeof ind === "object") { arah = ((ind["Perubahan dari Tahun Lalu"] as string) ?? "").toLowerCase(); }
      }
      if (kategori === "Meningkat")      return arah === "naik";
      if (kategori === "Menurun")        return arah === "turun";
      if (kategori === "Tetap")          return arah === "tidak berubah" || arah === "tetap";
      if (kategori === "Tidak Tersedia") return !arah || (arah !== "naik" && arah !== "turun" && arah !== "tidak berubah" && arah !== "tetap");
      return false;
    }) as Record<string, string>[];
  }, [rekapTTModal, ttData, filterJenjangTT, filterStatusTT]);

  const rekapTTKabkotOptions = useMemo(() => {
    const opts = [...new Set(rekapTTRows.map(r => r["Kabupaten/Kota"]).filter(Boolean))].sort();
    return ["Semua", ...opts];
  }, [rekapTTRows]);

  const rekapTTKecamatanOptions = useMemo(() => {
    const base = rekapTTKabkot !== "Semua" ? rekapTTRows.filter(r => r["Kabupaten/Kota"] === rekapTTKabkot) : rekapTTRows;
    const opts = [...new Set(base.map(r => r["Kecamatan"]).filter(Boolean))].sort();
    return ["Semua", ...opts];
  }, [rekapTTRows, rekapTTKabkot]);

  const rekapTTFiltered = useMemo(() => {
    let rows = rekapTTRows;
    if (rekapTTKabkot    !== "Semua") rows = rows.filter(r => r["Kabupaten/Kota"] === rekapTTKabkot);
    if (rekapTTKecamatan !== "Semua") rows = rows.filter(r => r["Kecamatan"]      === rekapTTKecamatan);
    if (!rekapTTSearch) return rows;
    const q = rekapTTSearch.toLowerCase();
    return rows.filter(r =>
      r["Nama Satuan Pendidikan"]?.toLowerCase().includes(q) ||
      String(r["NPSN"] ?? "").includes(q) ||
      r["Kabupaten/Kota"]?.toLowerCase().includes(q)
    );
  }, [rekapTTRows, rekapTTSearch, rekapTTKabkot, rekapTTKecamatan]);

  const rekapTTTotalPages = Math.ceil(rekapTTFiltered.length / REKAP_TT_PAGE_SIZE);
  const rekapTTPaged      = rekapTTFiltered.slice(
    (rekapTTPage - 1) * REKAP_TT_PAGE_SIZE,
    rekapTTPage * REKAP_TT_PAGE_SIZE
  );

  function getArahNilai(row: Record<string, unknown>, code: string): { arah: string; nilai: string } {
    const flatArahKey  = `${code} - Perubahan dari Tahun Lalu`;
    const flatNilaiKey = `${code} - Perubahan Nilai`;
    if (flatArahKey in row) {
      return { arah: ((row[flatArahKey] as string) ?? ""), nilai: ((row[flatNilaiKey] as string) ?? "–") };
    }
    const ind = row[code];
    if (ind && typeof ind === "object") {
      return {
        arah:  ((ind as Record<string, string>)["Perubahan dari Tahun Lalu"] ?? ""),
        nilai: ((ind as Record<string, string>)["Perubahan Nilai"]           ?? "–"),
      };
    }
    return { arah: "", nilai: "–" };
  }

  // ─── Download handler ─────────────────────────────────────────────────
  const handleDownload = useCallback((id: string, name: string, data?: ChartDownloadData): Promise<void> => {
    return downloadChartAsPng(id, name, data);
  }, []);

  // ─── Excel exports ────────────────────────────────────────────────────
  const handleExportCapaianIndikator = useCallback(() => {
    if (!PRIORITY_INDICATORS) return;
    const filterLabel = filterJenjangRekap !== "Semua" ? `Jenjang ${filterJenjangRekap}` : "Semua Jenjang";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summaryData = (PRIORITY_INDICATORS as any[]).map((p: any) => {
      const s = getStats(p.code);
      if (!s) return null;
      const total = (s.baikTinggi || 0) + (s.sedang || 0) + (s.kurangRendah || 0) + (s.tidakTersedia || 0);
      return {
        "Kode Indikator": p.code, "Nama Indikator": p.fullName, "Deskripsi": p.description || "",
        "Filter Jenjang": filterLabel,
        "Jumlah Baik/Tinggi": s.baikTinggi || 0, "Jumlah Sedang": s.sedang || 0,
        "Jumlah Kurang/Rendah": s.kurangRendah || 0, "Jumlah Tidak Tersedia": s.tidakTersedia || 0,
        "Total Sekolah": total,
        "% Baik/Tinggi": total > 0 ? parseFloat(((s.baikTinggi / total) * 100).toFixed(2)) : 0,
        "% Sedang": total > 0 ? parseFloat(((s.sedang / total) * 100).toFixed(2)) : 0,
        "% Kurang/Rendah": total > 0 ? parseFloat(((s.kurangRendah / total) * 100).toFixed(2)) : 0,
        "% Tidak Tersedia": total > 0 ? parseFloat(((s.tidakTersedia / total) * 100).toFixed(2)) : 0,
      };
    }).filter(Boolean) as Record<string, unknown>[];

    const jenjangData = ["PAUD", "SD", "SMP", "SMA"].map(jj => {
      const js = normalizedJenjangStats[jj] || { baikTinggi: 0, sedang: 0, kurangRendah: 0, tidakTersedia: 0, total: 0 };
      const total = js.total || 0;
      return {
        "Jenjang": jj,
        "Jumlah Baik/Tinggi": js.baikTinggi || 0, "Jumlah Sedang": js.sedang || 0,
        "Jumlah Kurang/Rendah": js.kurangRendah || 0, "Jumlah Tidak Tersedia": js.tidakTersedia || 0,
        "Total Sekolah": total,
        "% Baik/Tinggi": total > 0 ? parseFloat(((js.baikTinggi / total) * 100).toFixed(2)) : 0,
        "% Sedang": total > 0 ? parseFloat(((js.sedang / total) * 100).toFixed(2)) : 0,
        "% Kurang/Rendah": total > 0 ? parseFloat(((js.kurangRendah / total) * 100).toFixed(2)) : 0,
        "% Tidak Tersedia": total > 0 ? parseFloat(((js.tidakTersedia / total) * 100).toFixed(2)) : 0,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detailSheets: { name: string; data: Record<string, unknown>[] }[] = (PRIORITY_INDICATORS as any[]).map((p: any) => {
      const rows = sourceRows
        .filter(row => {
          const norm   = normalizeJenjang(row["Jenis Satuan Pendidikan"] || "");
          if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) return false;
          const status = (row["Status Satuan Pendidikan"] || "").trim();
          if (!["Negeri", "Swasta"].includes(status)) return false;
          if (filterJenjangRekap !== "Semua" && norm !== filterJenjangRekap) return false;
          return true;
        })
        .map(row => {
          const label = getLabelForCode(row, p.code);
          const group = labelToGroup(label);
          return {
            "Nama Satuan Pendidikan":   String(row["Nama Satuan Pendidikan"] ?? ""),
            "NPSN":                     String(row["NPSN"] ?? ""),
            "Jenis Satuan Pendidikan":  String(row["Jenis Satuan Pendidikan"] ?? ""),
            "Jenjang (Normalisasi)":    normalizeJenjang(String(row["Jenis Satuan Pendidikan"] ?? "")),
            "Status Satuan Pendidikan": String(row["Status Satuan Pendidikan"] ?? ""),
            "Kabupaten/Kota":           String(row["Kabupaten/Kota"] ?? ""),
            "Kecamatan":                String(row["Kecamatan"] ?? ""),
            "Label Capaian":            label,
            "Kategori Capaian":         group,
          };
        });
      return { name: `${p.code} Detail`, data: rows };
    });

    exportToExcel(
      [{ name: `Capaian Indikator (${filterLabel})`, data: summaryData }, { name: "Ringkasan per Jenjang", data: jenjangData }, ...detailSheets],
      `capaian-indikator-prioritas-${tahun}${filterJenjangRekap !== "Semua" ? `-${filterJenjangRekap}` : ""}`
    );
  }, [PRIORITY_INDICATORS, filterJenjangRekap, normalizedIndikatorStats, normalizedJenjangStats, sourceRows, tahun]);

  const handleExportRekapTT = useCallback(() => {
    const filterLabelJenjang = filterJenjangTT !== "Semua" ? `Jenjang ${filterJenjangTT}` : "Semua Jenjang";
    const filterLabelStatus  = filterStatusTT  !== "Semua" ? filterStatusTT : "Semua Status";
    const summaryData = PRIORITY_CODES_TT.map(code => {
      const s = ttSummaryPerInd[code];
      if (!s) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const indInfo = (PRIORITY_INDICATORS as any[])?.find((p: any) => p.code === code);
      const total = s.total;
      return {
        "Kode Indikator": code, "Nama Indikator": indInfo?.fullName || code,
        "Filter Jenjang": filterLabelJenjang, "Filter Status": filterLabelStatus,
        "Jumlah Meningkat": s.meningkat, "Jumlah Menurun": s.menurun, "Jumlah Tetap": s.tetap, "Jumlah Tidak Tersedia": s.tidakTersedia, "Total": total,
        "% Meningkat": total > 0 ? parseFloat(((s.meningkat / total) * 100).toFixed(2)) : 0,
        "% Menurun": total > 0 ? parseFloat(((s.menurun / total) * 100).toFixed(2)) : 0,
        "% Tetap": total > 0 ? parseFloat(((s.tetap / total) * 100).toFixed(2)) : 0,
        "% Tidak Tersedia": total > 0 ? parseFloat(((s.tidakTersedia / total) * 100).toFixed(2)) : 0,
      };
    }).filter(Boolean) as Record<string, unknown>[];

    const detailSheets: { name: string; data: Record<string, unknown>[] }[] = PRIORITY_CODES_TT.map(code => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const indInfo = (PRIORITY_INDICATORS as any[])?.find((p: any) => p.code === code);
      const rows: Record<string, unknown>[] = [];
      for (const rawRow of ttData) {
        const norm   = normalizeJenjang(rawRow["Jenis Satuan Pendidikan"] || "");
        if (!["PAUD", "SD", "SMP", "SMA"].includes(norm)) continue;
        const status = (rawRow["Status Satuan Pendidikan"] || "").trim();
        if (!["Negeri", "Swasta"].includes(status)) continue;
        if (filterJenjangTT !== "Semua" && norm   !== filterJenjangTT) continue;
        if (filterStatusTT  !== "Semua" && status !== filterStatusTT ) continue;
        const { arah, nilai } = getArahNilai(rawRow as Record<string, unknown>, code);
        let kategori = "Tidak Tersedia";
        if (arah.toLowerCase() === "naik")  kategori = "Meningkat";
        else if (arah.toLowerCase() === "turun") kategori = "Menurun";
        else if (arah.toLowerCase() === "tidak berubah" || arah.toLowerCase() === "tetap") kategori = "Tetap";
        rows.push({
          "Nama Satuan Pendidikan": String(rawRow["Nama Satuan Pendidikan"] ?? ""), "NPSN": String(rawRow["NPSN"] ?? ""),
          "Jenis Satuan Pendidikan": String(rawRow["Jenis Satuan Pendidikan"] ?? ""), "Jenjang (Normalisasi)": norm,
          "Status Satuan Pendidikan": status, "Kabupaten/Kota": String(rawRow["Kabupaten/Kota"] ?? ""),
          "Kecamatan": String(rawRow["Kecamatan"] ?? ""), "Nama Indikator": indInfo?.fullName || code,
          "Arah Perubahan": arah || "Tidak Tersedia", "Kategori": kategori, "Nilai Perubahan": nilai !== "–" ? nilai : "",
        });
      }
      return { name: `${code} Detail`, data: rows };
    });

    exportToExcel(
      [{ name: `Rekap per Indikator`, data: summaryData }, ...detailSheets],
      `rekap-meningkat-menurun-${tahun}${filterJenjangTT !== "Semua" ? `-${filterJenjangTT}` : ""}${filterStatusTT !== "Semua" ? `-${filterStatusTT}` : ""}`
    );
  }, [ttSummaryPerInd, ttData, filterJenjangTT, filterStatusTT, PRIORITY_INDICATORS, PRIORITY_CODES_TT, tahun]);

  const handleExportMMT = useCallback(() => {
    const filterLabelJenjang = filterJenjangMMT !== "Semua" ? `Jenjang ${filterJenjangMMT}` : "Semua Jenjang";
    const filterLabelStatus  = filterStatusMMT  !== "Semua" ? filterStatusMMT : "Semua Status";
    const exportData = mmtFiltered.map(row => ({
      "No / Kode Indikator": row["No"] || "",
      "Jenis Satuan Pendidikan": row["Jenis Satuan Pendidikan"] || "",
      "Status Satuan Pendidikan": row["Status Satuan Pendidikan"] || "",
      [`Nilai Capaian ${labelTahunLalu}`]: row[nilaiCapaianKeyTahunLalu] || "",
      [`Nilai Capaian ${labelTahunIni}`]: row[nilaiCapaianKeyTahunIni] || "",
      "Perubahan": row[perubahanKey] || "",
      "Kategori Perubahan": classifyPerubahan(row[perubahanKey] || ""),
      "Filter Jenjang": filterLabelJenjang, "Filter Status": filterLabelStatus,
    }));
    exportToExcel(
      [{ name: `Perubahan Capaian (${filterLabelJenjang})`, data: exportData }],
      `indikator-menurun-meningkat-${tahun}${filterJenjangMMT !== "Semua" ? `-${filterJenjangMMT}` : ""}${filterStatusMMT !== "Semua" ? `-${filterStatusMMT}` : ""}`
    );
  }, [mmtFiltered, filterJenjangMMT, filterStatusMMT, labelTahunIni, labelTahunLalu, nilaiCapaianKeyTahunIni, nilaiCapaianKeyTahunLalu, perubahanKey, tahun]);

  function closeRekapTTModal() {
    setRekapTTModal(null); setRekapTTSearch(""); setRekapTTPage(1);
    setRekapTTKabkot("Semua"); setRekapTTKecamatan("Semua");
  }

  const kategoriStyle = (kategori: string) => {
    if (kategori === "Meningkat") return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0", dot: "#22c55e" };
    if (kategori === "Menurun")   return { bg: "#fee2e2", text: "#991b1b", border: "#fecaca", dot: "#ef4444" };
    if (kategori === "Tetap")     return { bg: "#fef9c3", text: "#854d0e", border: "#fef08a", dot: "#f59e0b" };
    return                               { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" };
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* ═══ SECTION 1: Rekap Capaian ═══════════════════════════════════════ */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <SectionHeader
            icon={<BarChart3 size={18} />}
            title="Rekap Capaian Indikator Prioritas"
            badge={`8 Indikator Utama Tahun ${tahun}`}
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter size={11} /> Jenjang
            </span>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
              {JENJANG_OPTIONS.map(opt => (
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

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardCard title="BAIK / TINGGI"   value={<span>{pct(cardStats?.baikTinggi    || 0)}%</span>} icon={<CheckCircle2 size={20} className="text-white" />} color="bg-gradient-to-br from-emerald-500 to-emerald-600" trend="none" trendValue="" subtitle="" />
          <DashboardCard title="SEDANG"           value={<span>{pct(cardStats?.sedang         || 0)}%</span>} icon={<Info          size={20} className="text-white" />} color="bg-gradient-to-br from-yellow-500 to-yellow-600"  trend="none" trendValue="" subtitle="" />
          <DashboardCard title="KURANG / RENDAH"  value={<span>{pct(cardStats?.kurangRendah  || 0)}%</span>} icon={<AlertCircle   size={20} className="text-white" />} color="bg-gradient-to-br from-red-500 to-red-600"       trend="none" trendValue="" subtitle="" />
          <DashboardCard title="TIDAK TERSEDIA"   value={<span>{pct(cardStats?.tidakTersedia || 0)}%</span>} icon={<HelpCircle    size={20} className="text-white" />} color="bg-gradient-to-br from-slate-400 to-slate-500"   trend="none" trendValue="" subtitle="" />
        </div>

        {/* Grafik Donut + Stacked Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Donut */}
          <ChartCard
            id="chart-donut-ringkasan"
            title="Distribusi Capaian Keseluruhan"
            subtitle={`Ringkasan semua indikator${filterJenjangRekap !== "Semua" ? ` — Jenjang ${filterJenjangRekap}` : ""}`}
            onDownload={() => handleDownload(
              "chart-donut-ringkasan",
              `donut-capaian-${tahun}`,
              {
                groups: [{
                  label: "Semua",
                  items: (donutData as { name: string; value: number; fill: string }[])
                    .filter(d => d.value > 0)
                    .map(d => ({ name: d.name, color: d.fill, pct: d.value })),
                }],
              }
            )}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                    {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    <LabelList dataKey="value" position="outside" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fontWeight: 700, fill: "#475569" }} />
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 11 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 12 }} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Stacked Bar per Indikator */}
          <div className="lg:col-span-2">
            <ChartCard
              id="chart-stacked-indikator"
              title="Distribusi Capaian per Indikator"
              subtitle={`Persentase Baik/Tinggi · Sedang · Kurang${filterJenjangRekap !== "Semua" ? ` — Jenjang ${filterJenjangRekap}` : ""}`}
              onDownload={() => handleDownload(
                "chart-stacked-indikator",
                `stacked-indikator-${tahun}`,
                {
                  groups: (indikatorChartData as {
                    name: string; baikTinggi: number; sedang: number; kurang: number; tidakTersedia: number;
                  }[]).map(d => ({
                    label: d.name,
                    items: [
                      { name: "Baik/Tinggi",   color: "#22c55e", pct: d.baikTinggi    },
                      { name: "Sedang",         color: "#f59e0b", pct: d.sedang        },
                      { name: "Kurang/Rendah",  color: "#ef4444", pct: d.kurang        },
                      { name: "Tidak Tersedia", color: "#cbd5e1", pct: d.tidakTersedia },
                    ].filter(i => i.pct > 0),
                  })),
                }
              )}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={indikatorChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.min(v, 100)}%`} domain={[0, 100]} ticks={[0, 30, 60, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                    <Bar dataKey="baikTinggi"    name="Baik/Tinggi"   stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="sedang"        name="Sedang"         stackId="a" fill="#f59e0b" />
                    <Bar dataKey="kurang"        name="Kurang/Rendah"  stackId="a" fill="#ef4444" />
                    <Bar dataKey="tidakTersedia" name="Tidak Tersedia" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Tabel Rekap per Indikator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                <ListChecks size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Capaian per Indikator Prioritas</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Klik angka untuk melihat daftar sekolah · Unduh Excel menyertakan detail per sekolah
                  {filterJenjangRekap !== "Semua" && <span className="ml-1.5 font-semibold text-blue-600">— Jenjang {filterJenjangRekap}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCapaianIndikator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold transition-all border border-emerald-200 hover:border-emerald-300 hover:shadow-sm flex-shrink-0"
            >
              <FileSpreadsheet size={13} />
              Unduh Excel + Detail Sekolah
              {filterJenjangRekap !== "Semua" && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[9px] font-bold">{filterJenjangRekap}</span>
              )}
            </button>
          </div>

          <div className="px-5 py-3 border-b border-slate-100 bg-blue-50/60 flex items-center gap-2">
            <Info size={13} className="text-blue-500 flex-shrink-0" />
            <p className="text-[11px] text-blue-700 font-medium">
              Klik pada angka persentase/jumlah sekolah untuk melihat &amp; mengunduh daftar sekolah berdasarkan indikator dan kategori capaian.
            </p>
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
                  const total     = (s.baikTinggi || 0) + (s.sedang || 0) + (s.kurangRendah || 0) + (s.tidakTersedia || 0);
                  const baikPct   = total > 0 ? ((s.baikTinggi    || 0) / total * 100).toFixed(2) : "0.00";
                  const sedangPct = total > 0 ? ((s.sedang        || 0) / total * 100).toFixed(2) : "0.00";
                  const kurangPct = total > 0 ? ((s.kurangRendah  || 0) / total * 100).toFixed(2) : "0.00";
                  const tidakPct  = total > 0 ? ((s.tidakTersedia || 0) / total * 100).toFixed(2) : "0.00";
                  const baikNum   = total > 0 ? (s.baikTinggi    || 0) / total * 100 : 0;
                  const sedangNum = total > 0 ? (s.sedang        || 0) / total * 100 : 0;
                  const kurangNum = total > 0 ? (s.kurangRendah  || 0) / total * 100 : 0;
                  const tidakNum  = total > 0 ? (s.tidakTersedia || 0) / total * 100 : 0;

                  const cellConfigs = [
                    { pct: baikPct,   count: s.baikTinggi   || 0, labelGroup: "Baik / Tinggi"  as const, bg: "emerald", tColor: "text-emerald-700", bColor: "border-emerald-100", hb: "hover:bg-emerald-100", hBorder: "hover:border-emerald-300" },
                    { pct: sedangPct, count: s.sedang        || 0, labelGroup: "Sedang"          as const, bg: "amber",   tColor: "text-amber-600",   bColor: "border-amber-100",   hb: "hover:bg-amber-100",   hBorder: "hover:border-amber-300"   },
                    { pct: kurangPct, count: s.kurangRendah  || 0, labelGroup: "Kurang / Rendah" as const, bg: "red",     tColor: "text-red-600",     bColor: "border-red-100",     hb: "hover:bg-red-100",     hBorder: "hover:border-red-300"     },
                    { pct: tidakPct,  count: s.tidakTersedia || 0, labelGroup: "Tidak Tersedia"  as const, bg: "slate",   tColor: "text-slate-400",   bColor: "border-slate-200",   hb: "hover:bg-slate-100",   hBorder: "hover:border-slate-300"   },
                  ];

                  return (
                    <tr key={p.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{p.code}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{p.fullName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.description}</p>
                      </td>
                      {cellConfigs.map(({ pct: cp, count, labelGroup, bg, tColor, bColor, hb, hBorder }) => (
                        <td key={labelGroup} className="px-5 py-3.5 text-center">
                          {total > 0 ? (
                            <button
                              onClick={() => openSchoolModal({ indCode: p.code, indName: p.fullName, labelGroup, filterJenjang: filterJenjangRekap })}
                              className={`inline-flex flex-col items-center justify-center gap-0.5 group/btn cursor-pointer bg-${bg}-50/50 ${hb} rounded-xl px-2 py-2 min-w-[5rem] transition-all border ${bColor} ${hBorder} hover:shadow-md relative overflow-hidden`}
                            >
                              <div className={`absolute inset-0 bg-${bg}-400/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out`} />
                              <span className={`text-xl font-black ${tColor} relative`}>{cp}%</span>
                              <span className={`text-[10px] ${tColor} font-bold relative`}>{count.toLocaleString("id-ID")} Sekolah</span>
                            </button>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                      <td className="px-5 py-3.5">
                        {total > 0 ? (
                          <div>
                            <div className="flex rounded-full overflow-hidden h-2 gap-px w-full">
                              {baikNum   > 0 && <div className="h-full rounded-l-full" style={{ width: `${baikNum}%`,   background: "#22c55e" }} />}
                              {sedangNum > 0 && <div className="h-full"               style={{ width: `${sedangNum}%`, background: "#f59e0b" }} />}
                              {kurangNum > 0 && <div className="h-full"               style={{ width: `${kurangNum}%`, background: "#ef4444" }} />}
                              {tidakNum  > 0 && <div className="h-full rounded-r-full" style={{ width: `${tidakNum}%`,  background: "#cbd5e1" }} />}
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">{total.toLocaleString("id-ID")} sekolah</p>
                          </div>
                        ) : <span className="text-[10px] text-slate-300">Tidak ada data</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: Indikator Menurun & Meningkat ════════════════════════ */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <SectionHeader
            icon={<ArrowUpDown size={18} />}
            title="Indikator Menurun &amp; Meningkat"
            badge={`Perubahan Capaian Tahun ${tahun}`}
          />
        </div>

        {mmtData.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Meningkat",     val: mmtSummary.naik,          color: "emerald", Icon: TrendingUp   },
              { label: "Menurun",       val: mmtSummary.turun,         color: "red",     Icon: TrendingDown },
              { label: "Tidak Berubah", val: mmtSummary.tetap,         color: "slate",   Icon: Minus        },
              { label: "Tdk Tersedia",  val: mmtSummary.tidakTersedia, color: "blue",    Icon: Info         },
            ].map(({ label, val, color, Icon }) => (
              <div key={label} className={`bg-white rounded-xl border border-${color}-200 shadow-sm px-4 py-3 flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black text-${color}-600 leading-none`}>
                      {mmtSummary.total > 0 ? ((val / mmtSummary.total) * 100).toFixed(2) : "0.00"}%
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{val}</span>
                  </div>
                  <div className={`h-1 rounded-full bg-${color}-100 overflow-hidden mt-1.5`}>
                    <div className={`h-full rounded-full bg-${color}-500`} style={{ width: `${mmtSummary.total > 0 ? (val / mmtSummary.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {mmtData.length > 0 && mmtChartData.length > 0 && (
          <ChartCard
            id="chart-mmt-jenjang"
            title="Perubahan Capaian per Jenis Satuan Pendidikan"
            subtitle="Persentase meningkat, menurun, dan tetap per jenjang"
            onDownload={() => handleDownload(
              "chart-mmt-jenjang",
              `perubahan-jenjang-${tahun}`,
              {
                groups: (mmtChartData as { name: string; Meningkat: number; Menurun: number; Tetap: number }[]).map(d => ({
                  label: d.name,
                  items: [
                    { name: "Meningkat", color: "#22c55e", pct: d.Meningkat },
                    { name: "Menurun",   color: "#ef4444", pct: d.Menurun   },
                    { name: "Tetap",     color: "#f59e0b", pct: d.Tetap     },
                  ].filter(i => i.pct > 0),
                })),
              }
            )}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mmtChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.min(v, 100)}%`} domain={[0, 100]} ticks={[0, 30, 60, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                  <Bar dataKey="Meningkat" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Menurun"   stackId="a" fill="#ef4444" />
                  <Bar dataKey="Tetap"     stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Filter bar MMT */}
        <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Filter size={11} /> Jenis Satuan Pendidikan
            </span>
            <select value={filterJenjangMMT} onChange={e => { setFilterJenjangMMT(e.target.value); setPageMMT(1); }}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer">
              {MMT_JENJANG_OPTIONS.map(opt => <option key={`jenjang-${opt}`} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Status Satuan Pendidikan</span>
            <select value={filterStatusMMT} onChange={e => { setFilterStatusMMT(e.target.value); setPageMMT(1); }}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer">
              {MMT_STATUS_OPTIONS.map(opt => <option key={`status-${opt}`} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-black text-slate-700">{mmtFiltered.length}</span>
              <span className="text-xs text-slate-500">data</span>
            </div>
            {mmtFiltered.length > 0 && (
              <button onClick={handleExportMMT}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold transition-all border border-emerald-200 hover:border-emerald-300 hover:shadow-sm">
                <FileSpreadsheet size={13} /> Unduh Excel
                {(filterJenjangMMT !== "Semua" || filterStatusMMT !== "Semua") && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[9px] font-bold">
                    {[filterJenjangMMT !== "Semua" && filterJenjangMMT, filterStatusMMT !== "Semua" && filterStatusMMT].filter(Boolean).join(" · ")}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Table MMT */}
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
                <h3 className="text-sm font-bold text-slate-900">Perubahan Nilai Capaian Indikator Prioritas</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Nilai capaian dan perubahan per indikator — {mmtFiltered.length.toLocaleString("id-ID")} baris</p>
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
                    <tr><td colSpan={6} className="text-center py-16 text-slate-400 text-xs">Tidak ada data sesuai filter</td></tr>
                  ) : mmtFiltered.slice((pageMMT - 1) * MMT_PAGE_SIZE, pageMMT * MMT_PAGE_SIZE).map((row, idx) => {
                    const noCode  = row["No"] || "";
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const indInfo = (PRIORITY_INDICATORS as any[]).find((p: any) => p.code === noCode);
                    const perubahan        = row[perubahanKey] || "–";
                    const nilaiCapaianLalu = row[nilaiCapaianKeyTahunLalu] || "–";
                    const nilaiCapaianIni  = row[nilaiCapaianKeyTahunIni]  || "–";
                    const cls = classifyPerubahan(perubahan);
                    return (
                      <tr key={`mmt-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 flex-shrink-0 leading-tight">{noCode || "–"}</span>
                            {indInfo && (
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight">{indInfo.fullName}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{indInfo.description}</p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><p className="text-sm font-semibold text-slate-800">{row["Jenis Satuan Pendidikan"] || "–"}</p></td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${row["Status Satuan Pendidikan"] === "Negeri" ? "bg-blue-50 text-blue-700 border-blue-200" : row["Status Satuan Pendidikan"] === "Swasta" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                            {row["Status Satuan Pendidikan"] || "–"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center"><span className="text-sm font-semibold text-slate-600">{nilaiCapaianLalu}</span></td>
                        <td className="px-5 py-3.5 text-center"><span className="text-sm font-bold text-slate-800">{nilaiCapaianIni}</span></td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cls === "Naik" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : cls === "Turun" ? "bg-red-50 text-red-700 border-red-200" : cls === "Tidak Berubah" ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                            {cls === "Naik"  && <TrendingUp   size={11} />}
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
            {mmtFiltered.length > MMT_PAGE_SIZE && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60">
                <span className="text-[11px] text-slate-400">
                  Menampilkan <span className="font-bold text-slate-600">{(pageMMT - 1) * MMT_PAGE_SIZE + 1}–{Math.min(pageMMT * MMT_PAGE_SIZE, mmtFiltered.length)}</span> dari <span className="font-bold text-slate-600">{mmtFiltered.length}</span> data
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: "«", action: () => setPageMMT(1), disabled: pageMMT === 1 },
                    { label: "‹", action: () => setPageMMT(p => Math.max(1, p - 1)), disabled: pageMMT === 1 },
                    { label: "›", action: () => setPageMMT(p => Math.min(Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE), p + 1)), disabled: pageMMT === Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE) },
                    { label: "»", action: () => setPageMMT(Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE)), disabled: pageMMT === Math.ceil(mmtFiltered.length / MMT_PAGE_SIZE) },
                  ].map(({ label, action, disabled }, i) => (
                    <button key={i} onClick={action} disabled={disabled}
                      className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 text-slate-600">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ SECTION 3: 10 Tertinggi & Terendah ═════════════════════════════ */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <SectionHeader
            icon={<Trophy size={18} />}
            title="10 Indikator Peningkatan Tertinggi &amp; Terendah"
            badge={`Satuan Pendidikan dengan Perubahan Capaian Terbesar & Terkecil${ttTahunSumber && ttTahunSumber !== tahun ? ` — Data Tahun ${ttTahunSumber} (data ${tahun} belum tersedia)` : ` — Tahun ${tahun}`}`}
          />
        </div>

        {/* Filter bar TT */}
        <div className="flex flex-wrap gap-4 items-center mb-5 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {[
            { label: "Indikator",    state: filterIndikatorTT, setter: setFilterIndikatorTT, options: [{ v: "Semua", l: "Semua Indikator" }, ...PRIORITY_CODES_TT.map(c => ({ v: c, l: c }))] },
            { label: "Jenis Satdik", state: filterJenjangTT,   setter: setFilterJenjangTT,   options: ["Semua", "PAUD", "SD", "SMP", "SMA"].map(o => ({ v: o, l: o })) },
            { label: "Status",       state: filterStatusTT,    setter: setFilterStatusTT,    options: ["Semua", "Negeri", "Swasta"].map(o => ({ v: o, l: o })) },
          ].map(({ label, state, setter, options }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                {label === "Indikator" && <Filter size={11} />}{label}
              </span>
              <select value={state} onChange={e => setter(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer">
                {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}
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
              {/* 10 Tertinggi */}
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-emerald-100 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)" }}>
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
                        {filterIndikatorTT !== "Semua"
                          ? <th className="px-3 py-2.5 text-center font-bold text-emerald-600 uppercase tracking-wider text-[9px]">{filterIndikatorTT}</th>
                          : PRIORITY_CODES_TT.map(c => <th key={c} className="px-2 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">{c}</th>)
                        }
                        <th className="px-3 py-2.5 text-center font-bold text-emerald-700 uppercase tracking-wider text-[9px]">Rata-rata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {top10Tertinggi.length === 0
                        ? <tr><td colSpan={filterIndikatorTT !== "Semua" ? 6 : 12} className="text-center py-8 text-slate-400 text-xs">Tidak ada data sesuai filter</td></tr>
                        : top10Tertinggi.map(({ row, skor, indDetail }, idx) => (
                          <tr key={`tertinggi-${idx}`} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="px-3 py-2.5">
                              {idx === 0 ? <span className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-black text-yellow-900 shadow-sm">1</span>
                              : idx === 1 ? <span className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-black text-slate-700 shadow-sm">2</span>
                              : idx === 2 ? <span className="w-6 h-6 rounded-full bg-amber-600/70 flex items-center justify-center text-[10px] font-black text-amber-950 shadow-sm">3</span>
                              : <span className="text-[11px] font-bold text-slate-400">{idx + 1}</span>}
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
                              <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">{normalizeJenjang(row["Jenis Satuan Pendidikan"] || "")}</span>
                            </td>
                            {filterIndikatorTT !== "Semua" ? (
                              <td className="px-3 py-2.5 text-center">
                                {indDetail[filterIndikatorTT] ? (
                                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${indDetail[filterIndikatorTT].arah === "Naik" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                    {indDetail[filterIndikatorTT].arah === "Naik" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                                    {indDetail[filterIndikatorTT].nilai.toFixed(2)}
                                  </span>
                                ) : <span className="text-slate-300 text-[10px]">–</span>}
                              </td>
                            ) : PRIORITY_CODES_TT.map(code => (
                              <td key={code} className="px-2 py-2.5 text-center">
                                {indDetail[code] ? (
                                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${indDetail[code].arah === "Naik" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                    {indDetail[code].arah === "Naik" ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                                    {indDetail[code].nilai.toFixed(2)}
                                  </span>
                                ) : <span className="text-slate-200 text-[9px]">–</span>}
                              </td>
                            ))}
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black border ${skor >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
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

              {/* 10 Terendah */}
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%)" }}>
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
                        {filterIndikatorTT !== "Semua"
                          ? <th className="px-3 py-2.5 text-center font-bold text-red-600 uppercase tracking-wider text-[9px]">{filterIndikatorTT}</th>
                          : PRIORITY_CODES_TT.map(c => <th key={c} className="px-2 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[9px]">{c}</th>)
                        }
                        <th className="px-3 py-2.5 text-center font-bold text-red-700 uppercase tracking-wider text-[9px]">Rata-rata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {top10Terendah.length === 0
                        ? <tr><td colSpan={filterIndikatorTT !== "Semua" ? 6 : 12} className="text-center py-8 text-slate-400 text-xs">Tidak ada data sesuai filter</td></tr>
                        : top10Terendah.map(({ row, skor, indDetail }, idx) => (
                          <tr key={`terendah-${idx}`} className="hover:bg-red-50/40 transition-colors">
                            <td className="px-3 py-2.5"><span className="text-[11px] font-bold text-slate-400">{idx + 1}</span></td>
                            <td className="px-3 py-2.5">
                              <p className="font-semibold text-slate-800 leading-snug text-[11px]">{row["Nama Satuan Pendidikan"]}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{row.NPSN}</p>
                            </td>
                            <td className="px-3 py-2.5">
                              <p className="text-[10px] text-slate-500">{row["Kabupaten/Kota"]}</p>
                              <p className="text-[9px] text-slate-400">{row.Kecamatan}</p>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">{normalizeJenjang(row["Jenis Satuan Pendidikan"] || "")}</span>
                            </td>
                            {filterIndikatorTT !== "Semua" ? (
                              <td className="px-3 py-2.5 text-center">
                                {indDetail[filterIndikatorTT] ? (
                                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${indDetail[filterIndikatorTT].arah === "Naik" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                    {indDetail[filterIndikatorTT].arah === "Naik" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                                    {indDetail[filterIndikatorTT].nilai.toFixed(2)}
                                  </span>
                                ) : <span className="text-slate-300 text-[10px]">–</span>}
                              </td>
                            ) : PRIORITY_CODES_TT.map(code => (
                              <td key={code} className="px-2 py-2.5 text-center">
                                {indDetail[code] ? (
                                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${indDetail[code].arah === "Naik" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                    {indDetail[code].arah === "Naik" ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                                    {indDetail[code].nilai.toFixed(2)}
                                  </span>
                                ) : <span className="text-slate-200 text-[9px]">–</span>}
                              </td>
                            ))}
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black border ${skor >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
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

            {/* Rekap Perubahan per Indikator + Grafik */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <SectionHeader
                  icon={<ListChecks size={18} />}
                  title="Rekap Jumlah Sekolah yang Meningkat dan Menurun Indikator Prioritas"
                  badge={`Jumlah satdik meningkat, menurun, dan tetap per indikator${ttTahunSumber && ttTahunSumber !== tahun ? ` — Data Tahun ${ttTahunSumber}` : ` — Tahun ${tahun}`}`}
                />
              </div>

              {ttRekapChartData.length > 0 && (
                <ChartCard
                  id="chart-rekap-tt-indikator"
                  title="Grafik Rekap Meningkat / Menurun per Indikator Prioritas"
                  subtitle="Persentase satdik meningkat, menurun, dan tetap per kode indikator"
                  onDownload={() => handleDownload(
                    "chart-rekap-tt-indikator",
                    `rekap-indikator-tt-${tahun}`,
                    {
                      groups: (ttRekapChartData as { name: string; Meningkat: number; Menurun: number; Tetap: number }[])
                        .filter(Boolean)
                        .map(d => ({
                          label: d.name,
                          items: [
                            { name: "Meningkat", color: "#22c55e", pct: d.Meningkat },
                            { name: "Menurun",   color: "#ef4444", pct: d.Menurun   },
                            { name: "Tetap",     color: "#f59e0b", pct: d.Tetap     },
                          ].filter(i => i.pct > 0),
                        })),
                    }
                  )}
                >
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ttRekapChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.min(v, 100)}%`} domain={[0, 100]} ticks={[0, 30, 60, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                        <Bar dataKey="Meningkat" stackId="a" fill="#22c55e" />
                        <Bar dataKey="Menurun"   stackId="a" fill="#ef4444" />
                        <Bar dataKey="Tetap"     stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              )}

              {/* Tabel Rekap TT */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <ListChecks size={14} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Rekap Meningkat / Menurun per Indikator</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {filterJenjangTT !== "Semua" && <span className="font-semibold text-blue-600">Jenjang {filterJenjangTT}</span>}
                        {filterJenjangTT !== "Semua" && filterStatusTT !== "Semua" && <span className="text-slate-300 mx-1">·</span>}
                        {filterStatusTT  !== "Semua" && <span className="font-semibold text-purple-600">{filterStatusTT}</span>}
                        {filterJenjangTT === "Semua" && filterStatusTT === "Semua" && "Klik sel untuk melihat & mengunduh daftar sekolah"}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleExportRekapTT}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold transition-all border border-emerald-200 hover:border-emerald-300 hover:shadow-sm flex-shrink-0">
                    <FileSpreadsheet size={13} /> Unduh Excel + Detail Sekolah
                    {(filterJenjangTT !== "Semua" || filterStatusTT !== "Semua") && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[9px] font-bold">
                        {[filterJenjangTT !== "Semua" && filterJenjangTT, filterStatusTT !== "Semua" && filterStatusTT].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </button>
                </div>

                <div className="px-5 py-3 border-b border-slate-100 bg-blue-50/60 flex items-center gap-2">
                  <Info size={13} className="text-blue-500 flex-shrink-0" />
                  <p className="text-[11px] text-blue-700 font-medium">
                    Klik pada persentase untuk melihat &amp; mengunduh daftar sekolah berdasarkan indikator dan kategori perubahan.
                  </p>
                </div>

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
                      {PRIORITY_CODES_TT.map(code => {
                        const s = ttSummaryPerInd[code];
                        if (!s) return null;
                        const total        = s.total;
                        const meningkatPct = total > 0 ? ((s.meningkat     / total) * 100).toFixed(2) : "0.00";
                        const menurunPct   = total > 0 ? ((s.menurun       / total) * 100).toFixed(2) : "0.00";
                        const tetapPct     = total > 0 ? ((s.tetap         / total) * 100).toFixed(2) : "0.00";
                        const tidakPct     = total > 0 ? ((s.tidakTersedia / total) * 100).toFixed(2) : "0.00";
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const indInfo = (PRIORITY_INDICATORS as any[])?.find((p: any) => p.code === code);

                        const cells = [
                          { pct: meningkatPct, count: s.meningkat,    bg: "emerald", tColor: "text-emerald-600", bColor: "border-emerald-100", hBg: "hover:bg-emerald-100", hBorder: "hover:border-emerald-300", kategori: "Meningkat"      as const },
                          { pct: menurunPct,   count: s.menurun,       bg: "red",     tColor: "text-red-600",     bColor: "border-red-100",     hBg: "hover:bg-red-100",     hBorder: "hover:border-red-300",     kategori: "Menurun"        as const },
                          { pct: tetapPct,     count: s.tetap,         bg: "amber",   tColor: "text-amber-600",   bColor: "border-amber-100",   hBg: "hover:bg-amber-100",   hBorder: "hover:border-amber-300",   kategori: "Tetap"          as const },
                          { pct: tidakPct,     count: s.tidakTersedia, bg: "slate",   tColor: "text-slate-400",   bColor: "border-slate-200",   hBg: "hover:bg-slate-100",   hBorder: "hover:border-slate-300",   kategori: "Tidak Tersedia" as const },
                        ];

                        return (
                          <tr key={`tt-rekap-${code}`} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{code}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              {indInfo ? (
                                <>
                                  <p className="text-sm font-semibold text-slate-800">{indInfo.fullName}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{indInfo.description}</p>
                                </>
                              ) : <p className="text-sm font-semibold text-slate-800">{code}</p>}
                            </td>
                            {cells.map(({ pct: cp, count, bg, tColor, bColor, hBg, hBorder, kategori }) => (
                              <td key={kategori} className="px-5 py-3.5 text-center">
                                {total > 0 ? (
                                  <button
                                    onClick={() => { setRekapTTModal({ code, kategori }); setRekapTTSearch(""); setRekapTTPage(1); setRekapTTKabkot("Semua"); setRekapTTKecamatan("Semua"); }}
                                    className={`inline-flex flex-col items-center justify-center gap-0.5 bg-${bg}-50/60 ${hBg} rounded-xl px-2 py-2 min-w-[5rem] border ${bColor} ${hBorder} transition-all hover:shadow-md cursor-pointer group/rekap relative overflow-hidden`}
                                  >
                                    <div className={`absolute inset-0 bg-${bg}-400/10 translate-y-full group-hover/rekap:translate-y-0 transition-transform duration-300 ease-out`} />
                                    <span className={`text-xl font-black ${tColor} relative`}>{cp}%</span>
                                    <span className={`text-[10px] ${tColor} font-bold relative`}>{count.toLocaleString("id-ID")} Sekolah</span>
                                  </button>
                                ) : <span className="text-slate-300">—</span>}
                              </td>
                            ))}
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

      {/* ═══ MODAL: Daftar Sekolah per Indikator & Kategori ═════════════════ */}
      {schoolModal && (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const indInfo = (PRIORITY_INDICATORS as any[]).find((p: any) => p.code === schoolModal.indCode);
        const style   = getLabelGroupStyle(schoolModal.labelGroup);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
            onClick={e => { if (e.target === e.currentTarget) closeSchoolModal(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${style.bg} 0%, white 100%)` }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0" style={{ background: style.dot }}>
                    {schoolModal.indCode}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {indInfo ? `${indInfo.code} – ${indInfo.fullName}` : schoolModal.indCode}
                      </h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>{schoolModal.labelGroup}</span>
                      {schoolModal.filterJenjang !== "Semua" && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Jenjang {schoolModal.filterJenjang}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1"><span className="font-bold text-slate-600">{schoolModalFiltered.length.toLocaleString("id-ID")}</span> sekolah ditemukan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {schoolModalFiltered.length > 0 && (
                    <button onClick={handleExportSchoolModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-all border border-emerald-200 hover:border-emerald-300 hover:shadow-sm">
                      <FileSpreadsheet size={13} /> Unduh Excel
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[9px] font-bold">{schoolModalFiltered.length.toLocaleString("id-ID")}</span>
                    </button>
                  )}
                  <button onClick={closeSchoolModal} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition text-lg font-bold flex-shrink-0">×</button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0 space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cari nama sekolah, NPSN, atau kab/kota…"
                    value={schoolModalSearch}
                    onChange={e => { setSchoolModalSearchLocal(e.target.value); setSchoolModalPageLocal(1); }} />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-40 relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                      value={schoolModalKabkot}
                      onChange={e => { setSchoolModalKabkotLocal(e.target.value); setSchoolModalKecamatanLocal("Semua"); setSchoolModalPageLocal(1); }}>
                      {schoolModalKabkotOptions.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kab/Kota" : opt}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="flex-1 min-w-40 relative">
                    <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50"
                      value={schoolModalKecamatan}
                      onChange={e => { setSchoolModalKecamatanLocal(e.target.value); setSchoolModalPageLocal(1); }}
                      disabled={schoolModalKecamatanOptions.length <= 1}>
                      {schoolModalKecamatanOptions.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kecamatan" : opt}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {(schoolModalKabkot !== "Semua" || schoolModalKecamatan !== "Semua" || schoolModalSearch) && (
                    <button onClick={() => { setSchoolModalKabkotLocal("Semua"); setSchoolModalKecamatanLocal("Semua"); setSchoolModalSearchLocal(""); setSchoolModalPageLocal(1); }}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap">
                      <XCircle size={12} /> Reset Filter
                    </button>
                  )}
                </div>
                {(schoolModalKabkot !== "Semua" || schoolModalKecamatan !== "Semua") && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {schoolModalKabkot !== "Semua" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold"><MapPin size={10} /> {schoolModalKabkot}</span>}
                    {schoolModalKecamatan !== "Semua" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold"><Filter size={10} /> Kec. {schoolModalKecamatan}</span>}
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
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-36">Kab/Kota</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-28">Kecamatan</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Jenis</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Status</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Capaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schoolModalPaged.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                        <Search size={22} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-medium">Tidak ada sekolah ditemukan</p>
                      </td></tr>
                    ) : schoolModalPaged.map((row: Record<string, unknown>, i: number) => {
                      const label = getLabelForCode(row, schoolModal.indCode);
                      return (
                        <tr key={String(row["NPSN"] ?? i)} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-snug">{String(row["Nama Satuan Pendidikan"] ?? "–")}</td>
                          <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{String(row["NPSN"] ?? "–")}</td>
                          <td className="px-4 py-3 text-slate-600 text-[11px]">{String(row["Kabupaten/Kota"] ?? "–")}</td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">{String(row["Kecamatan"] ?? "–")}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">{normalizeJenjang(String(row["Jenis Satuan Pendidikan"] ?? ""))}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${row["Status Satuan Pendidikan"] === "Negeri" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                              {String(row["Status Satuan Pendidikan"] ?? "–")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center"><CapaianBadge label={label} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {schoolModalTotalPages > 1 && (
                <div className="flex-shrink-0">
                  <PaginationBar page={schoolModalPage} total={schoolModalTotalPages} onChange={p => setSchoolModalPageLocal(p)} />
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══ MODAL: Rekap TT ════════════════════════════════════════════════ */}
      {rekapTTModal && (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const indInfo = (PRIORITY_INDICATORS as any[]).find((p: any) => p.code === rekapTTModal.code);
        const ks      = kategoriStyle(rekapTTModal.kategori);

        const handleExportModalTT = () => {
          const exportRows = rekapTTFiltered.map(row => {
            const { arah, nilai } = getArahNilai(row as Record<string, unknown>, rekapTTModal.code);
            return {
              "Nama Satuan Pendidikan": row["Nama Satuan Pendidikan"] || "", "NPSN": row["NPSN"] || "",
              "Kabupaten/Kota": row["Kabupaten/Kota"] || "", "Kecamatan": row["Kecamatan"] || "",
              "Jenis Satuan Pendidikan": row["Jenis Satuan Pendidikan"] || "",
              "Jenjang (Normalisasi)": normalizeJenjang(row["Jenis Satuan Pendidikan"] || ""),
              "Status Satuan Pendidikan": row["Status Satuan Pendidikan"] || "",
              "Kode Indikator": rekapTTModal.code, "Nama Indikator": indInfo?.fullName || rekapTTModal.code,
              "Kategori Perubahan": rekapTTModal.kategori, "Arah Perubahan": arah || "",
              "Nilai Perubahan": nilai !== "–" ? nilai : "",
            };
          });
          const safeKabkot = rekapTTKabkot !== "Semua" ? `-${rekapTTKabkot.replace(/[^a-zA-Z0-9]/g, "").substring(0, 15)}` : "";
          const safeKec    = rekapTTKecamatan !== "Semua" ? `-${rekapTTKecamatan.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10)}` : "";
          exportToExcel(
            [{ name: `${rekapTTModal.code} - ${rekapTTModal.kategori}`, data: exportRows }],
            `sekolah-${rekapTTModal.code}-${rekapTTModal.kategori}-${tahun}${safeKabkot}${safeKec}`
          );
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
            onClick={e => { if (e.target === e.currentTarget) closeRekapTTModal(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${ks.bg} 0%, white 100%)` }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0" style={{ background: ks.dot }}>
                    {rekapTTModal.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {indInfo ? `${indInfo.code} – ${indInfo.fullName}` : rekapTTModal.code}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        style={{ background: ks.bg, color: ks.text, borderColor: ks.border }}>
                        {rekapTTModal.kategori === "Meningkat" && "↑ "}
                        {rekapTTModal.kategori === "Menurun"   && "↓ "}
                        {rekapTTModal.kategori === "Tetap"     && "→ "}
                        {rekapTTModal.kategori}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-bold text-slate-600">{rekapTTFiltered.length.toLocaleString("id-ID")}</span> sekolah ditemukan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rekapTTFiltered.length > 0 && (
                    <button onClick={handleExportModalTT}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-all border border-emerald-200 hover:border-emerald-300 hover:shadow-sm">
                      <FileSpreadsheet size={13} /> Unduh Excel
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[9px] font-bold">{rekapTTFiltered.length.toLocaleString("id-ID")}</span>
                    </button>
                  )}
                  <button onClick={closeRekapTTModal} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition text-lg font-bold flex-shrink-0">×</button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0 space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cari nama sekolah, NPSN, atau kab/kota…"
                    value={rekapTTSearch}
                    onChange={e => { setRekapTTSearch(e.target.value); setRekapTTPage(1); }} />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-40 relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                      value={rekapTTKabkot}
                      onChange={e => { setRekapTTKabkot(e.target.value); setRekapTTKecamatan("Semua"); setRekapTTPage(1); }}>
                      {rekapTTKabkotOptions.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kab/Kota" : opt}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="flex-1 min-w-40 relative">
                    <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50"
                      value={rekapTTKecamatan}
                      onChange={e => { setRekapTTKecamatan(e.target.value); setRekapTTPage(1); }}
                      disabled={rekapTTKecamatanOptions.length <= 1}>
                      {rekapTTKecamatanOptions.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kecamatan" : opt}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {(rekapTTKabkot !== "Semua" || rekapTTKecamatan !== "Semua") && (
                    <button onClick={() => { setRekapTTKabkot("Semua"); setRekapTTKecamatan("Semua"); setRekapTTPage(1); }}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap">
                      <XCircle size={12} /> Reset Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="text-xs w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-52">Nama Satdik</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-24">NPSN</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-36">Kab/Kota</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-28">Kecamatan</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Jenis</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Status</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-24">Tren</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px] min-w-20">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapTTPaged.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                        <Search size={22} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-medium">Tidak ada sekolah ditemukan</p>
                      </td></tr>
                    ) : rekapTTPaged.map((row, i) => {
                      const { arah, nilai } = getArahNilai(row as Record<string, unknown>, rekapTTModal.code);
                      const isNaik  = arah.toLowerCase() === "naik";
                      const isTurun = arah.toLowerCase() === "turun";
                      const nilaiNum = parseFloat(nilai.replace(",", "."));
                      return (
                        <tr key={(row["NPSN"] as string) || i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-snug">{row["Nama Satuan Pendidikan"]}</td>
                          <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{row["NPSN"]}</td>
                          <td className="px-4 py-3 text-slate-600 text-[11px]">{row["Kabupaten/Kota"]}</td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">{row["Kecamatan"] || "–"}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">{normalizeJenjang(row["Jenis Satuan Pendidikan"] || "")}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${row["Status Satuan Pendidikan"] === "Negeri" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                              {row["Status Satuan Pendidikan"] || "–"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isNaik ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isTurun ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                              {isNaik && <TrendingUp size={9} />}
                              {isTurun && <TrendingDown size={9} />}
                              {!isNaik && !isTurun && <Minus size={9} />}
                              {arah || "–"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!isNaN(nilaiNum) ? (
                              <span className={`text-sm font-black ${isNaik ? "text-emerald-600" : isTurun ? "text-red-600" : "text-slate-500"}`}>
                                {isNaik ? "+" : isTurun ? "-" : ""}{nilai}
                              </span>
                            ) : <span className="text-slate-300 text-xs">–</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rekapTTTotalPages > 1 && (
                <div className="flex-shrink-0">
                  <PaginationBar page={rekapTTPage} total={rekapTTTotalPages} onChange={p => setRekapTTPage(p)} />
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}