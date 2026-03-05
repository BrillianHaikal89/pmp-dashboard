// app/dashboard/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const wilayah = searchParams.get("wilayah") ?? "";
  const nama    = searchParams.get("nama") ?? "Wilayah";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link
          href="/pilih-wilayah"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Pilih Wilayah
        </Link>
        <div className="w-px h-5 bg-slate-200" />
        <p className="text-sm font-bold text-slate-900">
          JAWA <span className="text-amber-500">BARAT</span>
          <span className="font-normal text-slate-400 ml-2 text-xs">Rapor Pendidikan 2024</span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <MapPin size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{nama}</h1>
            <p className="text-xs text-slate-400 font-mono">{wilayah}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-8 ml-12">Rapor Pendidikan · Tahun 2024</p>

        {/* Placeholder dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Indeks Literasi",    value: "72.4", unit: "/100", color: "bg-blue-50 border-blue-100",   text: "text-blue-700" },
            { label: "Indeks Numerasi",    value: "68.9", unit: "/100", color: "bg-amber-50 border-amber-100", text: "text-amber-700" },
            { label: "Karakter Siswa",     value: "81.2", unit: "/100", color: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
          ].map((s, i) => (
            <div key={i} className={`border rounded-2xl p-6 ${s.color}`}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{s.label}</p>
              <p className={`text-4xl font-black ${s.text}`}>
                {s.value}<span className="text-lg font-normal opacity-50">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
          <p className="text-sm font-semibold">Konten dashboard untuk <span className="text-slate-700">{nama}</span> akan ditampilkan di sini.</p>
          <p className="text-xs mt-1">Kode wilayah: <span className="font-mono text-slate-600">{wilayah}</span></p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Memuat...</div>}>
      <DashboardContent />
    </Suspense>
  );
}