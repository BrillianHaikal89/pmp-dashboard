/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { SatdikRow } from "../../types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  AlertCircle,
  HelpCircle,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChartPie,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  CAPAIAN_LABELS,
  CAPAIAN_ORDER,
  CHANGE_LABELS,
  CHANGE_ORDER,
  INDICATOR_ACTIVE_COLORS,
  INDICATOR_CODES,
  INDICATOR_COLORS,
  INDICATOR_NAMES,
} from "../../utils/satdikConstants";
import {
  downloadChartAsPNG,
  getCapaiCategory,
  getChangeCategory,
} from "../../utils/satdikHelpers";
import { MultiSelectFilter, SearchInput, SelectFilter } from "./single/Filters";
import { Pagination } from "./single/Pagination";
import { SimplePieChart } from "./single/SimplePieChart";
import {
  DrillDownTarget,
  SekolahPerKategoriModal,
} from "./single/SekolahPerKategoriModal";
import { DetailSekolahModal } from "./single/DetailSekolahModal";

// ── Main Component ─────────────────────────────────────────
export function SatdikSingle({
  data,
  tahun,
}: {
  data: SatdikRow[];
  tahun: string;
}) {
  const [filterKode, setFilterKode] = useState("Semua");
  // Filter untuk rekap (multi-select)
  const [filterJenisSatuan, setFilterJenisSatuan] = useState<string[]>([
    "Semua",
  ]);
  const [filterStatusSatuan, setFilterStatusSatuan] = useState<string[]>([
    "Semua",
  ]);
  const [filterKecamatan, setFilterKecamatan] = useState<string[]>(["Semua"]);
  const [viewMode, setViewMode] = useState<"data" | "chart">("data");

  // Filter untuk daftar sekolah (multi-select)
  const [sekolahFilterJenis, setSekolahFilterJenis] = useState<string[]>([
    "Semua",
  ]);
  const [sekolahFilterStatus, setSekolahFilterStatus] = useState<string[]>([
    "Semua",
  ]);
  const [sekolahFilterKecamatan, setSekolahFilterKecamatan] = useState<
    string[]
  >(["Semua"]);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state — detail sekolah
  const [selectedSekolah, setSelectedSekolah] = useState<SatdikRow | null>(
    null,
  );

  // ── NEW: drill-down modal state ──
  const [drillDownTarget, setDrillDownTarget] =
    useState<DrillDownTarget | null>(null);

  // Handler: klik card → buka modal daftar sekolah per kategori
  const handleCardClick = (
    indikatorKode: string,
    kategori: string,
    tipe: "perubahan" | "capaian",
  ) => {
    setDrillDownTarget({ indikatorKode, kategori, tipe });
  };

  // Handler: dari modal drill-down → buka detail sekolah
  // Menutup drill-down dulu lalu buka detail (z-index bertingkat)
  const handleDetailFromDrillDown = (sekolah: SatdikRow) => {
    setSelectedSekolah(sekolah);
  };

  // ========== AMBIL NILAI UNIK UNTUK FILTER REKAP ==========
  const uniqueJenisSatuan = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      if (r.jenis) s.add(r.jenis);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [data]);

  const uniqueStatusSatuan = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      if (r.status) s.add(r.status);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [data]);

  const uniqueKecamatan = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      if (r.kecamatan) s.add(r.kecamatan);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [data]);

  // Opsi unik untuk filter sekolah (multi-select)
  const sekolahUniqueJenis = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      if (r.jenis) s.add(r.jenis);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [data]);

  const sekolahUniqueStatus = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      if (r.status) s.add(r.status);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [data]);

  const sekolahUniqueKecamatan = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      if (r.kecamatan) s.add(r.kecamatan);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [data]);

  // Filter data untuk rekap (dari filter atas) - multi-select
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filter Jenis Satuan (multi-select)
      if (
        !filterJenisSatuan.includes("Semua") &&
        filterJenisSatuan.length > 0
      ) {
        if (!row.jenis || !filterJenisSatuan.includes(row.jenis)) return false;
      }
      // Filter Status Satuan (multi-select)
      if (
        !filterStatusSatuan.includes("Semua") &&
        filterStatusSatuan.length > 0
      ) {
        if (!row.status || !filterStatusSatuan.includes(row.status))
          return false;
      }
      // Filter Kecamatan (multi-select)
      if (!filterKecamatan.includes("Semua") && filterKecamatan.length > 0) {
        if (!row.kecamatan || !filterKecamatan.includes(row.kecamatan))
          return false;
      }
      return true;
    });
  }, [data, filterJenisSatuan, filterStatusSatuan, filterKecamatan]);

  // Filter data untuk daftar sekolah (multi-select)
  const filteredSekolahData = useMemo(() => {
    return data.filter((row) => {
      if (
        !sekolahFilterJenis.includes("Semua") &&
        sekolahFilterJenis.length > 0
      ) {
        if (!row.jenis || !sekolahFilterJenis.includes(row.jenis)) return false;
      }
      if (
        !sekolahFilterStatus.includes("Semua") &&
        sekolahFilterStatus.length > 0
      ) {
        if (!row.status || !sekolahFilterStatus.includes(row.status))
          return false;
      }
      if (
        !sekolahFilterKecamatan.includes("Semua") &&
        sekolahFilterKecamatan.length > 0
      ) {
        if (!row.kecamatan || !sekolahFilterKecamatan.includes(row.kecamatan))
          return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const namaMatch = row.nama?.toLowerCase().includes(query) || false;
        const npsnMatch = row.npsn?.toLowerCase().includes(query) || false;
        if (!namaMatch && !npsnMatch) return false;
      }
      return true;
    });
  }, [
    data,
    sekolahFilterJenis,
    sekolahFilterStatus,
    sekolahFilterKecamatan,
    searchQuery,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSekolahData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSekolahData.slice(start, end);
  }, [filteredSekolahData, currentPage, itemsPerPage]);

  const hasSekolahFilters =
    !sekolahFilterJenis.includes("Semua") ||
    !sekolahFilterStatus.includes("Semua") ||
    !sekolahFilterKecamatan.includes("Semua") ||
    searchQuery !== "";

  const resetSekolahFilters = () => {
    setSekolahFilterJenis(["Semua"]);
    setSekolahFilterStatus(["Semua"]);
    setSekolahFilterKecamatan(["Semua"]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !filterJenisSatuan.includes("Semua") ||
    !filterStatusSatuan.includes("Semua") ||
    !filterKecamatan.includes("Semua") ||
    filterKode !== "Semua";

  const resetFilters = () => {
    setFilterJenisSatuan(["Semua"]);
    setFilterStatusSatuan(["Semua"]);
    setFilterKecamatan(["Semua"]);
    setFilterKode("Semua");
  };

  function downloadToExcel({
    data,
    tahun,
    filterInfo = "",
  }: {
    data: any[];
    tahun: string;
    filterInfo?: string;
  }) {
    if (!data || data.length === 0) return;

    const f = (row: any, ...keys: string[]): string => {
      for (const k of keys) {
        const v = row[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "-";
    };

    const getIndikator = (row: any): any[] =>
      row.indikator_prioritas ?? row.indikator ?? [];

    const indikatorMap = new Map<
      string,
      { kode: string; nama: string; subIndikator: Map<string, string> }
    >();

    data.forEach((row) => {
      getIndikator(row).forEach((ind: any) => {
        if (!indikatorMap.has(ind.kode)) {
          indikatorMap.set(ind.kode, {
            kode: ind.kode,
            nama: ind.nama || ind.kode,
            subIndikator: new Map(),
          });
        }
        const entry = indikatorMap.get(ind.kode)!;
        (ind.sub_indikator || []).forEach((sub: any) => {
          const subKey = sub.nama || sub.kode || sub.label;
          if (subKey && !entry.subIndikator.has(subKey)) {
            entry.subIndikator.set(subKey, subKey);
          }
        });
      });
    });

    const FIXED_COLS = [
      "NPSN",
      "Nama Satuan Pendidikan",
      "Jenis Satuan Pendidikan",
      "Status Satuan Pendidikan",
      "Kabupaten/Kota",
      "Kecamatan",
    ];
    const N_FIXED = FIXED_COLS.length;

    const MAIN_SUB_COLS = [
      "Label Capaian",
      "Perubahan dari Tahun Lalu",
      "Perubahan Nilai",
      "Peringkat di Kab./Kota",
    ];

    const row0: string[] = [...FIXED_COLS];
    const row1: string[] = [...FIXED_COLS];
    const row2: string[] = [...FIXED_COLS];

    interface ColInfo {
      indKode: string;
      type:
        | "label"
        | "perubahan_lalu"
        | "perubahan_nilai"
        | "peringkat"
        | "sub";
      subNama?: string;
    }
    const colInfos: (ColInfo | null)[] = Array(N_FIXED).fill(null);

    indikatorMap.forEach((ind) => {
      const subKeys = Array.from(ind.subIndikator.keys());
      const totalCols = MAIN_SUB_COLS.length + subKeys.length;

      for (let i = 0; i < totalCols; i++) {
        row0.push(i === 0 ? ind.kode : "");
      }

      MAIN_SUB_COLS.forEach((subCol, i) => {
        row1.push(ind.nama);
        row2.push(subCol);
        colInfos.push({
          indKode: ind.kode,
          type: (
            ["label", "perubahan_lalu", "perubahan_nilai", "peringkat"] as const
          )[i],
        });
      });

      subKeys.forEach((subNama) => {
        row1.push(subNama);
        row2.push("Perubahan Nilai Capaian dari Tahun Lalu");
        colInfos.push({ indKode: ind.kode, type: "sub", subNama });
      });
    });

    const dataRows: any[][] = data.map((row) => {
      const cells: any[] = [
        f(row, "npsn"),
        f(row, "nama_satuan_pendidikan", "nama"),
        f(row, "jenis_satuan_pendidikan", "jenis"),
        f(row, "status_satuan_pendidikan", "status"),
        f(row, "kabupaten_kota", "kabkot"),
        f(row, "kecamatan"),
      ];

      const indLookup = new Map<string, any>();
      getIndikator(row).forEach((ind: any) => indLookup.set(ind.kode, ind));

      for (let ci = N_FIXED; ci < colInfos.length; ci++) {
        const info = colInfos[ci];
        if (!info) {
          cells.push("-");
          continue;
        }

        const ind = indLookup.get(info.indKode);
        if (!ind) {
          cells.push("-");
          continue;
        }

        switch (info.type) {
          case "label":
            cells.push(ind.label_capaian || "-");
            break;
          case "perubahan_lalu":
            cells.push(ind.perubahan || "-");
            break;
          case "perubahan_nilai":
            cells.push(ind.nilai || "-");
            break;
          case "peringkat":
            cells.push(ind.peringkat || "-");
            break;
          case "sub": {
            const sub = (ind.sub_indikator || []).find(
              (s: any) =>
                s.nama === info.subNama ||
                s.kode === info.subNama ||
                s.label === info.subNama,
            );
            cells.push(sub?.perubahan_nilai || "-");
            break;
          }
          default:
            cells.push("-");
        }
      }

      return cells;
    });

    const sheetData = [row0, row1, row2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    const merges: XLSX.Range[] = [];
    for (let c = 0; c < N_FIXED; c++) {
      merges.push({ s: { r: 0, c }, e: { r: 2, c } });
    }

    let col = N_FIXED;
    indikatorMap.forEach((ind) => {
      const subKeys = Array.from(ind.subIndikator.keys());
      const totalCols = MAIN_SUB_COLS.length + subKeys.length;

      if (totalCols > 1) {
        merges.push({
          s: { r: 0, c: col },
          e: { r: 0, c: col + totalCols - 1 },
        });
      }
      if (MAIN_SUB_COLS.length > 1) {
        merges.push({
          s: { r: 1, c: col },
          e: { r: 1, c: col + MAIN_SUB_COLS.length - 1 },
        });
      }

      col += totalCols;
    });

    ws["!merges"] = merges;

    const colWidths: XLSX.ColInfo[] = [];
    for (let c = 0; c < row2.length; c++) {
      let maxLen = (row2[c] || "").length;
      for (let r = 3; r < sheetData.length; r++) {
        const val = String(sheetData[r][c] || "");
        maxLen = Math.max(maxLen, val.length);
      }
      colWidths.push({ wch: Math.min(maxLen + 2, 45) });
    }
    ws["!cols"] = colWidths;
    ws["!freeze"] = { xSplit: N_FIXED, ySplit: 3 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Capaian Satdik");

    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const filename = `capaian_satdik_${tahun}${filterInfo ? `_${filterInfo}` : ""}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  }

  // Summary per indikator untuk perubahan
  const indicatorSummary = useMemo(() => {
    const codes = INDICATOR_CODES.slice(1);
    const map: Record<
      string,
      {
        code: string;
        counts: Record<string, number>;
        details: Record<string, string[]>;
        total: number;
      }
    > = {};
    codes.forEach((code) => {
      map[code.replace(/\s+/g, "").toUpperCase()] = {
        code,
        counts: { Naik: 0, Turun: 0, "Tidak Berubah": 0, "Tidak Tersedia": 0 },
        details: {
          Naik: [],
          Turun: [],
          "Tidak Berubah": [],
          "Tidak Tersedia": [],
        },
        total: 0,
      };
    });
    const normalizedCodes = codes.map((c) =>
      c.replace(/\s+/g, "").toUpperCase(),
    );

    filteredData.forEach((row) => {
      row.indikator_prioritas?.forEach((item) => {
        const kode = item.kode?.trim() ?? "";
        const nk = kode.replace(/\s+/g, "").toUpperCase();
        if (!normalizedCodes.includes(nk)) return;
        const raw = item.perubahan?.trim() ?? "";
        const cat = getChangeCategory(raw);
        const bucket = map[nk];
        if (!bucket) return;
        bucket.counts[cat] = (bucket.counts[cat] ?? 0) + 1;
        if (raw && !bucket.details[cat].includes(raw))
          bucket.details[cat].push(raw);
        bucket.total += 1;
      });
    });
    return Object.values(map);
  }, [filteredData]);

  // Summary per indikator untuk capaian
  const indicatorCapaiSummary = useMemo(() => {
    const codes = INDICATOR_CODES.slice(1);
    const map: Record<
      string,
      {
        code: string;
        counts: Record<string, number>;
        details: Record<string, string[]>;
        total: number;
      }
    > = {};
    codes.forEach((code) => {
      map[code.replace(/\s+/g, "").toUpperCase()] = {
        code,
        counts: { Baik: 0, Sedang: 0, Kurang: 0, "Tidak Tersedia": 0 },
        details: { Baik: [], Sedang: [], Kurang: [], "Tidak Tersedia": [] },
        total: 0,
      };
    });
    const normalizedCodes = codes.map((c) =>
      c.replace(/\s+/g, "").toUpperCase(),
    );

    filteredData.forEach((row) => {
      row.indikator_prioritas?.forEach((item) => {
        const kode = item.kode?.trim() ?? "";
        const nk = kode.replace(/\s+/g, "").toUpperCase();
        if (!normalizedCodes.includes(nk)) return;
        const labelCapaian = item.label_capaian?.trim() ?? "";
        const cat = getCapaiCategory(labelCapaian);
        const bucket = map[nk];
        if (!bucket) return;
        bucket.counts[cat] = (bucket.counts[cat] ?? 0) + 1;
        if (labelCapaian && !bucket.details[cat].includes(labelCapaian))
          bucket.details[cat].push(labelCapaian);
        bucket.total += 1;
      });
    });
    return Object.values(map);
  }, [filteredData]);

  // Summary untuk indikator tertentu (perubahan)
  const filteredSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    const details: Record<string, string[]> = {};
    let total = 0;
    const nf =
      filterKode === "Semua"
        ? "SEMUA"
        : filterKode.replace(/\s+/g, "").toUpperCase();
    CHANGE_ORDER.forEach((cat) => {
      counts[cat] = 0;
      details[cat] = [];
    });

    filteredData.forEach((row) => {
      row.indikator_prioritas?.forEach((item) => {
        const kode = item.kode?.trim() ?? "";
        const nk = kode.replace(/\s+/g, "").toUpperCase();
        if (nf !== "SEMUA" && nk !== nf) return;
        const raw = item.perubahan?.trim() ?? "";
        const cat = getChangeCategory(raw);
        counts[cat] = (counts[cat] ?? 0) + 1;
        if (raw && !details[cat].includes(raw)) details[cat].push(raw);
        total += 1;
      });
    });

    return {
      total,
      entries: CHANGE_ORDER.map(
        (cat) => [cat, counts[cat]] as [string, number],
      ),
      details,
    };
  }, [filteredData, filterKode]);

  // Summary untuk indikator tertentu (capaian)
  const filteredCapaiSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    const details: Record<string, string[]> = {};
    let total = 0;
    const nf =
      filterKode === "Semua"
        ? "SEMUA"
        : filterKode.replace(/\s+/g, "").toUpperCase();
    CAPAIAN_ORDER.forEach((cat) => {
      counts[cat] = 0;
      details[cat] = [];
    });

    filteredData.forEach((row) => {
      row.indikator_prioritas?.forEach((item) => {
        const kode = item.kode?.trim() ?? "";
        const nk = kode.replace(/\s+/g, "").toUpperCase();
        if (nf !== "SEMUA" && nk !== nf) return;
        const labelCapaian = item.label_capaian?.trim() ?? "";
        const cat = getCapaiCategory(labelCapaian);
        counts[cat] = (counts[cat] ?? 0) + 1;
        if (labelCapaian && !details[cat].includes(labelCapaian))
          details[cat].push(labelCapaian);
        total += 1;
      });
    });

    return {
      total,
      entries: CAPAIAN_ORDER.map(
        (cat) => [cat, counts[cat]] as [string, number],
      ),
      details,
    };
  }, [filteredData, filterKode]);

  const grandTotal = indicatorSummary.reduce((s, i) => s + i.total, 0);

  // Prepare data for pie charts
  const pieDataPerubahan = useMemo(() => {
    if (filterKode !== "Semua") {
      return filteredSummary.entries
        .map(([label, count]) => ({
          label: CHANGE_LABELS[label] || label,
          value: count,
        }))
        .filter((d) => d.value > 0);
    }
    const totalCounts = {
      Naik: 0,
      Turun: 0,
      "Tidak Berubah": 0,
      "Tidak Tersedia": 0,
    };
    indicatorSummary.forEach((item) => {
      totalCounts.Naik += item.counts.Naik;
      totalCounts.Turun += item.counts.Turun;
      totalCounts["Tidak Berubah"] += item.counts["Tidak Berubah"];
      totalCounts["Tidak Tersedia"] += item.counts["Tidak Tersedia"];
    });
    return CHANGE_ORDER.map((label) => ({
      label: CHANGE_LABELS[label] || label,
      value: totalCounts[label as keyof typeof totalCounts],
    })).filter((d) => d.value > 0);
  }, [filterKode, filteredSummary, indicatorSummary]);

  const pieDataCapaian = useMemo(() => {
    if (filterKode !== "Semua") {
      return filteredCapaiSummary.entries
        .map(([label, count]) => ({
          label: CAPAIAN_LABELS[label] || label,
          value: count,
        }))
        .filter((d) => d.value > 0);
    }
    const totalCounts = { Baik: 0, Sedang: 0, Kurang: 0, "Tidak Tersedia": 0 };
    indicatorCapaiSummary.forEach((item) => {
      totalCounts.Baik += item.counts.Baik;
      totalCounts.Sedang += item.counts.Sedang;
      totalCounts.Kurang += item.counts.Kurang;
      totalCounts["Tidak Tersedia"] += item.counts["Tidak Tersedia"];
    });
    return CAPAIAN_ORDER.map((label) => ({
      label: CAPAIAN_LABELS[label] || label,
      value: totalCounts[label as keyof typeof totalCounts],
    })).filter((d) => d.value > 0);
  }, [filterKode, filteredCapaiSummary, indicatorCapaiSummary]);

  const pieDataPerIndikatorPerubahan = useMemo(() => {
    return indicatorSummary.map((item) => ({
      code: item.code,
      name: INDICATOR_NAMES[item.code] || item.code,
      total: item.total,
      data: [
        { label: "Naik", value: item.counts.Naik },
        { label: "Turun", value: item.counts.Turun },
        { label: "Stabil", value: item.counts["Tidak Berubah"] },
        { label: "Tidak Tersedia", value: item.counts["Tidak Tersedia"] },
      ].filter((d) => d.value > 0),
    }));
  }, [indicatorSummary]);

  const pieDataPerIndikatorCapaian = useMemo(() => {
    return indicatorCapaiSummary.map((item) => ({
      code: item.code,
      name: INDICATOR_NAMES[item.code] || item.code,
      total: item.total,
      data: [
        { label: "Baik", value: item.counts.Baik },
        { label: "Sedang", value: item.counts.Sedang },
        { label: "Kurang", value: item.counts.Kurang },
        { label: "Tidak Tersedia", value: item.counts["Tidak Tersedia"] },
      ].filter((d) => d.value > 0),
    }));
  }, [indicatorCapaiSummary]);

  const getIcon = (label: string) => {
    switch (label) {
      case "Naik":
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case "Turun":
        return <TrendingDown className="w-5 h-5 text-rose-600" />;
      case "Tidak Berubah":
        return <Minus className="w-5 h-5 text-amber-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getCapaiIcon = (label: string) => {
    switch (label) {
      case "Baik":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Sedang":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "Kurang":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getProgressColor = (label: string) => {
    switch (label) {
      case "Naik":
        return "bg-emerald-500";
      case "Turun":
        return "bg-rose-500";
      case "Tidak Berubah":
        return "bg-amber-500";
      default:
        return "bg-slate-400";
    }
  };

  const getCapaiProgressColor = (label: string) => {
    switch (label) {
      case "Baik":
        return "bg-green-500";
      case "Sedang":
        return "bg-yellow-500";
      case "Kurang":
        return "bg-red-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Capaian Satuan Pendidikan
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Dasmen &amp; Vokasi — Tahun {tahun}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Rekap Perubahan & Capaian Indikator Prioritas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A.1, A.2, A.3, D.1, D.3, D.4, D.8, D.10 — Klik angka pada card
                  untuk melihat daftar sekolah
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("data")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  viewMode === "data"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Tabel Data
              </button>
              <button
                onClick={() => setViewMode("chart")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  viewMode === "chart"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ChartPie className="w-4 h-4" />
                Pie Chart
              </button>
            </div>
          </div>

          {/* ── FILTER SECTION (Rekap) ── */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 mb-5 space-y-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
                Filter Indikator
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INDICATOR_CODES.map((code) => {
                  const isActive = filterKode === code;
                  const activeClass =
                    code === "Semua"
                      ? "bg-slate-700 text-white border-slate-700"
                      : (INDICATOR_ACTIVE_COLORS[code] ??
                        "bg-indigo-500 text-white border-indigo-500");

                  return (
                    <button
                      key={code}
                      onClick={() => setFilterKode(code)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                        ${
                          isActive
                            ? activeClass
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }
                      `}
                    >
                      {code === "Semua" ? (
                        "Semua"
                      ) : (
                        <span className="flex items-center gap-1">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/70" : (INDICATOR_COLORS[code] ?? "bg-slate-400")}`}
                          />
                          {code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {filterKode !== "Semua" && (
                <p className="text-xs text-slate-400 mt-1.5">
                  {filterKode} — {INDICATOR_NAMES[filterKode]}
                </p>
              )}
            </div>

            <div className="border-t border-slate-200" />

            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
                Filter Satuan Pendidikan (Rekap)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MultiSelectFilter
                  label="Jenis Satuan"
                  options={uniqueJenisSatuan}
                  selectedValues={filterJenisSatuan}
                  onChange={setFilterJenisSatuan}
                />
                <MultiSelectFilter
                  label="Status"
                  options={uniqueStatusSatuan}
                  selectedValues={filterStatusSatuan}
                  onChange={setFilterStatusSatuan}
                />
                <MultiSelectFilter
                  label="Kecamatan"
                  options={uniqueKecamatan}
                  selectedValues={filterKecamatan}
                  onChange={setFilterKecamatan}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-700">
                      {filteredData.length}
                    </span>{" "}
                    dari {data.length} sekolah
                  </span>
                  {filterKode !== "Semua" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                      Indikator: {filterKode}
                    </span>
                  )}
                  {!filterJenisSatuan.includes("Semua") &&
                    filterJenisSatuan.map((jenis) => (
                      <span
                        key={jenis}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600"
                      >
                        Jenis: {jenis}
                      </span>
                    ))}
                  {!filterStatusSatuan.includes("Semua") &&
                    filterStatusSatuan.map((status) => (
                      <span
                        key={status}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600"
                      >
                        Status: {status}
                      </span>
                    ))}
                  {!filterKecamatan.includes("Semua") &&
                    filterKecamatan.map((kec) => (
                      <span
                        key={kec}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600"
                      >
                        Kec: {kec}
                      </span>
                    ))}
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors ml-3 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* ── CONTENT BASED ON VIEW MODE ── */}
          {viewMode === "data" ? (
            <>
              {/* ── REKAP PERUBAHAN ── */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Rekap Perubahan (Naik/Turun/Stabil)
                </h3>
                {filterKode === "Semua" ? (
                  grandTotal === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Tidak ada data</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {indicatorSummary.map((item) => {
                        const total = item.total;
                        const naikPct = total
                          ? (item.counts.Naik / total) * 100
                          : 0;
                        const turunPct = total
                          ? (item.counts.Turun / total) * 100
                          : 0;
                        const stabilPct = total
                          ? (item.counts["Tidak Berubah"] / total) * 100
                          : 0;
                        const naPct = total
                          ? (item.counts["Tidak Tersedia"] / total) * 100
                          : 0;
                        const headerColor =
                          INDICATOR_COLORS[item.code] || "bg-slate-500";

                        return (
                          <div
                            key={item.code}
                            className="rounded-xl overflow-hidden border border-slate-200 bg-white"
                          >
                            <div className={`${headerColor} px-4 py-3`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-bold text-white">
                                    {item.code}
                                  </span>
                                  <p className="text-[11px] text-white/80">
                                    {INDICATOR_NAMES[item.code]}
                                  </p>
                                </div>
                                <span className="text-[11px] font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                                  {total}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              {/* ── Mini stat cells — klik untuk drill-down ── */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  {
                                    key: "Naik",
                                    pct: naikPct,
                                    count: item.counts.Naik,
                                    bg: "bg-emerald-50",
                                    text: "text-emerald-600",
                                    label: "Naik",
                                  },
                                  {
                                    key: "Turun",
                                    pct: turunPct,
                                    count: item.counts.Turun,
                                    bg: "bg-rose-50",
                                    text: "text-rose-600",
                                    label: "Turun",
                                  },
                                  {
                                    key: "Tidak Berubah",
                                    pct: stabilPct,
                                    count: item.counts["Tidak Berubah"],
                                    bg: "bg-amber-50",
                                    text: "text-amber-600",
                                    label: "Stabil",
                                  },
                                  {
                                    key: "Tidak Tersedia",
                                    pct: naPct,
                                    count: item.counts["Tidak Tersedia"],
                                    bg: "bg-slate-100",
                                    text: "text-slate-500",
                                    label: "N/A",
                                  },
                                ].map(
                                  ({ key, pct, count, bg, text, label }) => (
                                    <button
                                      key={key}
                                      onClick={() =>
                                        count > 0 &&
                                        handleCardClick(
                                          item.code,
                                          key,
                                          "perubahan",
                                        )
                                      }
                                      disabled={count === 0}
                                      title={
                                        count > 0
                                          ? `Lihat ${count} sekolah`
                                          : undefined
                                      }
                                      className={`
                                      text-center p-2 rounded-lg ${bg}
                                      transition-all
                                      ${
                                        count > 0
                                          ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-400 hover:brightness-95"
                                          : "cursor-default opacity-60"
                                      }
                                    `}
                                    >
                                      <div
                                        className={`text-lg font-bold ${text}`}
                                      >
                                        {pct.toFixed(0)}%
                                      </div>
                                      <div className={`text-[10px] ${text}`}>
                                        {label}
                                      </div>
                                      <div
                                        className={`text-[10px] ${text} flex items-center justify-center gap-0.5`}
                                      >
                                        {count}
                                        {count > 0 && (
                                          <Eye className="w-2.5 h-2.5 opacity-60" />
                                        )}
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                              <div className="flex h-1.5 rounded-full overflow-hidden mt-3">
                                <div
                                  className="bg-emerald-500"
                                  style={{ width: `${naikPct}%` }}
                                />
                                <div
                                  className="bg-rose-500"
                                  style={{ width: `${turunPct}%` }}
                                />
                                <div
                                  className="bg-amber-500"
                                  style={{ width: `${stabilPct}%` }}
                                />
                                <div
                                  className="bg-slate-400"
                                  style={{ width: `${naPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredSummary.entries.map(([label, count]) => {
                      const pct =
                        filteredSummary.total > 0
                          ? (count / filteredSummary.total) * 100
                          : 0;
                      return (
                        <button
                          key={label}
                          onClick={() =>
                            count > 0 &&
                            handleCardClick(filterKode, label, "perubahan")
                          }
                          disabled={count === 0}
                          className={`
                            rounded-xl border border-slate-200 bg-white p-4 text-left
                            transition-all
                            ${
                              count > 0
                                ? "cursor-pointer hover:shadow-md hover:border-indigo-200"
                                : "cursor-default opacity-60"
                            }
                          `}
                        >
                          <div className="flex justify-between items-center mb-2">
                            {getIcon(label)}
                            <div className="flex items-center gap-1">
                              {count > 0 && (
                                <Eye className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              <span className="text-xl font-bold text-slate-900">
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {CHANGE_LABELS[label]}
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {count}
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressColor(label)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {count > 0 && (
                            <div className="mt-2 text-[10px] text-indigo-400 font-medium">
                              Klik untuk lihat daftar sekolah →
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── REKAP CAPAIAN ── */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Rekap Capaian (Baik/Sedang/Kurang)
                </h3>
                {filterKode === "Semua" ? (
                  indicatorCapaiSummary.reduce((s, i) => s + i.total, 0) ===
                  0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Tidak ada data</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {indicatorCapaiSummary.map((item) => {
                        const total = item.total;
                        const baikPct = total
                          ? (item.counts.Baik / total) * 100
                          : 0;
                        const sedangPct = total
                          ? (item.counts.Sedang / total) * 100
                          : 0;
                        const kurangPct = total
                          ? (item.counts.Kurang / total) * 100
                          : 0;
                        const naPct = total
                          ? (item.counts["Tidak Tersedia"] / total) * 100
                          : 0;
                        const headerColor =
                          INDICATOR_COLORS[item.code] || "bg-slate-500";

                        return (
                          <div
                            key={item.code}
                            className="rounded-xl overflow-hidden border border-slate-200 bg-white"
                          >
                            <div className={`${headerColor} px-4 py-3`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-bold text-white">
                                    {item.code}
                                  </span>
                                  <p className="text-[11px] text-white/80">
                                    {INDICATOR_NAMES[item.code]}
                                  </p>
                                </div>
                                <span className="text-[11px] font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                                  {total}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              {/* ── Mini stat cells — klik untuk drill-down ── */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  {
                                    key: "Baik",
                                    pct: baikPct,
                                    count: item.counts.Baik,
                                    bg: "bg-green-50",
                                    text: "text-green-600",
                                    label: "Baik",
                                  },
                                  {
                                    key: "Sedang",
                                    pct: sedangPct,
                                    count: item.counts.Sedang,
                                    bg: "bg-yellow-50",
                                    text: "text-yellow-600",
                                    label: "Sedang",
                                  },
                                  {
                                    key: "Kurang",
                                    pct: kurangPct,
                                    count: item.counts.Kurang,
                                    bg: "bg-red-50",
                                    text: "text-red-600",
                                    label: "Kurang",
                                  },
                                  {
                                    key: "Tidak Tersedia",
                                    pct: naPct,
                                    count: item.counts["Tidak Tersedia"],
                                    bg: "bg-slate-100",
                                    text: "text-slate-500",
                                    label: "N/A",
                                  },
                                ].map(
                                  ({ key, pct, count, bg, text, label }) => (
                                    <button
                                      key={key}
                                      onClick={() =>
                                        count > 0 &&
                                        handleCardClick(
                                          item.code,
                                          key,
                                          "capaian",
                                        )
                                      }
                                      disabled={count === 0}
                                      title={
                                        count > 0
                                          ? `Lihat ${count} sekolah`
                                          : undefined
                                      }
                                      className={`
                                      text-center p-2 rounded-lg ${bg}
                                      transition-all
                                      ${
                                        count > 0
                                          ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-400 hover:brightness-95"
                                          : "cursor-default opacity-60"
                                      }
                                    `}
                                    >
                                      <div
                                        className={`text-lg font-bold ${text}`}
                                      >
                                        {pct.toFixed(0)}%
                                      </div>
                                      <div className={`text-[10px] ${text}`}>
                                        {label}
                                      </div>
                                      <div
                                        className={`text-[10px] ${text} flex items-center justify-center gap-0.5`}
                                      >
                                        {count}
                                        {count > 0 && (
                                          <Eye className="w-2.5 h-2.5 opacity-60" />
                                        )}
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                              <div className="flex h-1.5 rounded-full overflow-hidden mt-3">
                                <div
                                  className="bg-green-500"
                                  style={{ width: `${baikPct}%` }}
                                />
                                <div
                                  className="bg-yellow-500"
                                  style={{ width: `${sedangPct}%` }}
                                />
                                <div
                                  className="bg-red-500"
                                  style={{ width: `${kurangPct}%` }}
                                />
                                <div
                                  className="bg-slate-400"
                                  style={{ width: `${naPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredCapaiSummary.entries.map(([label, count]) => {
                      const pct =
                        filteredCapaiSummary.total > 0
                          ? (count / filteredCapaiSummary.total) * 100
                          : 0;
                      return (
                        <button
                          key={label}
                          onClick={() =>
                            count > 0 &&
                            handleCardClick(filterKode, label, "capaian")
                          }
                          disabled={count === 0}
                          className={`
                            rounded-xl border border-slate-200 bg-white p-4 text-left
                            transition-all
                            ${
                              count > 0
                                ? "cursor-pointer hover:shadow-md hover:border-indigo-200"
                                : "cursor-default opacity-60"
                            }
                          `}
                        >
                          <div className="flex justify-between items-center mb-2">
                            {getCapaiIcon(label)}
                            <div className="flex items-center gap-1">
                              {count > 0 && (
                                <Eye className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              <span className="text-xl font-bold text-slate-900">
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {CAPAIAN_LABELS[label]}
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {count}
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getCapaiProgressColor(label)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {count > 0 && (
                            <div className="mt-2 text-[10px] text-indigo-400 font-medium">
                              Klik untuk lihat daftar sekolah →
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Visualisasi Perubahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterKode !== "Semua" ? (
                    <SimplePieChart
                      data={pieDataPerubahan}
                      title={`${filterKode} - ${INDICATOR_NAMES[filterKode]}`}
                      chartId="pie-perubahan-single"
                      onDownload={() =>
                        downloadChartAsPNG(
                          "pie-perubahan-single",
                          `perubahan_${filterKode}_${tahun}`,
                        )
                      }
                    />
                  ) : (
                    pieDataPerIndikatorPerubahan.map((item, idx) => (
                      <SimplePieChart
                        key={idx}
                        data={item.data}
                        title={`${item.code} - ${item.name}`}
                        chartId={`pie-perubahan-${item.code}`}
                        onDownload={() =>
                          downloadChartAsPNG(
                            `pie-perubahan-${item.code}`,
                            `perubahan_${item.code}_${tahun}`,
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Visualisasi Capaian
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterKode !== "Semua" ? (
                    <SimplePieChart
                      data={pieDataCapaian}
                      title={`${filterKode} - ${INDICATOR_NAMES[filterKode]}`}
                      chartId="pie-capaian-single"
                      onDownload={() =>
                        downloadChartAsPNG(
                          "pie-capaian-single",
                          `capaian_${filterKode}_${tahun}`,
                        )
                      }
                    />
                  ) : (
                    pieDataPerIndikatorCapaian.map((item, idx) => (
                      <SimplePieChart
                        key={idx}
                        data={item.data}
                        title={`${item.code} - ${item.name}`}
                        chartId={`pie-capaian-${item.code}`}
                        onDownload={() =>
                          downloadChartAsPNG(
                            `pie-capaian-${item.code}`,
                            `capaian_${item.code}_${tahun}`,
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── DAFTAR SEKOLAH DENGAN FILTER TERPISAH ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              Daftar Sekolah
            </h3>
            <div className="flex items-center gap-2">
              {filteredSekolahData.length > 0 && (
                <button
                  onClick={() =>
                    downloadToExcel({
                      data: filteredSekolahData,
                      tahun,
                      filterInfo: sekolahFilterKecamatan.includes("Semua")
                        ? ""
                        : sekolahFilterKecamatan.join("_"),
                    })
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Excel
                </button>
              )}
              {hasSekolahFilters && (
                <button
                  onClick={resetSekolahFilters}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Filter Sekolah
                </button>
              )}
            </div>
          </div>

          {/* Filter Section untuk Daftar Sekolah (Multi-Select) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 mb-5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
              Filter Daftar Sekolah (bisa pilih lebih dari satu)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <MultiSelectFilter
                label="Jenis Satuan"
                options={sekolahUniqueJenis}
                selectedValues={sekolahFilterJenis}
                onChange={(values) => {
                  setSekolahFilterJenis(values);
                  setCurrentPage(1);
                }}
              />
              <MultiSelectFilter
                label="Status"
                options={sekolahUniqueStatus}
                selectedValues={sekolahFilterStatus}
                onChange={(values) => {
                  setSekolahFilterStatus(values);
                  setCurrentPage(1);
                }}
              />
              <MultiSelectFilter
                label="Kecamatan"
                options={sekolahUniqueKecamatan}
                selectedValues={sekolahFilterKecamatan}
                onChange={(values) => {
                  setSekolahFilterKecamatan(values);
                  setCurrentPage(1);
                }}
              />
              <SearchInput
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Nama atau NPSN..."
              />
            </div>
          </div>

          {/* Tabel / List Sekolah */}
          {filteredSekolahData.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Tidak ada data sekolah yang sesuai dengan filter
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 text-xs font-semibold text-slate-500">
                        NPSN
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-500">
                        Nama Sekolah
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-500">
                        Jenis
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-500">
                        Status
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-500">
                        Kecamatan
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 text-slate-600 font-mono text-xs">
                          {row.npsn || "-"}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {row.nama || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {row.jenis || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {row.status || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {row.kecamatan || "-"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedSekolah(row)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}

          <div className="mt-4 text-xs text-slate-400">
            Menampilkan {paginatedData.length} dari {filteredSekolahData.length}{" "}
            sekolah
          </div>
        </div>
      </div>

      {/* ── DRILL-DOWN MODAL: Daftar Sekolah per Kategori ── */}
      {drillDownTarget && (
        <SekolahPerKategoriModal
          target={drillDownTarget}
          allData={filteredData}
          onClose={() => setDrillDownTarget(null)}
          onDetailSekolah={handleDetailFromDrillDown}
          tahun={tahun}
        />
      )}

      {/* ── DETAIL SEKOLAH MODAL ── */}
      {selectedSekolah && (
        <DetailSekolahModal
          sekolah={selectedSekolah}
          onClose={() => setSelectedSekolah(null)}
        />
      )}
    </div>
  );
}
