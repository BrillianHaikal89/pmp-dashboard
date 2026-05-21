// utils/constants.ts
export const LABEL_BG: Record<string, string> = {
  "Baik": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Sedang": "bg-amber-100 text-amber-700 border border-amber-200",
  "Kurang": "bg-red-100 text-red-700 border border-red-200",
  "Rendah": "bg-red-100 text-red-700 border border-red-200",
  "Tinggi": "bg-blue-100 text-blue-700 border border-blue-200",
  "Di atas": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Mencapai": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Di bawah": "bg-amber-100 text-amber-700 border border-amber-200",
  "Jauh di bawah": "bg-red-100 text-red-700 border border-red-200",
  "Capaian Tidak Tersedia": "bg-slate-100 text-slate-500 border border-slate-200",
};

export const LABEL_SCORE: Record<string, number> = {
  "Baik": 3, "Di atas": 3, "Mencapai": 3, "Tinggi": 3,
  "Sedang": 2, "Di bawah": 2,
  "Kurang": 1, "Rendah": 1, "Jauh di bawah": 1,
};

export const INDIKATOR_INFO: Record<string, { nama: string; deskripsi: string }> = {
  "A.1": { nama: "Literasi", deskripsi: "Kemampuan memahami dan menggunakan informasi" },
  "A.2": { nama: "Numerasi", deskripsi: "Kemampuan bernalar menggunakan matematika" },
  "A.3": { nama: "Karakter", deskripsi: "Penguatan profil pelajar Pancasila" },
  "D.1": { nama: "Kualitas Pembelajaran", deskripsi: "Partisipasi dalam pembelajaran" },
  "D.3": { nama: "Kepemimpinan Instruksional", deskripsi: "Partisipasi dalam kegiatan sekolah" },
  "D.4": { nama: "Iklim Keamanan", deskripsi: "Lingkungan belajar yang aman" },
  "D.8": { nama: "Iklim Kebinekaan", deskripsi: "Penghargaan terhadap keberagaman" },
  "D.10": { nama: "Iklim Inklusifitas", deskripsi: "Keterlibatan semua pihak" },
};

export const INDIKATOR_ORDER = ["A.1", "A.2", "A.3", "D.1", "D.3", "D.4", "D.8", "D.10"];

export const MENU = [
  { id: "ringkasan", label: "Ringkasan", icon: "LayoutDashboard" },
  { id: "prioritas", label: "Indikator Prioritas", icon: "BarChart3" },
  { id: "kabkot", label: "Capaian Kab/Kota", icon: "MapPin" },
  { id: "satdik", label: "Capaian Dasmen", icon: "School" },
  { id: "paud", label: "Capaian PAUD", icon: "Baby" },
  { id: "akar", label: "Akar Masalah", icon: "AlertTriangle" },
  { id: "pemda", label: "Capaian Mutu SPM", icon: "CheckCircle" },
];