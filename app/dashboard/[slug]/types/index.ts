// types/index.ts
export type TahunFilter = "2024" | "2025" | "banding";

export interface KabkotRow {
  jenis_satdik: string;
  status: string;
  no: string;
  indikator_short: string;
  label_2024: string;
  nilai_2024_num: number | null;
  nilai_2023_num: number | null;
  perubahan: string;
  peringkat_provinsi: string;
  capaian_status?: string;
}

export interface SatdikRow {
  npsn: string;
  nama: string;
  jenis: string;
  status: string;
  kabkot: string;
  kecamatan: string;
  label_literasi: string;
  label_numerasi: string;
  label_karakter: string;
  tahun?: string;
}

export interface PaudRow {
  npsn: string;
  nama: string;
  jenis: string;
  status: string;
  kabkot: string;
  kecamatan: string;
  label_perencanaan: string;
  label_proses: string;
  label_kemampuan_fondasi: string;
  label_sarana: string;
  tahun?: string;
}

export interface AkarRow {
  kelompok: string;
  kategori: string;
  indikator_kinerja: string;
  indikator_prioritas: string;
  kelompok_akar: string;
  no_akar: string;
  indikator_akar: string;
  mengapa: string;
}

export interface IndikatorPrioritasRow {
  status: string;
  jenis?: string;
  no: string;
  nilai_25: string;
  delta: string;
  nilai_24: string;
  label?: string;
  peringkat_prov?: string;
}

export interface SatdikIndikatorTren {
  label: string;
  tren: string;
  delta: string;
  peringkat: string;
}

export interface SatdikTrenRow {
  npsn: string;
  nama: string;
  jenis: string;
  status: string;
  kab_kota: string;
  kecamatan: string;
  [key: string]: SatdikIndikatorTren | string;
}

export interface DashData {
  spm_value: string;
  tahun?: string;
  ringkasan: any[];
  spm_nilai_num?: number | null;
  capaian_status?: string;
  kabkot: KabkotRow[];
  satdik: SatdikRow[];
  paud: PaudRow[];
  akar_masalah: AkarRow[];
  indikator_prioritas?: IndikatorPrioritasRow[];
  satdik_tren?: { total: number; data: SatdikTrenRow[] };
}

export interface WilayahInfo {
  nama: string;
  type: string;
  displayName: string;
}