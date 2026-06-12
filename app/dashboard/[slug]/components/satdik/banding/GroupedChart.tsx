import { Bar } from "react-chartjs-2";
import { dataLabelsPlugin } from "./dataLabelsPlugin";
import { makeOptions } from "./chartOptions";
import { YEAR_LEGEND_ITEMS } from "./constants";
import { downloadChartPNG } from "./downloadChartPNG";
import type {
  BarChartRef,
  CategoryColors,
  CategorySummary,
  LegendItem,
  ViewMode,
} from "./types";

export function buildLegendItems<T extends string>(
  cats: readonly T[],
  colors: CategoryColors<T>,
): LegendItem[] {
  return [
    ...YEAR_LEGEND_ITEMS,
    ...cats.map((c) => ({ color: colors[c]["2024"], label: c })),
  ];
}

export function GroupedChart<T extends string>({
  title,
  cats,
  colors,
  sum24,
  sum25,
  mode,
  height = 240,
  chartRef,
  downloadName,
}: {
  title: string;
  cats: readonly T[];
  colors: CategoryColors<T>;
  sum24: CategorySummary<T>;
  sum25: CategorySummary<T>;
  mode: ViewMode;
  height?: number;
  chartRef: BarChartRef;
  downloadName: string;
}) {
  const total24 = Object.values(sum24).reduce<number>(
    (total, value) => total + Number(value),
    0,
  );
  const total25 = Object.values(sum25).reduce<number>(
    (total, value) => total + Number(value),
    0,
  );
  const toVal = (v: number, total: number) =>
    mode === "persen" ? (total === 0 ? 0 : Math.round((v / total) * 100)) : v;

  const data = {
    labels: [...cats],
    datasets: [
      {
        label: "2024",
        data: cats.map((c) => toVal(sum24[c] ?? 0, total24)),
        backgroundColor: cats.map((c) => colors[c]["2024"]),
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.75,
      },
      {
        label: "2025",
        data: cats.map((c) => toVal(sum25[c] ?? 0, total25)),
        backgroundColor: cats.map((c) => colors[c]["2025"]),
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.75,
      },
    ],
  };

  const legendItems = buildLegendItems(cats, colors);

  return (
    <div className="sbc-chart-block">
      <div className="sbc-chart-hd">
        <p className="sbc-chart-title">{title}</p>
        <button
          className="sbc-dl-btn"
          title={`Unduh ${title} sebagai PNG`}
          onClick={() => downloadChartPNG(chartRef, downloadName, legendItems)}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          PNG
        </button>
      </div>

      <div style={{ position: "relative", height }}>
        <Bar
          ref={chartRef}
          data={data}
          options={makeOptions(mode, "indikator")}
          plugins={[dataLabelsPlugin]}
          aria-label={`Grouped bar chart ${title}`}
        />
      </div>

      <div className="sbc-inline-legend">
        {YEAR_LEGEND_ITEMS.map((item) => (
          <span key={item.label} className="sbc-leg-item">
            <span className="sbc-leg-swatch" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
        {cats.map((c) => (
          <span key={c} className="sbc-leg-item">
            <span className="sbc-leg-swatch" style={{ background: colors[c]["2024"] }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
