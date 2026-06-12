import type { ChartOptions, TooltipItem } from "chart.js";
import type { ViewMode } from "./types";

export type SatdikBandingChartOptions = ChartOptions<"bar"> & {
  _sbcMode?: ViewMode;
};

export const makeOptions = (
  mode: ViewMode,
  suffix: string,
): SatdikBandingChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  _sbcMode: mode,
  layout: { padding: { top: 20 } },
  animation: { duration: 300 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e1e1c",
      titleColor: "#e0ded6",
      bodyColor: "#a0a09a",
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: TooltipItem<"bar">) =>
          `  ${ctx.dataset.label}: ${ctx.raw}${mode === "persen" ? "%" : ` ${suffix}`}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#a0a09a", font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(160,160,154,0.12)" },
      border: { display: false },
      ticks: {
        color: "#a0a09a",
        font: { size: 11 },
        padding: 6,
        callback: (v) => (mode === "persen" ? `${v}%` : v),
      },
    },
  },
});
