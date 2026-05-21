// components/prioritas/SatdikTrenRekap.tsx
import { School, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { SatdikTrenRow, SatdikIndikatorTren } from "../../types";
import { getLabelScore, sortIndikatorKeys } from "../../utils/helpers";
import { INDIKATOR_INFO } from "../../utils/constants";

function getSatdikTrenStats(satdikTren: { total: number; data: SatdikTrenRow[] } | null) {
  if (!satdikTren?.data?.length) return null;
  const rows = satdikTren.data;
  const indikatorKeys = Array.from(
    new Set(rows.flatMap(r => Object.keys(r).filter(k => /^[A-Z]\.\d+/.test(k))))
  ).sort();
  const perIndikator = indikatorKeys.map(key => {
    const naik  = rows.filter(r => (r[key] as SatdikIndikatorTren)?.tren?.toLowerCase() === "naik").length;
    const turun = rows.filter(r => (r[key] as SatdikIndikatorTren)?.tren?.toLowerCase() === "turun").length;
    const stabil = rows.filter(r => { const t = (r[key] as SatdikIndikatorTren)?.tren?.toLowerCase(); return t === "stabil" || t === "tidak berubah"; }).length;
    return { key, naik, turun, stabil };
  });
  const jenisSet = Array.from(new Set(rows.map(r => r.jenis))).filter(Boolean).sort();
  const kategorisasiSekolah = rows.map(r => {
    const naikCount  = indikatorKeys.filter(k => (r[k] as SatdikIndikatorTren)?.tren?.toLowerCase() === "naik").length;
    const turunCount = indikatorKeys.filter(k => (r[k] as SatdikIndikatorTren)?.tren?.toLowerCase() === "turun").length;
    if (naikCount > turunCount) return "naik";
    if (turunCount > naikCount) return "turun";
    return "stabil";
  });
  const sekolahNaik   = kategorisasiSekolah.filter(k => k === "naik").length;
  const sekolahTurun  = kategorisasiSekolah.filter(k => k === "turun").length;
  const sekolahStabil = kategorisasiSekolah.filter(k => k === "stabil").length;
  const perJenis = jenisSet.map(jenis => {
    const sub = rows.map((r, i) => ({ r, kat: kategorisasiSekolah[i] })).filter(x => x.r.jenis === jenis);
    return { jenis, total: sub.length, naik: sub.filter(x => x.kat === "naik").length, turun: sub.filter(x => x.kat === "turun").length };
  });
  return { total: rows.length, sekolahNaik, sekolahTurun, sekolahStabil, perIndikator, perJenis, indikatorKeys };
}

function getSatdikLabelStats(satdikTren: { total: number; data: SatdikTrenRow[] } | null) {
  if (!satdikTren?.data?.length) return null;
  const rows = satdikTren.data;
  const indikatorKeys = Array.from(
    new Set(rows.flatMap(r => Object.keys(r).filter(k => /^[A-Z]\.\d+/.test(k))))
  ).sort();

  const perIndikator = indikatorKeys.map(key => {
    const baik   = rows.filter(r => (r[key] as SatdikIndikatorTren)?.label === "Baik").length;
    const sedang = rows.filter(r => (r[key] as SatdikIndikatorTren)?.label === "Sedang").length;
    const kurang = rows.filter(r => (r[key] as SatdikIndikatorTren)?.label === "Kurang").length;
    return { key, baik, sedang, kurang };
  });

  const jenisSet = Array.from(new Set(rows.map(r => r.jenis))).filter(Boolean).sort();
  const kategorisasiSekolah = rows.map(r => {
    const baikCount   = indikatorKeys.filter(k => (r[k] as SatdikIndikatorTren)?.label === "Baik").length;
    const sedangCount = indikatorKeys.filter(k => (r[k] as SatdikIndikatorTren)?.label === "Sedang").length;
    const kurangCount = indikatorKeys.filter(k => (r[k] as SatdikIndikatorTren)?.label === "Kurang").length;
    if (baikCount >= sedangCount && baikCount >= kurangCount) return "baik";
    if (kurangCount > baikCount && kurangCount >= sedangCount) return "kurang";
    return "sedang";
  });

  const sekolahBaik   = kategorisasiSekolah.filter(k => k === "baik").length;
  const sekolahSedang = kategorisasiSekolah.filter(k => k === "sedang").length;
  const sekolahKurang = kategorisasiSekolah.filter(k => k === "kurang").length;

  const perJenis = jenisSet.map(jenis => {
    const sub = rows.map((r, i) => ({ r, kat: kategorisasiSekolah[i] })).filter(x => x.r.jenis === jenis);
    return { jenis, total: sub.length, baik: sub.filter(x => x.kat === "baik").length, sedang: sub.filter(x => x.kat === "sedang").length, kurang: sub.filter(x => x.kat === "kurang").length };
  });

  return { total: rows.length, sekolahBaik, sekolahSedang, sekolahKurang, perIndikator, perJenis, indikatorKeys };
}

export function SatdikTrenRekap({ satdikTren, tahun, compact }: {
  satdikTren: { total: number; data: SatdikTrenRow[] } | null;
  tahun?: string;
  compact?: boolean;
}) {
  const isTahun25 = tahun === "2025";
  const labelStats = isTahun25 ? getSatdikLabelStats(satdikTren) : null;
  const trenStats  = !isTahun25 ? getSatdikTrenStats(satdikTren) : null;
  const hasData    = isTahun25 ? !!labelStats : !!trenStats;

  if (!hasData) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <School size={16} className="text-slate-400" />
        <h3 className="font-semibold text-slate-700">Rekap Capaian Sekolah</h3>
        {tahun && <span className="text-xs text-slate-400">— {tahun}</span>}
      </div>
      <p className="text-sm text-slate-400 text-center py-4">Data satdik belum tersedia</p>
    </div>
  );

  const totalSekolah = isTahun25 ? (labelStats?.total ?? 0) : (trenStats?.total ?? 0);

  if (isTahun25 && labelStats) {
    const chartData = labelStats.perJenis.map(j => ({
      name: j.jenis.length > 18 ? j.jenis.slice(0, 16) + "…" : j.jenis,
      Baik: j.baik,
      Sedang: j.sedang,
      Kurang: j.kurang,
    }));

    return (
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-2">
          <School size={16} className="text-violet-500" />
          <h3 className="font-semibold text-slate-900">Rekap Capaian Sekolah</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">2025</span>
          <span className="text-xs text-slate-400 ml-1">berdasarkan label dominan per sekolah</span>
          <span className="ml-auto text-xs text-slate-400">{totalSekolah} satuan pendidikan</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1.5" />
            <p className="text-2xl font-black text-emerald-700">{labelStats.sekolahBaik}</p>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">Dominan Baik</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
            <Minus size={20} className="text-amber-400 mx-auto mb-1.5" />
            <p className="text-2xl font-black text-amber-700">{labelStats.sekolahSedang}</p>
            <p className="text-xs font-semibold text-amber-600 mt-0.5">Dominan Sedang</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <XCircle size={20} className="text-red-400 mx-auto mb-1.5" />
            <p className="text-2xl font-black text-red-600">{labelStats.sekolahKurang}</p>
            <p className="text-xs font-semibold text-red-500 mt-0.5">Dominan Kurang</p>
          </div>
        </div>

        {!compact && chartData.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Distribusi Label per Jenis Sekolah</p>
            <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Baik"   fill="#22c55e" radius={[0, 3, 3, 0]} />
                <Bar dataKey="Sedang" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                <Bar dataKey="Kurang" fill="#ef4444" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // Render 2024: tren-based
  const stats = trenStats!;
  const chartData = stats.perJenis.map(j => ({
    name: j.jenis.length > 18 ? j.jenis.slice(0, 16) + "…" : j.jenis,
    Naik: j.naik,
    Turun: j.turun,
    "Tidak Berubah": j.total - j.naik - j.turun,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <School size={16} className="text-blue-500" />
        <h3 className="font-semibold text-slate-900">Rekap Tren Sekolah</h3>
        {tahun && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{tahun}</span>}
        <span className="ml-auto text-xs text-slate-400">{stats.total} satuan pendidikan</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <TrendingUp size={20} className="text-emerald-500 mx-auto mb-1.5" />
          <p className="text-2xl font-black text-emerald-700">{stats.sekolahNaik}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-0.5">Sekolah Meningkat</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
          <Minus size={20} className="text-slate-400 mx-auto mb-1.5" />
          <p className="text-2xl font-black text-slate-600">{stats.sekolahStabil}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Tidak Berubah</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <TrendingDown size={20} className="text-red-400 mx-auto mb-1.5" />
          <p className="text-2xl font-black text-red-600">{stats.sekolahTurun}</p>
          <p className="text-xs font-semibold text-red-500 mt-0.5">Sekolah Menurun</p>
        </div>
      </div>
    </div>
  );
}