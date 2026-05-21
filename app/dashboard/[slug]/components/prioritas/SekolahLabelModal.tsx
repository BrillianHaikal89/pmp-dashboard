// components/prioritas/SekolahLabelModal.tsx
import { useState } from "react";
import { Search } from "lucide-react";
import { SatdikTrenRow } from "../../types";

export function SekolahLabelModal({ indikator, label, sekolah, onClose }: {
  indikator: string; label: string; sekolah: SatdikTrenRow[]; onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = sekolah.filter(s =>
    s.nama?.toLowerCase().includes(search.toLowerCase()) ||
    s.npsn?.toLowerCase().includes(search.toLowerCase()) ||
    s.kecamatan?.toLowerCase().includes(search.toLowerCase())
  );
  const labelColor = label === "Baik" ? "text-emerald-700 bg-emerald-100 border-emerald-200"
    : label === "Sedang" ? "text-amber-700 bg-amber-100 border-amber-200"
    : "text-red-700 bg-red-100 border-red-200";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Sekolah dengan Label <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-bold border ${labelColor}`}>{label}</span></h3>
            <p className="text-xs text-slate-400 mt-0.5">Indikator {indikator} · {sekolah.length} sekolah</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 font-bold text-lg">✕</button>
        </div>
        <div className="p-4 border-b border-slate-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Cari nama, NPSN, kecamatan..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Tidak ada data</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 rounded-lg">
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">NPSN</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Sekolah</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Jenis</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Kecamatan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-mono text-xs text-slate-400">{s.npsn}</td>
                    <td className="py-2 px-3 text-xs font-semibold text-slate-800 max-w-[200px] truncate">{s.nama}</td>
                    <td className="py-2 px-3 text-xs text-slate-500 whitespace-nowrap">{s.jenis}</td>
                    <td className="py-2 px-3 text-xs text-slate-500">{s.kecamatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-slate-50 text-xs text-slate-400 text-right">{filtered.length} dari {sekolah.length} sekolah</div>
      </div>
    </div>
  );
}