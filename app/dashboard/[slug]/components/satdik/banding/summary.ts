import type { SatdikRow } from "../../../types";
import { CHANGE_CATS, LABEL_CATS } from "./constants";
import type { CategorySummary, ChangeCategory, LabelCategory } from "./types";

export const getChangeCat = (raw = ""): ChangeCategory => {
  const s = raw.toLowerCase().trim();
  if (/naik/.test(s)) return "Naik";
  if (/turun/.test(s)) return "Turun";
  if (/tidak berubah|stabil/.test(s)) return "Tidak Berubah";
  return "Tidak Tersedia";
};

export const getLabelCat = (raw = ""): LabelCategory => {
  const s = raw.toLowerCase().trim();
  if (/baik/.test(s)) return "Baik";
  if (/sedang/.test(s)) return "Sedang";
  if (/kurang/.test(s)) return "Kurang";
  return "Tidak Tersedia";
};

const createSummary = <T extends string>(cats: readonly T[]): CategorySummary<T> =>
  Object.fromEntries(cats.map((c) => [c, 0])) as CategorySummary<T>;

export const buildChangeSummary = (
  rows: SatdikRow[],
): CategorySummary<ChangeCategory> =>
  rows.reduce<CategorySummary<ChangeCategory>>((acc, row) => {
    (row.indikator_prioritas ?? []).forEach((item) => {
      const cat = getChangeCat(item.perubahan ?? item.nilai ?? "");
      acc[cat] += 1;
    });
    return acc;
  }, createSummary(CHANGE_CATS));

export const buildLabelSummary = (
  rows: SatdikRow[],
): CategorySummary<LabelCategory> =>
  rows.reduce<CategorySummary<LabelCategory>>((acc, row) => {
    (row.indikator_prioritas ?? []).forEach((item) => {
      const cat = getLabelCat(item.label_capaian ?? "");
      acc[cat] += 1;
    });
    return acc;
  }, createSummary(LABEL_CATS));
