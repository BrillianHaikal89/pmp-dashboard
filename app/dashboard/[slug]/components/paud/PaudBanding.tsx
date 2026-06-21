// components/paud/PaudBanding.tsx
//
// Komponen perbandingan PAUD yang sederhana - hanya menampilkan 3 indikator:
// D2, D3, dan E6 dengan perbandingan tahun 2024 vs 2025
//
import { Fragment, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Minus, GitCompare, TrendingUp, TrendingDown, Minus as MinusIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

// ── Tipe data ──────────────────────────────────────────────────────────────────
export interface PaudRow {
  npsn: string;
  nama: string;
  jenis: string;
  status: string;
  kabkot?: string;
  kecamatan: string;

  // Hanya 3 indikator yang ditampilkan: D2, D3, E6
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
    nama: "D.2 - Kualitas Pembelajaran",
    perubahanKey: "d2_perubahan",
    nilaiKey: "d2_perubahan_nilai_num",
    tahunLabel: "2024",
    tahunPerubahan: "2025"
  },
  {
    key: "label_d3",
    code: "D3",
    nama: "D.3 - Kualitas Guru",
    perubahanKey: "d3_perubahan",
    nilaiKey: "d3_perubahan_nilai_num",
    tahunLabel: "2024",
    tahunPerubahan: "2025"
  },
  {
    key: "label_e6",
    code: "E6",
    nama: "E.6 - Partisipasi Orang Tua",
    perubahanKey: "e6_perubahan",
    nilaiKey: "e6_perubahan_nilai_num",
    tahunLabel: "2024",
    tahunPerubahan: "2025"
  },
] as const;

// ── Helper Components ──────────────────────────────────────────────────────

// Badge untuk menampilkan label capaian
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

// Chip untuk menampilkan tren perubahan
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

// Menentukan tren keseluruhan per sekolah
function getOverallTrend(row: PaudRow): "naik" | "turun" | "tetap" {
  const changes = INDIKATOR.map(ind => row[ind.perubahanKey] as string | undefined);

  // Prioritaskan Naik > Turun > Tetap
  if (changes.some(v => v === "Naik")) return "naik";
  if (changes.some(v => v === "Turun")) return "turun";
  return "tetap";
}

// ── Komponen Utama ────────────────────────────────────────────────────────────
export function PaudBanding({ data = [], tahun }: { data: PaudRow[]; tahun: string }) {
  const [filterKec, setFilterKec] = useState("Semua");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter data
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

  // Paginasi
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Statistik
  const stats = {
    meningkat: filteredData.filter(r => getOverallTrend(r) === "naik").length,
    menurun: filteredData.filter(r => getOverallTrend(r) === "turun").length,
    tetap: filteredData.filter(r => getOverallTrend(r) === "tetap").length,
  };

  // Data untuk chart
  const chartData = INDIKATOR.map(ind => ({
    name: ind.code,
    baik: filteredData.filter(d => d[ind.key] === "Baik").length,
    sedang: filteredData.filter(d => d[ind.key] === "Sedang").length,
    kurang: filteredData.filter(d => d[ind.key] === "Kurang").length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              📊 Perbandingan Capaian PAUD
            </h1>
            <p className="text-black text-sm mt-1">
              {tahun} — Membandingkan capaian <span className="font-semibold">2024</span> dengan <span className="font-semibold">2025</span>
            </p>
            <p className="text-xs text-black/60 mt-1">
              Berdasarkan 3 indikator utama: D2, D3, dan E6
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-black bg-white px-3 py-1.5 rounded-full border border-gray-200">
              📌 {filteredData.length} satuan PAUD
            </span>
          </div>
        </div>
      </div>

      {/* Ringkasan Tren */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <TrendingUp size={28} className="text-green-600 mx-auto mb-1.5" />
          <p className="text-3xl font-bold text-green-700">{stats.meningkat}</p>
          <p className="text-xs font-medium text-green-600">Meningkat</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <MinusIcon size={28} className="text-gray-400 mx-auto mb-1.5" />
          <p className="text-3xl font-bold text-gray-600">{stats.tetap}</p>
          <p className="text-xs font-medium text-gray-500">Tidak Berubah</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <TrendingDown size={28} className="text-red-500 mx-auto mb-1.5" />
          <p className="text-3xl font-bold text-red-600">{stats.menurun}</p>
          <p className="text-xs font-medium text-red-500">Menurun</p>
        </div>
      </div>

      {/* Chart Distribusi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <GitCompare size={16} className="text-rose-500" />
          Distribusi Capaian 3 Indikator (Tahun 2024)
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-4">
          Jumlah satuan PAUD berdasarkan level capaian di tahun 2024
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="baik" name="Baik" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sedang" name="Sedang" fill="#eab308" radius={[4, 4, 0, 0]} />
            <Bar dataKey="kurang" name="Kurang" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter & Pencarian */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-white"
                  placeholder="Cari NPSN, Nama, atau Kecamatan..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              value={filterKec}
              onChange={e => { setFilterKec(e.target.value); setPage(1); }}
            >
              {kecamatanOptions.map(k => (
                <option key={k} className="text-gray-800">{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-gray-500">NPSN</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-gray-500">Nama Sekolah</th>
                <th rowSpan={2} className="text-left py-3 px-3 text-xs font-bold text-gray-500">Kecamatan</th>
                {INDIKATOR.map(ind => (
                  <th key={ind.code} colSpan={2} className="text-center py-2 px-3 text-xs font-bold text-rose-600 border-l border-gray-100">
                    {ind.code}
                    <span className="block text-[9px] font-normal text-gray-400">
                      {ind.tahunLabel} → {ind.tahunPerubahan}
                    </span>
                  </th>
                ))}
                <th rowSpan={2} className="text-center py-3 px-3 text-xs font-bold text-rose-500 border-l border-gray-100">
                  Tren<br />
                  <span className="font-normal text-gray-400">Keseluruhan</span>
                </th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                {INDIKATOR.map(ind => (
                  <Fragment key={ind.code}>
                    <th className="text-center py-1.5 px-2 text-[9px] font-medium text-gray-400 border-l border-gray-100">
                      Capaian ({ind.tahunLabel})
                    </th>
                    <th className="text-center py-1.5 px-2 text-[9px] font-medium text-gray-400">
                      Perubahan ({ind.tahunPerubahan})
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
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs text-gray-400">{row.npsn}</td>
                      <td className="py-2.5 px-3 text-xs font-semibold text-gray-800 max-w-[150px] truncate" title={row.nama}>
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

        {/* Paginasi */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            Halaman {page} dari {totalPages} · {filteredData.length} data
          </p>
          <div className="flex gap-1.5">
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

      {/* Footer / Legend */}
      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>💡 <span className="font-medium">D2</span> = Kualitas Pembelajaran · <span className="font-medium">D3</span> = Kualitas Guru · <span className="font-medium">E6</span> = Partisipasi Orang Tua</p>
        <p>⬆ Naik · ⬇ Turun · ➡ Tetap</p>
      </div>
    </div>
  );
}