import type { MutableRefObject } from "react";
import type { Chart as ChartJS } from "chart.js";

export type TahunBanding = "2024" | "2025";
export type ViewMode = "absolut" | "persen";
export type ChangeCategory = "Naik" | "Turun" | "Tidak Berubah" | "Tidak Tersedia";
export type LabelCategory = "Baik" | "Sedang" | "Kurang" | "Tidak Tersedia";
export type Category = ChangeCategory | LabelCategory;

export type CategorySummary<T extends string> = Record<T, number>;
export type CategoryColors<T extends string> = Record<T, Record<TahunBanding, string>>;

export type LegendItem = {
  color: string;
  label: string;
};

export type BarChartRef = MutableRefObject<ChartJS<"bar"> | null>;
