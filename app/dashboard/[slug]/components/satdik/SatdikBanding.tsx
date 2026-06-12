import { useCallback, useMemo, useRef, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import type { SatdikRow } from "../../types";
import { CheckboxDropdown } from "./banding/CheckboxDropdown";
import { CHANGE_CATS, CHANGE_COLORS, LABEL_CATS, LABEL_COLORS } from "./banding/constants";
import { downloadChartPNG } from "./banding/downloadChartPNG";
import { buildLegendItems, GroupedChart } from "./banding/GroupedChart";
import { StatRow } from "./banding/Stats";
import { SATDIK_BANDING_STYLES } from "./banding/styles";
import { buildChangeSummary, buildLabelSummary } from "./banding/summary";
import type { BarChartRef, ViewMode } from "./banding/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function SatdikBanding({ d24, d25 }: { d24: SatdikRow[]; d25: SatdikRow[] }) {
  const jenisOptions = useMemo(() => {
    const s = new Set<string>();
    [...d24, ...d25].forEach((r) => {
      if (r.jenis) s.add(r.jenis);
    });
    return Array.from(s).sort();
  }, [d24, d25]);

  const [selectedJenis, setSelectedJenis] = useState<Set<string>>(
    () => new Set(jenisOptions),
  );
  const [mode, setMode] = useState<ViewMode>("absolut");
  const [downloadingAll, setDownloadingAll] = useState(false);

  const changeChartRef = useRef<ChartJS<"bar"> | null>(null);
  const labelChartRef = useRef<ChartJS<"bar"> | null>(null);

  const f24 = useMemo(
    () =>
      selectedJenis.size === jenisOptions.length
        ? d24
        : d24.filter((r) => selectedJenis.has(r.jenis)),
    [d24, selectedJenis, jenisOptions.length],
  );
  const f25 = useMemo(
    () =>
      selectedJenis.size === jenisOptions.length
        ? d25
        : d25.filter((r) => selectedJenis.has(r.jenis)),
    [d25, selectedJenis, jenisOptions.length],
  );

  const changeSummary24 = useMemo(() => buildChangeSummary(f24), [f24]);
  const changeSummary25 = useMemo(() => buildChangeSummary(f25), [f25]);
  const labelSummary24 = useMemo(() => buildLabelSummary(f24), [f24]);
  const labelSummary25 = useMemo(() => buildLabelSummary(f25), [f25]);

  const activeLabel =
    selectedJenis.size === 0
      ? "Tidak ada jenis dipilih"
      : selectedJenis.size === jenisOptions.length
        ? "Semua jenis"
        : `${selectedJenis.size} jenis dipilih`;

  const changeLegendItems = useMemo(
    () => buildLegendItems(CHANGE_CATS, CHANGE_COLORS),
    [],
  );
  const labelLegendItems = useMemo(
    () => buildLegendItems(LABEL_CATS, LABEL_COLORS),
    [],
  );

  const handleDownloadAll = useCallback(() => {
    setDownloadingAll(true);
    downloadChartPNG(
      changeChartRef as BarChartRef,
      "perubahan-indikator-2024-vs-2025.png",
      changeLegendItems,
    );
    setTimeout(() => {
      downloadChartPNG(
        labelChartRef as BarChartRef,
        "label-capaian-2024-vs-2025.png",
        labelLegendItems,
      );
      setDownloadingAll(false);
    }, 300);
  }, [changeLegendItems, labelLegendItems]);

  return (
    <>
      <style>{SATDIK_BANDING_STYLES}</style>

      <div className="sbc-root">
        <div className="sbc-hd">
          <h2>Perbandingan Indikator Prioritas 2024 vs 2025</h2>
          <p>
            {f24.length} sekolah (2024) &nbsp;·&nbsp; {f25.length} sekolah (2025)
            &nbsp;·&nbsp; {activeLabel}
          </p>
        </div>

        <div className="sbc-ctrls">
          <CheckboxDropdown
            label="Filter Jenis"
            options={jenisOptions}
            selected={selectedJenis}
            onChange={setSelectedJenis}
          />

          <div className="sbc-tabs">
            <button
              className={`sbc-tab ${mode === "absolut" ? "on" : ""}`}
              onClick={() => setMode("absolut")}
            >
              Jumlah
            </button>
            <button
              className={`sbc-tab ${mode === "persen" ? "on" : ""}`}
              onClick={() => setMode("persen")}
            >
              Persentase
            </button>
          </div>

          <button
            className="sbc-dl-all"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            title="Unduh kedua grafik sebagai PNG"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{downloadingAll ? "Mengunduh..." : "Unduh Semua"}</span>
          </button>
        </div>

        <div className="sbc-charts">
          <GroupedChart
            title="Perubahan Indikator"
            cats={CHANGE_CATS}
            colors={CHANGE_COLORS}
            sum24={changeSummary24}
            sum25={changeSummary25}
            mode={mode}
            chartRef={changeChartRef as BarChartRef}
            downloadName="perubahan-indikator-2024-vs-2025.png"
          />
          <GroupedChart
            title="Label Capaian"
            cats={LABEL_CATS}
            colors={LABEL_COLORS}
            sum24={labelSummary24}
            sum25={labelSummary25}
            mode={mode}
            chartRef={labelChartRef as BarChartRef}
            downloadName="label-capaian-2024-vs-2025.png"
          />
        </div>

        <div className="sbc-stats-wrap">
          <p className="sbc-stats-title">Delta per Kategori</p>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <p className="sbc-stats-col-hd">Perubahan Indikator</p>
              {CHANGE_CATS.map((c) => (
                <StatRow
                  key={c}
                  label={c}
                  val24={changeSummary24[c] ?? 0}
                  val25={changeSummary25[c] ?? 0}
                  color24={CHANGE_COLORS[c]["2024"]}
                />
              ))}
            </div>
            <div className="sbc-divider" />
            <div style={{ flex: 1 }}>
              <p className="sbc-stats-col-hd">Label Capaian</p>
              {LABEL_CATS.map((c) => (
                <StatRow
                  key={c}
                  label={c}
                  val24={labelSummary24[c] ?? 0}
                  val25={labelSummary25[c] ?? 0}
                  color24={LABEL_COLORS[c]["2024"]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
