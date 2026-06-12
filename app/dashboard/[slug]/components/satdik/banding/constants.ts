import type { CategoryColors, ChangeCategory, LabelCategory } from "./types";

export const CHANGE_CATS = [
  "Naik",
  "Turun",
  "Tidak Berubah",
  "Tidak Tersedia",
] as const satisfies readonly ChangeCategory[];

export const LABEL_CATS = [
  "Baik",
  "Sedang",
  "Kurang",
  "Tidak Tersedia",
] as const satisfies readonly LabelCategory[];

export const CHANGE_COLORS: CategoryColors<ChangeCategory> = {
  Naik: { "2024": "#4e9e7a", "2025": "#a8d4bf" },
  Turun: { "2024": "#c46060", "2025": "#e8b4b4" },
  "Tidak Berubah": { "2024": "#8c8b84", "2025": "#c8c7c0" },
  "Tidak Tersedia": { "2024": "#b89850", "2025": "#ddd0a0" },
};

export const LABEL_COLORS: CategoryColors<LabelCategory> = {
  Baik: { "2024": "#4e7eb5", "2025": "#a8c4e0" },
  Sedang: { "2024": "#b89850", "2025": "#ddd0a0" },
  Kurang: { "2024": "#c46060", "2025": "#e8b4b4" },
  "Tidak Tersedia": { "2024": "#8c8b84", "2025": "#c8c7c0" },
};

export const YEAR_LEGEND_ITEMS = [
  { color: "#6b6b64", label: "2024 — gelap" },
  { color: "#c0bfb8", label: "2025 — terang" },
];
