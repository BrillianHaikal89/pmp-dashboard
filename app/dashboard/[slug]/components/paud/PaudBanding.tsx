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
      // Layout: 4 kartu sejajar (sama seperti UI) — Tren Keseluruhan + D2 + D3 + E6
      const SCALE   = 2;           // retina/HiDPI
      const W_CSS   = 1200;
      const PAD     = 40;
      const GAP     = 16;

      const HEADER_H = 72;
      const STATS_H  = 100;
      const CARD_H   = 420;        // tinggi setiap kartu chart
      const FOOTER_H = 36;
      const H_CSS    = PAD + HEADER_H + GAP + STATS_H + GAP + CARD_H + GAP + FOOTER_H + PAD;

      const W = W_CSS * SCALE;
      const H = H_CSS * SCALE;

      const canvas = document.createElement('canvas');
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(SCALE, SCALE);

      // ── Background ──────────────────────────────────────────────────
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W_CSS, H_CSS);

      // ═══════════════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════════════
      const hY = PAD;
      ctx.fillStyle = '#fff1f2';
      roundRect(ctx, PAD, hY, W_CSS - PAD * 2, HEADER_H, 14);
      ctx.fill();
      ctx.strokeStyle = '#fecdd3';
      ctx.lineWidth = 1.5;
      roundRect(ctx, PAD, hY, W_CSS - PAD * 2, HEADER_H, 14);
      ctx.stroke();

      ctx.fillStyle = '#be123c';
      ctx.font = 'bold 22px ui-sans-serif,system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Distribusi Tren PAUD', PAD + 24, hY + HEADER_H / 2 - 10);

      ctx.fillStyle = '#6b7280';
      ctx.font = '13px ui-sans-serif,system-ui,sans-serif';
      ctx.fillText(
        `${tahun} vs 2025  ·  D2, D3, dan E6  ·  ${totalData.toLocaleString('id')} Satuan PAUD`,
        PAD + 24, hY + HEADER_H / 2 + 14
      );

      // ═══════════════════════════════════════════════════════════════
      // STAT CARDS
      // ═══════════════════════════════════════════════════════════════
      const sY = hY + HEADER_H + GAP;
      const statCards = [
        { label: 'Meningkat',     value: sekolahMeningkat, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        { label: 'Tidak Berubah', value: sekolahTetap,     color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
        { label: 'Menurun',       value: sekolahMenurun,   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
        { label: 'Total Data',    value: totalData,         color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
      ];
      const cardW4 = (W_CSS - PAD * 2 - GAP * 3) / 4;

      statCards.forEach((card, i) => {
        const cx = PAD + i * (cardW4 + GAP);
        ctx.fillStyle = card.bg;
        roundRect(ctx, cx, sY, cardW4, STATS_H, 10);
        ctx.fill();
        ctx.strokeStyle = card.border;
        ctx.lineWidth = 1.5;
        roundRect(ctx, cx, sY, cardW4, STATS_H, 10);
        ctx.stroke();

        ctx.fillStyle = card.color;
        ctx.font = 'bold 36px ui-sans-serif,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.value.toLocaleString('id'), cx + cardW4 / 2, sY + 40);

        ctx.fillStyle = '#374151';
        ctx.font = '12px ui-sans-serif,system-ui,sans-serif';
        ctx.fillText(card.label, cx + cardW4 / 2, sY + 70);

        const pct = totalData > 0 ? ((card.value / totalData) * 100).toFixed(1) : '0';
        ctx.fillStyle = card.color + 'aa';
        ctx.font = '11px ui-sans-serif,system-ui,sans-serif';
        ctx.fillText(`${pct}%`, cx + cardW4 / 2, sY + 87);
      });

      // ═══════════════════════════════════════════════════════════════
      // 4 KARTU CHART SEJAJAR — layout identik dengan UI
      // ═══════════════════════════════════════════════════════════════
      const cY = sY + STATS_H + GAP;

      // Data ke-4 kartu: [ringkasan, D2, D3, E6]
      const allCards = [
        {
          title: 'Tren Keseluruhan',
          subtitle: 'Per satuan PAUD',
          data: pieDataSummary,
          total: totalData,
          isSummary: true,
        },
        ...pieDataPerIndikator.map(ind => ({
          title: ind.code,
          subtitle: ind.name,
          data: ind.data,
          total: ind.total,
          isSummary: false,
        })),
      ];

      const DONUT_R_OUTER = 90;
      const DONUT_R_INNER = 38;
      const LABEL_OFFSET  = 28;
      const LEG_LINE_H    = 22;

      allCards.forEach((card, i) => {
        const cardX  = PAD + i * (cardW4 + GAP);
        const cardCX = cardX + cardW4 / 2;

        // ── Kartu putih ──
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, cardX, cY, cardW4, CARD_H, 12);
        ctx.fill();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1.5;
        roundRect(ctx, cardX, cY, cardW4, CARD_H, 12);
        ctx.stroke();

        // ── Judul ──
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 14px ui-sans-serif,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(card.title, cardCX, cY + 16);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px ui-sans-serif,system-ui,sans-serif';
        ctx.fillText(card.subtitle, cardCX, cY + 35);

        if (!card.isSummary) {
          // tidak ada n= label
        }

        // ── Donut (posisi tengah vertikal di area atas kartu) ──
        const donutCY = cY + 80 + DONUT_R_OUTER + LABEL_OFFSET;

        ctx.save();
        // Clip horizontal lebih lebar agar label % tidak terpotong
        ctx.beginPath();
        ctx.rect(cardX - 30, cY, cardW4 + 60, CARD_H);
        ctx.clip();
        drawDonut(ctx, cardCX, donutCY, DONUT_R_OUTER, DONUT_R_INNER, card.data, card.total, 11, LABEL_OFFSET);
        ctx.restore();

        // ── Legend vertikal di bawah donut ──
        const legStartY = donutCY + DONUT_R_OUTER + LABEL_OFFSET + 16;
        drawLegendVertical(ctx, card.data, card.total, cardX + 20, legStartY, 11, LEG_LINE_H);
      });

      // ═══════════════════════════════════════════════════════════════
      // FOOTER / WATERMARK
      // ═══════════════════════════════════════════════════════════════
      ctx.fillStyle = '#d1d5db';
      ctx.font = '11px ui-sans-serif,system-ui,sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `BBPMP Jawa Barat  ·  ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        W_CSS - PAD, H_CSS - 8
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
  const [filterJenis, setFilterJenis] = useState<string[]>([]);
  const [jenisDropdownOpenGrafik, setJenisDropdownOpenGrafik] = useState(false);
  const [jenisDropdownOpenTabel, setJenisDropdownOpenTabel] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // Refs untuk download grafik dihapus — download sekarang berbasis data, bukan DOM

  const kecamatanOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(data.map(d => d.kecamatan))).filter(Boolean).sort()],
    [data]
  );

  const jenisOptions = useMemo(
    () => Array.from(new Set(data.map(d => d.jenis))).filter(Boolean).sort(),
    [data]
  );

  // Inisialisasi filterJenis ke semua jenis saat data pertama kali tersedia
  React.useEffect(() => {
    if (jenisOptions.length > 0 && filterJenis.length === 0) {
      setFilterJenis(jenisOptions);
    }
  }, [jenisOptions]);

  const filteredData = useMemo(() => {
    let result = data;
    if (filterKec !== "Semua") {
      result = result.filter(d => d.kecamatan === filterKec);
    }
    if (filterJenis.length > 0 && filterJenis.length < jenisOptions.length) {
      result = result.filter(d => filterJenis.includes(d.jenis));
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
  }, [data, filterKec, filterJenis, jenisOptions.length, search]);

  const toggleJenis = (jenis: string) => {
    setFilterJenis(prev =>
      prev.includes(jenis) ? prev.filter(j => j !== jenis) : [...prev, jenis]
    );
    setPage(1);
  };

  const toggleSemuaJenis = () => {
    setFilterJenis(prev => prev.length === jenisOptions.length ? [] : [...jenisOptions]);
    setPage(1);
  };

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

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Filter Jenjang (multi-select dropdown) */}
            <div className="relative">
              <button
                onClick={() => setJenisDropdownOpenGrafik(v => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter size={14} className="text-rose-400" />
                <span className="text-gray-700 text-xs font-medium">
                  Jenjang
                  {filterJenis.length > 0 && filterJenis.length < jenisOptions.length
                    ? `: ${filterJenis.length} dipilih`
                    : filterJenis.length === 0
                    ? ": Tidak ada"
                    : ": Semua"}
                </span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${jenisDropdownOpenGrafik ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {jenisDropdownOpenGrafik && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setJenisDropdownOpenGrafik(false)} />
                  <div className="absolute right-0 mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] py-1.5 overflow-hidden">
                    {/* Semua / Hapus semua */}
                    <button
                      onClick={toggleSemuaJenis}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100"
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${filterJenis.length === jenisOptions.length ? 'bg-rose-500 border-rose-500' : 'border-gray-300'}`}>
                        {filterJenis.length === jenisOptions.length && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        {filterJenis.length > 0 && filterJenis.length < jenisOptions.length && <span className="w-2 h-0.5 bg-rose-500 block" />}
                      </span>
                      Pilih Semua
                    </button>
                    {jenisOptions.map(jenis => (
                      <button
                        key={jenis}
                        onClick={() => toggleJenis(jenis)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-xs text-gray-700"
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${filterJenis.includes(jenis) ? 'bg-rose-500 border-rose-500' : 'border-gray-300'}`}>
                          {filterJenis.includes(jenis) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        {jenis}
                      </button>
                    ))}
                  </div>
                </>
              )}
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
          </div>{/* end flex items-center gap-2 */}
        </div>
        
        <div className="p-5">
          {/* Grid 4 kolom sejajar: Ringkasan + 3 Indikator — semua ukuran sama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* ── Tren Keseluruhan ── */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col">
              <h4 className="font-semibold text-gray-700 text-sm text-center mb-0.5">
                Tren Keseluruhan
              </h4>
              <p className="text-[10px] text-gray-400 text-center mb-2">Per satuan PAUD</p>

              {pieDataSummary.length > 0 ? (
                <>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieDataSummary}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderSmallLabel}
                          outerRadius={68}
                          innerRadius={30}
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {pieDataSummary.map((entry, index) => (
                            <Cell key={`cell-summary-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <IndicatorLegend data={pieDataSummary} total={totalData} />
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-gray-400">
                  <p className="text-sm">Tidak ada data</p>
                </div>
              )}
            </div>

            {/* ── Per Indikator: D2, D3, E6 ── */}
            {pieDataPerIndikator.map((indikator, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col">
                <div className="flex flex-col items-center mb-0.5">
                  <span className="font-bold text-gray-800 text-sm">{indikator.code}</span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">{indikator.name}</span>

                </div>

                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={indikator.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderSmallLabel}
                        outerRadius={68}
                        innerRadius={30}
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
                            const d = payload[0].payload;
                            const percentage = indikator.total > 0 ? ((d.value / indikator.total) * 100).toFixed(2) : 0;
                            return (
                              <div className="bg-white px-2 py-1.5 rounded shadow-lg border border-gray-200 text-[10px] min-w-[100px]">
                                <p className="font-semibold text-gray-800">{d.name}</p>
                                <p className="font-bold text-gray-900">{d.value}</p>
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
            {/* Filter Kecamatan */}
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
            {/* Filter Jenjang (tabel) */}
            <div className="relative">
              <button
                onClick={() => setJenisDropdownOpenTabel(v => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <School size={14} className="text-rose-400 flex-shrink-0" />
                <span className="text-gray-700 text-sm">
                  Jenjang{filterJenis.length > 0 && filterJenis.length < jenisOptions.length
                    ? ` (${filterJenis.length})`
                    : filterJenis.length === 0
                    ? " —"
                    : ""}
                </span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-auto ${jenisDropdownOpenTabel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {jenisDropdownOpenTabel && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setJenisDropdownOpenTabel(false)} />
                  <div className="absolute right-0 mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] py-1.5 overflow-hidden">
                    <button
                      onClick={toggleSemuaJenis}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100"
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${filterJenis.length === jenisOptions.length ? 'bg-rose-500 border-rose-500' : 'border-gray-300'}`}>
                        {filterJenis.length === jenisOptions.length && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        {filterJenis.length > 0 && filterJenis.length < jenisOptions.length && <span className="w-2 h-0.5 bg-rose-500 block" />}
                      </span>
                      Pilih Semua
                    </button>
                    {jenisOptions.map(jenis => (
                      <button
                        key={jenis}
                        onClick={() => toggleJenis(jenis)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-xs text-gray-700"
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${filterJenis.includes(jenis) ? 'bg-rose-500 border-rose-500' : 'border-gray-300'}`}>
                          {filterJenis.includes(jenis) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        {jenis}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Active jenis filter chips */}
          {filterJenis.length > 0 && filterJenis.length < jenisOptions.length && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {filterJenis.map(j => (
                <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-full font-medium">
                  {j}
                  <button onClick={() => toggleJenis(j)} className="hover:text-rose-900">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
              <button onClick={() => setFilterJenis([...jenisOptions])} className="text-xs text-gray-400 hover:text-rose-500 underline ml-1">
                Pilih semua
              </button>
            </div>
          )}
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
    </div>
  );
}