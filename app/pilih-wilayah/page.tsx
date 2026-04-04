// app/pilih-wilayah/page.tsx
"use client";

import { useState } from "react";
import { Search, ChevronRight, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

const KABKOT_JABAR = [
  { tipe: "Kabupaten", nama: "Kab. Bandung",       kode: "kab-bandung",       href: "/dashboard/kab-bandung" },
  { tipe: "Kabupaten", nama: "Kab. Bandung Barat", kode: "kab-bandung-barat", href: "/dashboard/kab-bandung-barat" },
  { tipe: "Kabupaten", nama: "Kab. Bekasi",        kode: "kab-bekasi",        href: "/dashboard/kab-bekasi" },
  { tipe: "Kabupaten", nama: "Kab. Bogor",         kode: "kab-bogor",         href: "/dashboard/kab-bogor" },
  { tipe: "Kabupaten", nama: "Kab. Ciamis",        kode: "kab-ciamis",        href: "/dashboard/kab-ciamis" },
  { tipe: "Kabupaten", nama: "Kab. Cianjur",       kode: "kab-cianjur",       href: "/dashboard/kab-cianjur" },
  { tipe: "Kabupaten", nama: "Kab. Cirebon",       kode: "kab-cirebon",       href: "/dashboard/kab-cirebon" },
  { tipe: "Kabupaten", nama: "Kab. Garut",         kode: "kab-garut",         href: "/dashboard/kab-garut" },
  { tipe: "Kabupaten", nama: "Kab. Indramayu",     kode: "kab-indramayu",     href: "/dashboard/kab-indramayu" },
  { tipe: "Kabupaten", nama: "Kab. Karawang",      kode: "kab-karawang",      href: "/dashboard/kab-karawang" },
  { tipe: "Kabupaten", nama: "Kab. Kuningan",      kode: "kab-kuningan",      href: "/dashboard/kab-kuningan" },
  { tipe: "Kabupaten", nama: "Kab. Majalengka",    kode: "kab-majalengka",    href: "/dashboard/kab-majalengka" },
  { tipe: "Kabupaten", nama: "Kab. Pangandaran",   kode: "kab-pangandaran",   href: "/dashboard/kab-pangandaran" },
  { tipe: "Kabupaten", nama: "Kab. Purwakarta",    kode: "kab-purwakarta",    href: "/dashboard/kab-purwakarta" },
  { tipe: "Kabupaten", nama: "Kab. Subang",        kode: "kab-subang",        href: "/dashboard/kab-subang" },
  { tipe: "Kabupaten", nama: "Kab. Sukabumi",      kode: "kab-sukabumi",      href: "/dashboard/kab-sukabumi" },
  { tipe: "Kabupaten", nama: "Kab. Sumedang",      kode: "kab-sumedang",      href: "/dashboard/kab-sumedang" },
  { tipe: "Kabupaten", nama: "Kab. Tasikmalaya",   kode: "kab-tasikmalaya",   href: "/dashboard/kab-tasikmalaya" },
  { tipe: "Kota",      nama: "Kota Bandung",       kode: "kota-bandung",      href: "/dashboard/kota-bandung" },
  { tipe: "Kota",      nama: "Kota Banjar",        kode: "kota-banjar",       href: "/dashboard/kota-banjar" },
  { tipe: "Kota",      nama: "Kota Bekasi",        kode: "kota-bekasi",       href: "/dashboard/kota-bekasi" },
  { tipe: "Kota",      nama: "Kota Bogor",         kode: "kota-bogor",        href: "/dashboard/kota-bogor" },
  { tipe: "Kota",      nama: "Kota Cimahi",        kode: "kota-cimahi",       href: "/dashboard/kota-cimahi" },
  { tipe: "Kota",      nama: "Kota Cirebon",       kode: "kota-cirebon",      href: "/dashboard/kota-cirebon" },
  { tipe: "Kota",      nama: "Kota Depok",         kode: "kota-depok",        href: "/dashboard/kota-depok" },
  { tipe: "Kota",      nama: "Kota Sukabumi",      kode: "kota-sukabumi",     href: "/dashboard/kota-sukabumi" },
  { tipe: "Kota",      nama: "Kota Tasikmalaya",   kode: "kota-tasikmalaya",  href: "/dashboard/kota-tasikmalaya" },
];

export default function PilihWilayahPage() {
  const [search, setSearch]         = useState("");
  const [filterTipe, setFilterTipe] = useState<"Semua" | "Kabupaten" | "Kota">("Semua");

  const filtered = KABKOT_JABAR.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase());
    const matchTipe   = filterTipe === "Semua" || k.tipe === filterTipe;
    return matchSearch && matchTipe;
  });

  const kabList  = filtered.filter(k => k.tipe === "Kabupaten");
  const kotaList = filtered.filter(k => k.tipe === "Kota");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top bar dengan 2 menu ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Beranda
        </Link>
        <div className="w-px h-5 bg-slate-200" />

        {/* ── 2 Menu utama ── */}
        <nav className="flex gap-1">
          <Link
            href="/pilih-wilayah"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white transition"
          >
            Pilih Wilayah
          </Link>
          <Link
            href="/dashboard-provinsi"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Dashboard Provinsi
          </Link>
        </nav>

        <div className="ml-auto">
          <p className="text-sm font-bold text-slate-900">
            JAWA <span className="text-amber-500">BARAT</span>
            <span className="font-normal text-slate-400 ml-2 text-xs">Rapor Pendidikan 2024 &amp; 2025</span>
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          Pilih <span className="text-amber-500">Kabupaten / Kota</span>
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Pilih wilayah untuk melihat Rapor Pendidikan 2024 dan 2025
        </p>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari kabupaten atau kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            {(["Semua", "Kabupaten", "Kota"] as const).map(t => (
              <button key={t} onClick={() => setFilterTipe(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                  filterTipe === t
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MapPin size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Tidak ada wilayah ditemukan</p>
            <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            {(filterTipe === "Semua" || filterTipe === "Kabupaten") && kabList.length > 0 && (
              <div className={filterTipe === "Semua" ? "md:col-span-2" : "md:col-span-3"}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Kabupaten ({kabList.length})
                </p>
                <div className={filterTipe === "Semua" ? "space-y-1.5" : "grid grid-cols-1 md:grid-cols-3 gap-1.5"}>
                  {kabList.map(k => (
                    <Link
                      key={k.kode}
                      href={k.href}
                      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-blue-600" />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-800 group-hover:text-blue-700">{k.nama}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(filterTipe === "Semua" || filterTipe === "Kota") && kotaList.length > 0 && (
              <div className={filterTipe === "Kota" ? "md:col-span-3" : ""}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Kota ({kotaList.length})
                </p>
                <div className={filterTipe === "Kota" ? "grid grid-cols-1 md:grid-cols-3 gap-1.5" : "space-y-1.5"}>
                  {kotaList.map(k => (
                    <Link
                      key={k.kode}
                      href={k.href}
                      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-amber-600" />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-800 group-hover:text-amber-700">{k.nama}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-400 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}