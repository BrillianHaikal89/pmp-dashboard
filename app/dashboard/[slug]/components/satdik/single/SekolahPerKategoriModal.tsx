/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { AlertCircle, Eye, FileSpreadsheet, Filter, Users, X } from "lucide-react";
import * as XLSX from "xlsx";
import { SatdikRow } from "../../../types";
import { CAPAIAN_LABELS, CHANGE_LABELS, INDICATOR_COLORS, INDICATOR_NAMES } from "../../../utils/satdikConstants";
import { getCapaiCategory, getChangeCategory } from "../../../utils/satdikHelpers";
import { Pagination } from "./Pagination";
import { SearchInput, SelectFilter } from "./Filters";
// ── Modal Daftar Sekolah per Kategori ────────────────────────
// Ditampilkan saat user klik card indikator (rekap perubahan / capaian)
export type DrillDownTarget = {
  indikatorKode: string; // e.g. "A.1"
  kategori: string; // e.g. "Naik" | "Baik"
  tipe: "perubahan" | "capaian"; // menentukan field yang dicek
};

export function SekolahPerKategoriModal({
  target,
  allData,
  onClose,
  onDetailSekolah,
  tahun,
}: {
  target: DrillDownTarget;
  allData: SatdikRow[];
  onClose: () => void;
  onDetailSekolah: (sekolah: SatdikRow) => void;
  tahun: string;
}) {
  // Filter state
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sekolah yang cocok dengan indikator + kategori ini
  const matchedSekolah = useMemo(() => {
    return allData.filter((row) => {
      const ind = row.indikator_prioritas?.find(
        (i) => i.kode?.trim() === target.indikatorKode,
      );
      if (!ind) return false;

      if (target.tipe === "perubahan") {
        return (
          getChangeCategory(ind.perubahan?.trim() ?? "") === target.kategori
        );
      } else {
        return (
          getCapaiCategory(ind.label_capaian?.trim() ?? "") === target.kategori
        );
      }
    });
  }, [allData, target]);

  // Unique options untuk filter
  const uniqueJenis = useMemo(() => {
    const s = new Set<string>();
    matchedSekolah.forEach((r) => {
      if (r.jenis) s.add(r.jenis);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [matchedSekolah]);

  const uniqueStatus = useMemo(() => {
    const s = new Set<string>();
    matchedSekolah.forEach((r) => {
      if (r.status) s.add(r.status);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [matchedSekolah]);

  const uniqueKecamatan = useMemo(() => {
    const s = new Set<string>();
    matchedSekolah.forEach((r) => {
      if (r.kecamatan) s.add(r.kecamatan);
    });
    return ["Semua", ...Array.from(s).sort()];
  }, [matchedSekolah]);

  // Filtered + searched
  const filteredSekolah = useMemo(() => {
    return matchedSekolah.filter((row) => {
      if (filterJenis !== "Semua" && row.jenis !== filterJenis) return false;
      if (filterStatus !== "Semua" && row.status !== filterStatus) return false;
      if (filterKecamatan !== "Semua" && row.kecamatan !== filterKecamatan)
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !row.nama?.toLowerCase().includes(q) &&
          !row.npsn?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [matchedSekolah, filterJenis, filterStatus, filterKecamatan, searchQuery]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSekolah.length / itemsPerPage),
  );
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSekolah.slice(start, start + itemsPerPage);
  }, [filteredSekolah, currentPage, itemsPerPage]);

  const hasFilters =
    filterJenis !== "Semua" ||
    filterStatus !== "Semua" ||
    filterKecamatan !== "Semua" ||
    searchQuery !== "";

  const resetFilters = () => {
    setFilterJenis("Semua");
    setFilterStatus("Semua");
    setFilterKecamatan("Semua");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Fungsi untuk download Excel dari modal dengan data lengkap indikator
  const downloadModalToExcel = () => {
    if (filteredSekolah.length === 0) return;

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

    // Kumpulkan semua indikator yang ada
    const indikatorMap = new Map<
      string,
      { kode: string; nama: string; subIndikator: Map<string, string> }
    >();

    filteredSekolah.forEach((row) => {
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

    const dataRows: any[][] = filteredSekolah.map((row) => {
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
    const sheetName = `${target.indikatorKode}_${target.kategori}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const filename = `Rekap Capaian_${INDICATOR_NAMES[target.indikatorKode]}_Capaian ${target.kategori}_Tahun ${tahun}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const headerColor = INDICATOR_COLORS[target.indikatorKode] || "bg-slate-500";

  const categoryLabel =
    target.tipe === "perubahan"
      ? (CHANGE_LABELS[target.kategori] ?? target.kategori)
      : (CAPAIAN_LABELS[target.kategori] ?? target.kategori);

  const getCategoryBadgeColor = () => {
    if (target.tipe === "perubahan") {
      switch (target.kategori) {
        case "Naik":
          return "bg-emerald-100 text-emerald-700";
        case "Turun":
          return "bg-rose-100 text-rose-700";
        case "Tidak Berubah":
          return "bg-amber-100 text-amber-700";
        default:
          return "bg-slate-100 text-slate-500";
      }
    } else {
      switch (target.kategori) {
        case "Baik":
          return "bg-green-100 text-green-700";
        case "Sedang":
          return "bg-yellow-100 text-yellow-700";
        case "Kurang":
          return "bg-red-100 text-red-700";
        default:
          return "bg-slate-100 text-slate-500";
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className={`${headerColor} px-5 py-4 flex items-center justify-between shrink-0`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {target.indikatorKode} — {INDICATOR_NAMES[target.indikatorKode]}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-white/70">
                  {target.tipe === "perubahan" ? "Perubahan" : "Capaian"}:
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getCategoryBadgeColor()}`}
                >
                  {categoryLabel}
                </span>
                <span className="text-[11px] text-white/70">
                  · {matchedSekolah.length} sekolah
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Download Excel */}
            {filteredSekolah.length > 0 && (
              <button
                onClick={downloadModalToExcel}
                className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors "
                title="Download Excel dengan data lengkap indikator"
              >
                <div className="flex justify-center items-center gap-1">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                  <span>Download</span>
                </div>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Filter Sekolah
            </p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SelectFilter
              label="Jenis Satuan"
              value={filterJenis}
              options={uniqueJenis}
              onChange={(value) => {
                setFilterJenis(value);
                setCurrentPage(1);
              }}
            />
            <SelectFilter
              label="Status"
              value={filterStatus}
              options={uniqueStatus}
              onChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            />
            <SelectFilter
              label="Kecamatan"
              value={filterKecamatan}
              options={uniqueKecamatan}
              onChange={(value) => {
                setFilterKecamatan(value);
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
          {hasFilters && (
            <p className="text-xs text-slate-500 mt-2">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {filteredSekolah.length}
              </span>{" "}
              dari {matchedSekolah.length} sekolah
            </p>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredSekolah.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Tidak ada sekolah yang sesuai filter
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
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, idx) => (
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
                            onClick={() => onDetailSekolah(row)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Lihat Detail Indikator"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />

              <div className="mt-3 text-xs text-slate-400">
                Menampilkan {paginated.length} dari {filteredSekolah.length}{" "}
                sekolah
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {filteredSekolah.length > 0 && (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" />
                Klik ikon Excel di header untuk download data lengkap indikator
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}





