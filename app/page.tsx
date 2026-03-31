// app/page.tsx
"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import Link from "next/link";

export default function BerandaPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/BG_ALAM_JABAR.png"
          alt="Background Alam Jawa Barat"
          fill
          className="object-cover opacity-25"
          priority
        />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-200/60 bg-white/20 backdrop-blur-[2px] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/LOGO_TUTWURI.png" alt="Logo Provinsi Jawa Barat" width={50} height={50} className="object-contain flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Balai Besar Penjaminan Mutu Pendidikan</p>
            <p className="text-xs text-slate-400">Jawa Barat</p>
          </div>
        </div>
        <Link
          href="/pilih-wilayah"
          className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition"
        >
          Masuk ke Dashboard →
        </Link>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">

          <div className="flex items-start justify-between gap-8 mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <Image src="/LOGO_BBPMP_KEMENDIKDASMEN.png" alt="Logo BBPMP" width={600} height={600} className="object-contain" />
              </div>
              <div className="bg-slate-900 rounded-2xl px-7 py-5 inline-block mb-6">
                <p className="text-white text-lg font-bold leading-snug">Selamat Datang di Dashboard</p>
                <p className="text-white text-lg font-bold leading-snug">
                  PMP <span className="text-amber-400">Jawa Barat</span>
                </p>
              </div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                Balai Besar Penjaminan Mutu<br />Pendidikan Jawa Barat
              </h1>
              <p className="text-slate-500 text-sm mt-2">Rapor Pendidikan · Tahun 2024 dan 2025</p>
            </div>

            <div className="hidden md:flex w-85 h-85 items-center justify-center">
              <Image
                src="/PETA_JAWA_BARAT.png"
                alt="Peta Jawa Barat"
                width={400}
                height={300}
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Kabupaten",      value: "18", color: "bg-blue-50 border-blue-100 text-blue-700" },
              { label: "Kota",           value: "9",  color: "bg-amber-50 border-amber-100 text-amber-700" },
              { label: "Total Kab/Kota", value: "27", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
            ].map((s, i) => (
              <Link
                key={i}
                href="/pilih-wilayah"
                className={"border rounded-xl p-4 text-center transition hover:scale-105 hover:shadow-md block " + s.color}
              >
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-100/60 bg-white/20 backdrop-blur-[2px] px-8 py-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">© 2026 BBPMP Jawa Barat</p>
      </div>
    </div>
  );
}