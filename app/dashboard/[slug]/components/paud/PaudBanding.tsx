// components/paud/PaudBanding.tsx
//
// Komponen perbandingan PAUD yang sederhana - hanya menampilkan 3 indikator:
// D2, D3, dan E6 dengan perbandingan tahun 2024 vs 2025
//
import React, { Fragment, useState, useMemo } from "react";
import { 
  Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, 
  Minus as MinusIcon, PieChart as PieChartIcon, Filter, School, 
  Download
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// ── Tipe data ──────────────────────────────────────────────────────────────────
export interface PaudRow {
  npsn: string;
  nama: string;
  jenis: string;
  status: string;
  kabkot?: string;
  kecamatan: string;

  label_d2?: string;
  d2_perubahan?: string;
  d2_perubahan_nilai_num?: number | null;

  label_d3?: string;
  d3_perubahan?: string;
  d3_perubahan_nilai_num?: number | null;

  label_e6?: string;
  e6_perubahan?: string;
  e6_perubahan_nilai_num?: number | null;

  [key: string]: unknown;
}

// ── Konfigurasi Indikator ────────────────────────────────────────────────────
const INDIKATOR = [
  {
    key: "label_d2",
    code: "D2",
    nama: "Kualitas Pembelajaran",
    perubahanKey: "d2_perubahan",
    nilaiKey: "d2_perubahan_nilai_num",
    tahunLabel: "2024",
    tahunPerubahan: "2025"
  },
  {
    key: "label_d3",
    code: "D3",
    nama: "Kualitas Guru",
    perubahanKey: "d3_perubahan",
    nilaiKey: "d3_perubahan_nilai_num",
    tahunLabel: "2024",
    tahunPerubahan: "2025"
  },
  {
    key: "label_e6",
    code: "E6",
    nama: "Partisipasi Orang Tua",
    perubahanKey: "e6_perubahan",
    nilaiKey: "e6_perubahan_nilai_num",
    tahunLabel: "2024",
    tahunPerubahan: "2025"
  },
] as const;

// ── Warna ──────────────────────────────────────────────────────────────────
const COLORS = {
  naik: "#22c55e",
  tetap: "#9ca3af",
  turun: "#ef4444",
  tidakTersedia: "#e5e7eb"
};

// ── Helper Components ──────────────────────────────────────────────────────

function CapaianBadge({ label }: { label?: string }) {
  const styles: Record<string, string> = {
    Baik: "bg-green-100 text-green-700 border-green-200",
    Sedang: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Kurang: "bg-red-100 text-red-700 border-red-200",
  };

  if (!label || !styles[label]) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[label]}`}>
      {label}
    </span>
  );
}

function TrenChip({ perubahan, nilai }: { perubahan?: string; nilai?: number | null }) {
  if (!perubahan || perubahan.includes("Tidak Tersedia")) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const config: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    Naik: {
      icon: <TrendingUp size={14} />,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200"
    },
    Turun: {
      icon: <TrendingDown size={14} />,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200"
    },
    "Tidak Berubah": {
      icon: <MinusIcon size={14} />,
      color: "text-gray-400",
      bg: "bg-gray-50 border-gray-200"
    }
  };

  const style = config[perubahan] || config["Tidak Berubah"];
  const nilaiText = nilai !== null && nilai !== undefined ? `(${nilai > 0 ? '+' : ''}${nilai.toFixed(1)}%)` : '';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.color}`}>
      {style.icon}
      {perubahan}
      {nilaiText && <span className="text-[10px] opacity-75">{nilaiText}</span>}
    </span>
  );
}

function getOverallTrend(row: PaudRow): "naik" | "turun" | "tetap" {
  const changes = INDIKATOR.map(ind => row[ind.perubahanKey] as string | undefined);
  if (changes.some(v => v === "Naik")) return "naik";
  if (changes.some(v => v === "Turun")) return "turun";
  return "tetap";
}

// ── Tipe untuk data download ─────────────────────────────────────────────────
interface PieSlice { name: string; value: number; color: string; }
interface IndikatorChart { code: string; name: string; data: PieSlice[]; total: number; }

// ── Helper: gambar donut chart ke canvas 2D ───────────────────────────────────
function drawDonut(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  outerR: number, innerR: number,
  slices: PieSlice[],
  total: number,
  labelFontSize = 11,
  labelOffset = 20,
) {
  if (total === 0 || slices.length === 0) return;
  let startAngle = -Math.PI / 2;

  slices.forEach(slice => {
    if (slice.value <= 0) return;
    const angle = (slice.value / total) * Math.PI * 2;

    // Slice
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, startAngle + angle);
    ctx.arc(cx, cy, innerR, startAngle + angle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label persen di luar slice (dengan garis konektor)
    const pct = (slice.value / total) * 100;
    if (pct >= 4) {
      const mid = startAngle + angle / 2;
      const cos = Math.cos(mid);
      const sin = Math.sin(mid);
      // Titik di tepi slice
      const sx = cx + (outerR + 3) * cos;
      const sy = cy + (outerR + 3) * sin;
      // Titik belok
      const mx = cx + (outerR + labelOffset * 0.55) * cos;
      const my = cy + (outerR + labelOffset * 0.55) * sin;
      // Titik teks
      const lx = cx + (outerR + labelOffset) * cos;
      const ly = cy + (outerR + labelOffset) * sin;

      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(mx, my);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      ctx.fillStyle = '#374151';
      ctx.font = `600 ${labelFontSize}px ui-sans-serif,system-ui,sans-serif`;
      ctx.textAlign = cos >= 0 ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${pct.toFixed(2)}%`, lx + (cos >= 0 ? 3 : -3), ly);
    }

    startAngle += angle;
  });
}

// ── Helper: gambar legend vertikal per item ───────────────────────────────────
function drawLegendVertical(
  ctx: CanvasRenderingContext2D,
  slices: PieSlice[],
  total: number,
  x: number, y: number,
  fontSize = 11,
  lineH = 20,
) {
  slices.forEach((slice, i) => {
    const pct = total > 0 ? ((slice.value / total) * 100).toFixed(2) : '0';
    const cy = y + i * lineH + lineH / 2;

    ctx.beginPath();
    ctx.arc(x + 6, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = slice.color;
    ctx.fill();

    ctx.fillStyle = '#4b5563';
    ctx.font = `${fontSize}px ui-sans-serif,system-ui,sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${slice.name}: ${slice.value.toLocaleString('id')} (${pct}%)`, x + 18, cy);
  });
  return y + slices.length * lineH;
}

// ── Helper: gambar legend horizontal wrap ────────────────────────────────────
function drawLegendHorizontal(
  ctx: CanvasRenderingContext2D,
  slices: PieSlice[],
  total: number,
  x: number, y: number,
  maxWidth: number,
  fontSize = 11,
) {
  const lineH = 20;
  let curX = x;
  let curY = y;

  slices.forEach(slice => {
    const pct = total > 0 ? ((slice.value / total) * 100).toFixed(2) : '0';
    const label = `${slice.name} ${slice.value.toLocaleString('id')} (${pct}%)`;
    ctx.font = `${fontSize}px ui-sans-serif,system-ui,sans-serif`;
    const textW = ctx.measureText(label).width;
    const itemW = 14 + textW + 20;

    if (curX + itemW > x + maxWidth + 20) {
      curX = x;
      curY += lineH;
    }

    ctx.beginPath();
    ctx.arc(curX + 6, curY + lineH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = slice.color;
    ctx.fill();

    ctx.fillStyle = '#4b5563';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, curX + 18, curY + lineH / 2);

    curX += itemW;
  });
  return curY + lineH;
}

// ── Komponen Download Button ──────────────────────────────────────────────────
function DownloadChartButton({
  fileName = "grafik-tren-paud",
  pieDataSummary,
  pieDataPerIndikator,
  sekolahMeningkat,
  sekolahMenurun,
  sekolahTetap,
  totalData,
  tahun,
}: {
  fileName?: string;
  pieDataSummary: PieSlice[];
  pieDataPerIndikator: IndikatorChart[];
  sekolahMeningkat: number;
  sekolahMenurun: number;
  sekolahTetap: number;
  totalData: number;
  tahun: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // ── Dimensi canvas ──────────────────────────────────────────────
      const W = 1100;          // lebih lebar agar chart per indikator besar
      const PAD = 28;
      const GAP = 12;

      const HEADER_H   = 64;
      const STATS_H    = 88;
      const CHART_H    = 400;  // diperbesar agar ada ruang cukup untuk donut + legend
      const FOOTER_H   = 28;
      const H = PAD + HEADER_H + GAP + STATS_H + GAP + CHART_H + GAP + FOOTER_H;

      const canvas = document.createElement('canvas');
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // ── Background putih ─────────────────────────────────────────────
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // ═══════════════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════════════
      const hY = PAD;
      ctx.fillStyle = '#fff1f2';
      roundRect(ctx, PAD, hY, W - PAD * 2, HEADER_H, 12);
      ctx.fill();
      ctx.strokeStyle = '#fecdd3';
      ctx.lineWidth = 1;
      roundRect(ctx, PAD, hY, W - PAD * 2, HEADER_H, 12);
      ctx.stroke();

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 20px ui-sans-serif,system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Distribusi Tren PAUD', PAD + 20, hY + HEADER_H / 2 - 10);

      ctx.fillStyle = '#6b7280';
      ctx.font = '12px ui-sans-serif,system-ui,sans-serif';
      ctx.fillText(
        `${tahun} vs 2025  ·  D2, D3, dan E6  ·  ${totalData.toLocaleString('id')} Satuan PAUD`,
        PAD + 20, hY + HEADER_H / 2 + 13
      );

      // ═══════════════════════════════════════════════════════════════
      // STAT CARDS
      // ═══════════════════════════════════════════════════════════════
      const sY = hY + HEADER_H + GAP;
      const statCards = [
        { label: 'Meningkat',    value: sekolahMeningkat, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        { label: 'Tidak Berubah', value: sekolahTetap,   color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
        { label: 'Menurun',      value: sekolahMenurun,  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
        { label: 'Total Data',   value: totalData,       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
      ];
      const cardW = (W - PAD * 2 - GAP * 3) / 4;

      statCards.forEach((card, i) => {
        const cx = PAD + i * (cardW + GAP);
        ctx.fillStyle = card.bg;
        roundRect(ctx, cx, sY, cardW, STATS_H, 10);
        ctx.fill();
        ctx.strokeStyle = card.border;
        ctx.lineWidth = 1.5;
        roundRect(ctx, cx, sY, cardW, STATS_H, 10);
        ctx.stroke();

        // Nilai besar
        ctx.fillStyle = card.color;
        ctx.font = `bold 32px ui-sans-serif,system-ui,sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.value.toLocaleString('id'), cx + cardW / 2, sY + 36);

        // Label
        ctx.fillStyle = '#374151';
        ctx.font = '12px ui-sans-serif,system-ui,sans-serif';
        ctx.fillText(card.label, cx + cardW / 2, sY + 62);

        // Persentase
        const pct = totalData > 0 ? ((card.value / totalData) * 100).toFixed(2) : '0';
        ctx.fillStyle = card.color + 'bb';
        ctx.font = '11px ui-sans-serif,system-ui,sans-serif';
        ctx.fillText(`${pct}%`, cx + cardW / 2, sY + 78);
      });

      // ═══════════════════════════════════════════════════════════════
      // AREA CHART UTAMA — 2 panel (kiri: ringkasan | kanan: per indikator)
      // ═══════════════════════════════════════════════════════════════
      const cY = sY + STATS_H + GAP;

      // ── Panel kiri: Tren Keseluruhan ──────────────────────────────
      const LEFT_W = 290;
      ctx.fillStyle = '#f9fafb';
      roundRect(ctx, PAD, cY, LEFT_W, CHART_H, 12);
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      roundRect(ctx, PAD, cY, LEFT_W, CHART_H, 12);
      ctx.stroke();

      // Judul panel kiri
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 13px ui-sans-serif,system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Tren Keseluruhan', PAD + 16, cY + 14);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px ui-sans-serif,system-ui,sans-serif';
      ctx.fillText('Per satuan PAUD', PAD + 16, cY + 30);

      // Donut ringkasan — radius lebih besar
      const leftCX = PAD + LEFT_W / 2;
      const leftCY = cY + 60 + 95;
      drawDonut(ctx, leftCX, leftCY, 95, 42, pieDataSummary, totalData, 12, 26);

      // Legend ringkasan vertikal di bawah
      const legendY = leftCY + 95 + 36;
      drawLegendVertical(ctx, pieDataSummary, totalData, PAD + 16, legendY, 11, 20);

      // ── Panel kanan: Tren per Indikator ──────────────────────────
      const RIGHT_X = PAD + LEFT_W + GAP;
      const RIGHT_W = W - PAD - RIGHT_X;
      ctx.fillStyle = '#f9fafb';
      roundRect(ctx, RIGHT_X, cY, RIGHT_W, CHART_H, 12);
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      roundRect(ctx, RIGHT_X, cY, RIGHT_W, CHART_H, 12);
      ctx.stroke();

      // Judul panel kanan
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 13px ui-sans-serif,system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Tren per Indikator', RIGHT_X + 16, cY + 14);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px ui-sans-serif,system-ui,sans-serif';
      ctx.fillText('D2, D3, dan E6', RIGHT_X + 16, cY + 30);

      // 3 sub-panel per indikator (D2, D3, E6)
      const INNER_PAD   = 14;        // padding dalam panel kanan
      const SUB_GAP     = 10;        // gap antar sub-panel
      const indW        = (RIGHT_W - INNER_PAD * 2 - SUB_GAP * 2) / 3;
      const IND_R_OUTER = 62;        // diperkecil agar label % tidak bertabrakan legend
      const IND_R_INNER = 26;
      const SUB_TOP     = cY + 46;   // Y atas sub-panel
      const SUB_H       = CHART_H - 54;

      pieDataPerIndikator.forEach((ind, i) => {
        const subX  = RIGHT_X + INNER_PAD + i * (indW + SUB_GAP);
        const subCX = subX + indW / 2;
        const subY2 = SUB_TOP + SUB_H;  // Y bawah sub-panel

        // ── Sub-panel card ──
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, subX, SUB_TOP, indW, SUB_H, 10);
        ctx.fill();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        roundRect(ctx, subX, SUB_TOP, indW, SUB_H, 10);
        ctx.stroke();

        // ── Clip ke dalam sub-panel dengan overflow horizontal cukup untuk label % ──
        ctx.save();
        ctx.beginPath();
        const CLIP_HPAD = 30;  // overflow kiri-kanan agar label % tidak terpotong
        ctx.rect(subX - CLIP_HPAD, SUB_TOP, indW + CLIP_HPAD * 2, SUB_H);
        ctx.clip();

        // ── Badge kode (D2 / D3 / E6) ──
        const BADGE_W = 40; const BADGE_H = 22; const BADGE_Y = SUB_TOP + 12;
        ctx.fillStyle = '#fef2f2';
        roundRect(ctx, subCX - BADGE_W / 2, BADGE_Y, BADGE_W, BADGE_H, 6);
        ctx.fill();
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 1;
        roundRect(ctx, subCX - BADGE_W / 2, BADGE_Y, BADGE_W, BADGE_H, 6);
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 12px ui-sans-serif,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ind.code, subCX, BADGE_Y + BADGE_H / 2);

        // ── Nama indikator (truncate kalau terlalu panjang) ──
        const NAME_Y = BADGE_Y + BADGE_H + 6;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px ui-sans-serif,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // Truncate agar tidak overflow
        let nameTxt = ind.name;
        const maxNameW = indW - 12;
        while (ctx.measureText(nameTxt).width > maxNameW && nameTxt.length > 3) {
          nameTxt = nameTxt.slice(0, -1);
        }
        if (nameTxt !== ind.name) nameTxt += '…';
        ctx.fillText(nameTxt, subCX, NAME_Y);

        // ── Layout: hitung tinggi legend dulu, sisakan untuk donut ──
        const LEGEND_LINE_H = 18;
        const LEGEND_LINES  = ind.data.length;
        const LEGEND_H_TOTAL = LEGEND_LINES * LEGEND_LINE_H + 8;
        const DONUT_TOP   = NAME_Y + 14;
        // Donut center = tengah antara DONUT_TOP dan awal legend
        const legY        = subY2 - LEGEND_H_TOTAL - 8;
        const indDonutCY  = DONUT_TOP + (legY - IND_R_OUTER - DONUT_TOP) / 2 + IND_R_OUTER;

        drawDonut(ctx, subCX, indDonutCY, IND_R_OUTER, IND_R_INNER, ind.data, ind.total, 10, 20);

        // ── Legend vertikal ──
        drawLegendVertical(ctx, ind.data, ind.total, subX + 10, legY, 10, LEGEND_LINE_H);

        ctx.restore();
      });

      // ═══════════════════════════════════════════════════════════════
      // FOOTER / WATERMARK
      // ═══════════════════════════════════════════════════════════════
      ctx.fillStyle = '#d1d5db';
      ctx.font = '10px ui-sans-serif,system-ui,sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `BBPMP Jawa Barat  ·  ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        W - PAD, H - 6
      );

      // ── Download ──────────────────────────────────────────────────
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`;
        a.href = url;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');

    } catch (err) {
      console.error('Download gagal:', err);
      alert('Gagal mengunduh grafik.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isDownloading ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin" />
          <span>Memproses...</span>
        </>
      ) : (
        <>
          <Download size={16} className="text-rose-500" />
          <span>Download PNG</span>
        </>
      )}
    </button>
  );
}

// ── Helper: roundRect polyfill ────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Komponen Utama ────────────────────────────────────────────────────────────
export function PaudBanding({ data = [], tahun }: { data: PaudRow[]; tahun: string }) {
  const [filterKec, setFilterKec] = useState("Semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // Refs untuk download grafik dihapus — download sekarang berbasis data, bukan DOM

  const kecamatanOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(data.map(d => d.kecamatan))).filter(Boolean).sort()],
    [data]
  );

  const filteredData = useMemo(() => {
    let result = data;
    if (filterKec !== "Semua") {
      result = result.filter(d => d.kecamatan === filterKec);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        d => d.nama?.toLowerCase().includes(q) ||
          d.kecamatan?.toLowerCase().includes(q) ||
          d.npsn?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, filterKec, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // === STATISTIK ===
  const sekolahMeningkat = filteredData.filter(r => getOverallTrend(r) === "naik").length;
  const sekolahMenurun = filteredData.filter(r => getOverallTrend(r) === "turun").length;
  const sekolahTetap = filteredData.filter(r => getOverallTrend(r) === "tetap").length;
  const totalData = filteredData.length;

  // === DATA PIE CHART RINGKASAN ===
  const pieDataSummary = [
    { name: 'Meningkat', value: sekolahMeningkat, color: COLORS.naik },
    { name: 'Tidak Berubah', value: sekolahTetap, color: COLORS.tetap },
    { name: 'Menurun', value: sekolahMenurun, color: COLORS.turun },
  ].filter(item => item.value > 0);

  // === DATA PIE CHART PER INDIKATOR ===
  const pieDataPerIndikator = INDIKATOR.map(ind => {
    const naik = filteredData.filter(d => d[ind.perubahanKey] === "Naik").length;
    const turun = filteredData.filter(d => d[ind.perubahanKey] === "Turun").length;
    const tetap = filteredData.filter(d => d[ind.perubahanKey] === "Tidak Berubah").length;
    const tidakTersedia = filteredData.filter(d => 
      !d[ind.perubahanKey] || d[ind.perubahanKey]?.includes("Tidak Tersedia")
    ).length;

    return {
      code: ind.code,
      name: ind.nama,
      data: [
        { name: 'Meningkat', value: naik, color: COLORS.naik },
        { name: 'Tidak Berubah', value: tetap, color: COLORS.tetap },
        { name: 'Menurun', value: turun, color: COLORS.turun },
        { name: 'Tidak Tersedia', value: tidakTersedia, color: COLORS.tidakTersedia },
      ].filter(item => item.value > 0),
      total: filteredData.length,
    };
  });

  // === CUSTOM COMPONENTS ===
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalData > 0 ? ((data.value / totalData) * 100).toFixed(2) : 0;
      
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 min-w-[140px]">
          <p className="font-semibold text-gray-800 text-sm">{data.name}</p>
          <p className="text-2xl font-bold text-gray-900">{data.value}</p>
          <p className="text-xs text-gray-500">{percentage}% dari total</p>
        </div>
      );
    }
    return null;
  };

  // Custom label untuk menampilkan persentase di LUAR Pie Chart (dengan garis penghubung)
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.03) return null;

    const RADIAN = Math.PI / 180;
    // titik di tepi luar slice
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 4) * cos;
    const sy = cy + (outerRadius + 4) * sin;
    // titik belok garis
    const mx = cx + (outerRadius + 18) * cos;
    const my = cy + (outerRadius + 18) * sin;
    // titik teks
    const ex = mx + (cos >= 0 ? 1 : -1) * 10;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#9ca3af" strokeWidth={1} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill="#9ca3af" />
        <text
          x={ex + (cos >= 0 ? 4 : -4)}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={11}
          fontWeight="600"
          fill="#374151"
        >
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  };

  // Custom label untuk Pie Chart kecil (per indikator) - label di luar
  const renderSmallLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 3) * cos;
    const sy = cy + (outerRadius + 3) * sin;
    const ex = cx + (outerRadius + 14) * cos;
    const ey = cy + (outerRadius + 14) * sin;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#9ca3af" strokeWidth={1} />
        <text
          x={ex + (cos >= 0 ? 3 : -3)}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={8}
          fontWeight="600"
          fill="#374151"
        >
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {payload?.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-600">{entry.value}</span>
            <span className="text-gray-400 font-medium">
              ({entry.payload?.value || 0})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Stat Card Component
  const StatCard = ({ icon, label, value, color, bgColor, subText }: any) => (
    <div className={`${bgColor} border ${color.replace('text', 'border')} rounded-xl p-4 text-center transition-all hover:scale-105 duration-200`}>
      <div className={`${color} mx-auto mb-1.5`}>{icon}</div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className={`text-xs font-medium ${color}`}>{label}</p>
      {subText && <p className="text-[10px] opacity-75 mt-0.5">{subText}</p>}
    </div>
  );

  // Small Legend for indicator
  const IndicatorLegend = ({ data, total }: { data: any[], total: number }) => (
    <div className="flex flex-col gap-1 mt-2">
      {data.map((item, i) => {
        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(2) : 0;
        return (
          <div key={i} className="flex items-center gap-1 text-[9px]">
            <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
            <span className="text-gray-500 truncate">{item.name}</span>
            <span className="font-semibold text-gray-700 ml-auto">{item.value}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <School size={28} className="text-rose-500" />
              Perbandingan Capaian PAUD
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {tahun} — Membandingkan capaian <span className="font-semibold">2024</span> dengan <span className="font-semibold">2025</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Berdasarkan 3 indikator utama: D2, D3, dan E6
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <School size={16} className="text-rose-400" />
            <span className="text-sm font-semibold text-gray-700">{totalData}</span>
            <span className="text-xs text-gray-400">Satuan PAUD</span>
          </div>
        </div>
      </div>

      {/* ── STATISTIK RINGKASAN ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp size={28} />}
          label="Meningkat"
          value={sekolahMeningkat}
          color="text-green-600"
          bgColor="bg-green-50"
          subText={totalData > 0 ? `${((sekolahMeningkat / totalData) * 100).toFixed(1)}%` : '0%'}
        />
        <StatCard
          icon={<MinusIcon size={28} />}
          label="Tidak Berubah"
          value={sekolahTetap}
          color="text-gray-500"
          bgColor="bg-gray-50"
          subText={totalData > 0 ? `${((sekolahTetap / totalData) * 100).toFixed(1)}%` : '0%'}
        />
        <StatCard
          icon={<TrendingDown size={28} />}
          label="Menurun"
          value={sekolahMenurun}
          color="text-red-500"
          bgColor="bg-red-50"
          subText={totalData > 0 ? `${((sekolahMenurun / totalData) * 100).toFixed(1)}%` : '0%'}
        />
        <StatCard
          icon={<PieChartIcon size={28} />}
          label="Total Data"
          value={totalData}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
      </div>

      {/* ── GABUNGAN GRAFIK: RINGKASAN + PER INDIKATOR ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <PieChartIcon size={16} className="text-rose-500" />
              Distribusi Tren PAUD
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Tren keseluruhan (kiri) dan per indikator (kanan)
            </p>
          </div>
          <DownloadChartButton
            fileName="tren-paud-lengkap"
            pieDataSummary={pieDataSummary}
            pieDataPerIndikator={pieDataPerIndikator}
            sekolahMeningkat={sekolahMeningkat}
            sekolahMenurun={sekolahMenurun}
            sekolahTetap={sekolahTetap}
            totalData={totalData}
            tahun={tahun}
          />
        </div>
        
        <div className="p-5">
          {/* Grid 2 kolom: Ringkasan di kiri, Per Indikator di kanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ── KIRI: Ringkasan ── */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
              <h4 className="font-semibold text-gray-700 text-sm text-center mb-1">
                Tren Keseluruhan
              </h4>
              <p className="text-[10px] text-gray-400 text-center mb-3">
                Per satuan PAUD
              </p>
              
              {pieDataSummary.length > 0 ? (
                <>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieDataSummary}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={68}
                          innerRadius={30}
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {pieDataSummary.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      Meningkat: {sekolahMeningkat} ({totalData > 0 ? ((sekolahMeningkat/totalData)*100).toFixed(2) : 0}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                      Tidak Berubah: {sekolahTetap} ({totalData > 0 ? ((sekolahTetap/totalData)*100).toFixed(2) : 0}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                      Menurun: {sekolahMenurun} ({totalData > 0 ? ((sekolahMenurun/totalData)*100).toFixed(2) : 0}%)
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400">
                  <p className="text-sm">Tidak ada data</p>
                </div>
              )}
            </div>

            {/* ── KANAN: Per Indikator ── */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
              <h4 className="font-semibold text-gray-700 text-sm text-center mb-1">
                Tren per Indikator
              </h4>
              <p className="text-[10px] text-gray-400 text-center mb-3">
                D2, D3, dan E6
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {pieDataPerIndikator.map((indikator, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-2 bg-white">
                    <div className="flex flex-col items-center mb-1.5">
                      <span className="font-bold text-gray-800 text-sm">{indikator.code}</span>
                      <span className="text-[9px] text-gray-400 text-center leading-tight">{indikator.name}</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">n={indikator.total}</span>
                    </div>
                    
                    <div className="h-[110px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={indikator.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderSmallLabel}
                            outerRadius={28}
                            innerRadius={12}
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {indikator.data.map((entry, index) => (
                              <Cell key={`cell-${idx}-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const percentage = indikator.total > 0 ? ((data.value / indikator.total) * 100).toFixed(2) : 0;
                                return (
                                  <div className="bg-white px-2 py-1.5 rounded shadow-lg border border-gray-200 text-[10px] min-w-[100px]">
                                    <p className="font-semibold text-gray-800">{data.name}</p>
                                    <p className="font-bold text-gray-900">{data.value}</p>
                                    <p className="text-gray-500">{percentage}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <IndicatorLegend data={indikator.data} total={indikator.total} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABEL DATA ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-white"
                placeholder="Cari NPSN, Nama, atau Kecamatan..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="relative min-w-[180px]">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent appearance-none"
                value={filterKec}
                onChange={e => { setFilterKec(e.target.value); setPage(1); }}
              >
                {kecamatanOptions.map(k => (
                  <option key={k} className="text-gray-800">{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">NPSN</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Sekolah</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Kecamatan</th>
                {INDIKATOR.map(ind => (
                  <th key={ind.code} colSpan={2} className="text-center py-2 px-3 text-xs font-bold text-rose-600 border-l border-gray-100">
                    {ind.code}
                    <span className="block text-[9px] font-normal text-gray-400">
                      {ind.tahunLabel} → {ind.tahunPerubahan}
                    </span>
                  </th>
                ))}
                <th rowSpan={2} className="text-center py-3 px-3 text-xs font-bold text-rose-500 border-l border-gray-100">
                  Tren
                </th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                {INDIKATOR.map(ind => (
                  <Fragment key={ind.code}>
                    <th className="text-center py-1.5 px-2 text-[9px] font-medium text-gray-400 border-l border-gray-100">
                      Capaian
                    </th>
                    <th className="text-center py-1.5 px-2 text-[9px] font-medium text-gray-400">
                      Perubahan
                    </th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={3 + INDIKATOR.length * 2 + 1} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <p className="text-sm">Tidak ada data yang sesuai filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const trend = getOverallTrend(row);
                  return (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs text-gray-400">{row.npsn}</td>
                      <td className="py-2.5 px-3 text-xs font-medium text-gray-800 max-w-[150px] truncate" title={row.nama}>
                        {row.nama}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-500">{row.kecamatan}</td>

                      {INDIKATOR.map(ind => (
                        <Fragment key={ind.code}>
                          <td className="py-2.5 px-3 border-l border-gray-100 text-center">
                            <CapaianBadge label={row[ind.key] as string | undefined} />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <TrenChip
                              perubahan={row[ind.perubahanKey] as string | undefined}
                              nilai={row[ind.nilaiKey] as number | null | undefined}
                            />
                          </td>
                        </Fragment>
                      ))}

                      <td className="py-2.5 px-3 border-l border-gray-100 text-center">
                        {trend === "naik" && <TrenChip perubahan="Naik" />}
                        {trend === "turun" && <TrenChip perubahan="Turun" />}
                        {trend === "tetap" && <TrenChip perubahan="Tidak Berubah" />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 order-2 sm:order-1">
            Halaman {page} dari {totalPages} · {filteredData.length} data
          </p>
          <div className="flex gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="text-xs text-gray-400 text-center space-y-1 border-t border-gray-100 pt-4">
        <p>
          <span className="font-medium">D2</span> = Kualitas Pembelajaran · 
          <span className="font-medium ml-1">D3</span> = Kualitas Guru · 
          <span className="font-medium ml-1">E6</span> = Partisipasi Orang Tua
        </p>
        <p>⬆ Naik · ⬇ Turun · ➡ Tetap</p>
      </div>
    </div>
  );
}