// hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import { DashData, IndikatorPrioritasRow, SatdikRow } from "../types";

type CapaianDasmenIndicator = {
  kode?: string;
  label_capaian?: string;
  label?: string;
  perubahan?: string;
  nilai?: string;
  nama?: string;
  peringkat?: string;
  sub_indikator?: Array<{
    kode?: string;
    nama?: string;
    perubahan_nilai?: string;
    [key: string]: any;
  }>;
};

type CapaianDasmenRow = {
  npsn?: string;
  nama_satuan_pendidikan?: string;
  jenis_satuan_pendidikan?: string;
  status_satuan?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
  indikator?: CapaianDasmenIndicator[];
};

const PRIORITAS_CODES = new Set([
  "A1",
  "A2",
  "A3",
  "D1",
  "D3",
  "D4",
  "D8",
  "D10",
]);

function normalizeKode(kode?: string): string {
  return kode?.replace(/\.|\s+/g, "").toUpperCase() ?? "";
}

function normalizeNilai(raw?: string | number): string {
  if (raw === null || raw === undefined) return "";
  const s = String(raw).trim();
  if (s === "") return "";
  const cleaned = s.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
  if (cleaned === "") return "";
  const n = Number(cleaned);
  return Number.isFinite(n) ? s : "";
}

function getCapaianLabel(
  indikator?: CapaianDasmenIndicator[],
  kode?: string,
): string {
  if (!Array.isArray(indikator) || !kode) return "";
  const item = indikator.find((i) => i?.kode === kode);
  return item?.label_capaian ?? item?.label ?? "";
}

function mapCapaianDasmenToSatdikRows(
  raw: unknown,
  tahun: "2024" | "2025",
): SatdikRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    const row = item as CapaianDasmenRow;
    const indikatorPrioritas = Array.isArray(row.indikator)
      ? row.indikator
          .filter((i) => PRIORITAS_CODES.has(normalizeKode(i.kode)))
          .map((i) => ({
            kode: i.kode ?? "",
            nama: i.nama ?? "",
            perubahan: i.perubahan ?? "",
            label_capaian: i.label_capaian ?? "",
            sub_indikator: i.sub_indikator ?? [],
            peringkat: i.peringkat ?? "",
            nilai: normalizeNilai(i.nilai ?? ""),
          }))
      : [];

    return {
      npsn: row.npsn ?? "",
      nama: row.nama_satuan_pendidikan ?? "",
      jenis: row.jenis_satuan_pendidikan ?? "",
      status: row.status_satuan ?? "",
      kabkot: row.kabupaten_kota ?? "",
      kecamatan: row.kecamatan ?? "",
      label_literasi: getCapaianLabel(row.indikator, "A.1"),
      label_numerasi: getCapaianLabel(row.indikator, "A.2"),
      label_karakter: getCapaianLabel(row.indikator, "A.3"),
      indikator_prioritas: indikatorPrioritas,
      tahun,
    };
  });
}

export function useDashboardData(slug: string, tahun: "2024" | "2025") {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load main dashboard data
        const response = await fetch(
          `/data/${slug}/dashboard_data_${tahun}.json`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawData = await response.json();

        // Prefer capaian_dasmen JSON for satdik tab if available
        try {
          const capaianResponse = await fetch(
            `/data/${slug}/capaian_dasmen_${tahun}.json`,
          );
          if (capaianResponse.ok) {
            const capaianData = await capaianResponse.json();
            const mappedSatdik = mapCapaianDasmenToSatdikRows(
              capaianData,
              tahun,
            );
            if (mappedSatdik.length > 0) {
              rawData.satdik = mappedSatdik;
            }
          }
        } catch (e) {
          console.warn("No capaian_dasmen data", e);
        }

        // Load indikator prioritas if available
        let ipRows: IndikatorPrioritasRow[] = [];
        let satdikTren = null;

        try {
          const ipResponse = await fetch(
            `/indikatorPrioritasKabKota/${tahun}/${slug}/dashboard_data_${tahun}.json`,
          );
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipRows = ipData?.indikator?.data ?? [];
            satdikTren = ipData?.satdik ?? null;
          }
        } catch (e) {
          console.warn("No indikator prioritas data", e);
        }

        setData({
          ...rawData,
          indikator_prioritas: ipRows,
          satdik_tren: satdikTren,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, tahun]);

  return { data, loading, error };
}
