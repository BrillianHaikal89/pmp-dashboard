export const INDICATOR_CODES = [
  "Semua",
  "A.1",
  "A.2",
  "A.3",
  "D.1",
  "D.3",
  "D.4",
  "D.8",
  "D.10",
];

export const INDICATOR_NAMES: Record<string, string> = {
  "A.1": "Kemampuan Literasi",
  "A.2": "Kemampuan Numerasi",
  "A.3": "Karakter",
  "D.1": "Kualitas Pembelajaran",
  "D.3": "Kepemimpinan Instruksional",
  "D.4": "Iklim Keamanan Satuan Pendidikan",
  "D.8": "Iklim Kebinekaan",
  "D.10": "Iklim Inklusivitas",
};

export const INDICATOR_COLORS: Record<string, string> = {
  "A.1": "bg-blue-500",
  "A.2": "bg-teal-500",
  "A.3": "bg-purple-500",
  "D.1": "bg-orange-500",
  "D.3": "bg-cyan-500",
  "D.4": "bg-rose-500",
  "D.8": "bg-emerald-500",
  "D.10": "bg-indigo-500",
};

export const INDICATOR_ACTIVE_COLORS: Record<string, string> = {
  "A.1": "bg-blue-500 text-white border-blue-500",
  "A.2": "bg-teal-500 text-white border-teal-500",
  "A.3": "bg-purple-500 text-white border-purple-500",
  "D.1": "bg-orange-500 text-white border-orange-500",
  "D.3": "bg-cyan-500 text-white border-cyan-500",
  "D.4": "bg-rose-500 text-white border-rose-500",
  "D.8": "bg-emerald-500 text-white border-emerald-500",
  "D.10": "bg-indigo-500 text-white border-indigo-500",
};

export const CHANGE_ORDER = ["Naik", "Turun", "Tidak Berubah", "Tidak Tersedia"];
export const CHANGE_LABELS: Record<string, string> = {
  Naik: "📈 Meningkat",
  Turun: "📉 Menurun",
  "Tidak Berubah": "➖ Stabil",
  "Tidak Tersedia": "❓ Tidak Tersedia",
};

export const CAPAIAN_ORDER = ["Baik", "Sedang", "Kurang", "Tidak Tersedia"];
export const CAPAIAN_LABELS: Record<string, string> = {
  Baik: "✅ Baik",
  Sedang: "📊 Sedang",
  Kurang: "⚠️ Kurang",
  "Tidak Tersedia": "❓ Tidak Tersedia",
};
