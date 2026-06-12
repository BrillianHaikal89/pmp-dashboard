/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { BarChart3, ChevronRight, X } from "lucide-react";
import { SatdikRow } from "../../../types";
import { INDICATOR_COLORS, INDICATOR_NAMES } from "../../../utils/satdikConstants";
import { getCleanIndicatorName } from "../../../utils/helpers";
// ── Modal Component untuk Detail Indikator Sekolah ───────────
export function DetailSekolahModal({
  sekolah,
  onClose,
}: {
  sekolah: SatdikRow | null;
  onClose: () => void;
}) {
  const [selectedIndikator, setSelectedIndikator] = useState<any>(null);

  if (!sekolah) return null;

  const handleIndikatorClick = (indikator: any) => {
    setSelectedIndikator(selectedIndikator === indikator ? null : indikator);
  };

  const getStatusBadge = (status?: string) => {
    const lower = status?.toLowerCase() || "";
    if (lower.includes("naik")) return "bg-emerald-100 text-emerald-700";
    if (lower.includes("turun")) return "bg-rose-100 text-rose-700";
    if (lower.includes("tidak berubah") || lower.includes("stabil"))
      return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-500";
  };

  const getCapaiBadge = (capaian?: string) => {
    const lower = capaian?.toLowerCase() || "";
    if (lower.includes("baik")) return "bg-green-100 text-green-700";
    if (lower.includes("sedang")) return "bg-yellow-100 text-yellow-700";
    if (lower.includes("kurang")) return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-500";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {sekolah.nama ?? "-"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              NPSN: {sekolah.npsn ?? "-"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Info Sekolah */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">
                Jenis Satuan
              </p>
              <p className="font-medium text-slate-700">
                {sekolah.jenis ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Status</p>
              <p className="font-medium text-slate-700">
                {sekolah.status ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Kecamatan</p>
              <p className="font-medium text-slate-700">
                {sekolah.kecamatan ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Kab/Kota</p>
              <p className="font-medium text-slate-700">
                {sekolah.kabkot ?? "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Daftar Indikator Prioritas */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Indikator Prioritas
          </h4>

          {!sekolah.indikator_prioritas ||
          sekolah.indikator_prioritas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Tidak ada data indikator prioritas
            </div>
          ) : (
            <div className="space-y-3">
              {sekolah.indikator_prioritas.map((indikator, idx) => {
                const isOpen = selectedIndikator === indikator;
                const headerColor =
                  INDICATOR_COLORS[indikator.kode] || "bg-slate-500";

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => handleIndikatorClick(indikator)}
                      className="w-full text-left"
                    >
                      <div
                        className={`${headerColor} px-4 py-3 flex items-center justify-between`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {indikator.kode}
                            </span>
                            <span className="text-xs text-white/80">
                              {INDICATOR_NAMES[indikator.kode] ||
                                indikator.nama}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(indikator.perubahan)}`}
                            >
                              Perubahan nilai: {indikator.perubahan || "-"}{" "}
                              {indikator.nilai || "-"}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${getCapaiBadge(indikator.label_capaian)}`}
                            >
                              Label Capaian: {indikator.label_capaian || "-"}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-white transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {isOpen &&
                      indikator.sub_indikator &&
                      indikator.sub_indikator.length > 0 && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                          <h5 className="text-xs font-semibold text-slate-600 mb-3">
                            Sub Indikator
                          </h5>
                          <div className="space-y-2">
                            {indikator.sub_indikator.map((sub, subIdx) => (
                              <div
                                key={subIdx}
                                className="flex items-center justify-between text-sm p-2 bg-white rounded-lg border border-slate-100"
                              >
                                <div className="flex-1">
                                  <span className="font-mono text-xs text-slate-500 mr-2">
                                    {sub.kode}
                                  </span>
                                  <span className="text-slate-700">
                                    {getCleanIndicatorName(
                                      sub.nama ?? "",
                                      sub.kode,
                                    )}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    sub.perubahan_nilai
                                      ?.toLowerCase()
                                      .includes("naik")
                                      ? "bg-emerald-100 text-emerald-700"
                                      : sub.perubahan_nilai
                                            ?.toLowerCase()
                                            .includes("turun")
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {sub.perubahan_nilai || "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {isOpen &&
                      (!indikator.sub_indikator ||
                        indikator.sub_indikator.length === 0) && (
                        <div className="p-4 bg-slate-50 text-center text-sm text-slate-400">
                          Tidak ada data sub indikator
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
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



