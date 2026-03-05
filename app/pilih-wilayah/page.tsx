// app/pilih-wilayah/page.tsx
"use client";

import { useState } from "react";
import { Search, ChevronRight, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

const KABKOT_JABAR = [
  { tipe: "Kabupaten", nama: "Kab. Bandung",       kode: "KAB-BANDUNG",       href: "/dashboard/kab_bandung" },
  { tipe: "Kabupaten", nama: "Kab. Bandung Barat", kode: "KAB-BANDUNG-BARAT", href: "/dashboard/kab_bandung_barat" },
  { tipe: "Kabupaten", nama: "Kab. Bekasi",        kode: "KAB-BEKASI",        href: "/dashboard/kab_bekasi" },
  { tipe: "Kabupaten", nama: "Kab. Bogor",         kode: "KAB-BOGOR",         href: "/dashboard/kab_bogor" },
  { tipe: "Kabupaten", nama: "Kab. Ciamis",        kode: "KAB-CIAMIS",        href: "/dashboard/kab_ciamis" },
  { tipe: "Kabupaten", nama: "Kab. Cianjur",       kode: "KAB-CIANJUR",       href: "/dashboard/kab_cianjur" },
  { tipe: "Kabupaten", nama: "Kab. Cirebon",       kode: "KAB-CIREBON",       href: "/dashboard/kab_cirebon" },
  { tipe: "Kabupaten", nama: "Kab. Garut",         kode: "KAB-GARUT",         href: "/dashboard/kab_garut" },
  { tipe: "Kabupaten", nama: "Kab. Indramayu",     kode: "KAB-INDRAMAYU",     href: "/dashboard/kab_indramayu" },
  { tipe: "Kabupaten", nama: "Kab. Karawang",      kode: "KAB-KARAWANG",      href: "/dashboard/kab_karawang" },
  { tipe: "Kabupaten", nama: "Kab. Kuningan",      kode: "KAB-KUNINGAN",      href: "/dashboard/kab_kuningan" },
  { tipe: "Kabupaten", nama: "Kab. Majalengka",    kode: "KAB-MAJALENGKA",    href: "/dashboard/kab_majalengka" },
  { tipe: "Kabupaten", nama: "Kab. Pangandaran",   kode: "KAB-PANGANDARAN",   href: "/dashboard/kab_pangandaran" },
  { tipe: "Kabupaten", nama: "Kab. Purwakarta",    kode: "KAB-PURWAKARTA",    href: "/dashboard/kab_purwakarta" },
  { tipe: "Kabupaten", nama: "Kab. Subang",        kode: "KAB-SUBANG",        href: "/dashboard/kab_subang" },
  { tipe: "Kabupaten", nama: "Kab. Sukabumi",      kode: "KAB-SUKABUMI",      href: "/dashboard/kab_sukabumi" },
  { tipe: "Kabupaten", nama: "Kab. Sumedang",      kode: "KAB-SUMEDANG",      href: "/dashboard/kab_sumedang" },
  { tipe: "Kabupaten", nama: "Kab. Tasikmalaya",   kode: "KAB-TASIKMALAYA",   href: "/dashboard/kab_tasikmalaya" },
  { tipe: "Kota",      nama: "Kota Bandung",       kode: "KOTA-BANDUNG",      href: "/dashboard/kota_bandung" },
  { tipe: "Kota",      nama: "Kota Banjar",        kode: "KOTA-BANJAR",       href: "/dashboard?wilayah=KOTA-BANJAR&nama=Kota+Banjar" },
  { tipe: "Kota",      nama: "Kota Bekasi",        kode: "KOTA-BEKASI",       href: "/dashboard?wilayah=KOTA-BEKASI&nama=Kota+Bekasi" },
  { tipe: "Kota",      nama: "Kota Bogor",         kode: "KOTA-BOGOR",        href: "/dashboard?wilayah=KOTA-BOGOR&nama=Kota+Bogor" },
  { tipe: "Kota",      nama: "Kota Cimahi",        kode: "KOTA-CIMAHI",       href: "/dashboard?wilayah=KOTA-CIMAHI&nama=Kota+Cimahi" },
  { tipe: "Kota",      nama: "Kota Cirebon",       kode: "KOTA-CIREBON",      href: "/dashboard?wilayah=KOTA-CIREBON&nama=Kota+Cirebon" },
  { tipe: "Kota",      nama: "Kota Depok",         kode: "KOTA-DEPOK",        href: "/dashboard?wilayah=KOTA-DEPOK&nama=Kota+Depok" },
  { tipe: "Kota",      nama: "Kota Sukabumi",      kode: "KOTA-SUKABUMI",     href: "/dashboard?wilayah=KOTA-SUKABUMI&nama=Kota+Sukabumi" },
  { tipe: "Kota",      nama: "Kota Tasikmalaya",   kode: "KOTA-TASIKMALAYA",  href: "/dashboard?wilayah=KOTA-TASIKMALAYA&nama=Kota+Tasikmalaya" },
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
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Beranda
        </Link>
        <div className="w-px h-5 bg-slate-200" />
        <p className="text-sm font-bold text-slate-900">
          JAWA <span className="text-amber-500">BARAT</span>
          <span className="font-normal text-slate-400 ml-2 text-xs">Rapor Pendidikan 2024</span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          Provinsi / Kabupaten / Kota <span className="text-amber-500">Jawa Barat</span>
        </h1>
        <p className="text-sm text-slate-500 mb-6">Pilih wilayah untuk melihat Rapor Pendidikan 2024</p>

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

        {/* Grid 3 kolom */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MapPin size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Tidak ada wilayah ditemukan</p>
            <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            {/* Kolom Kabupaten — span 2 */}
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

            {/* Kolom Kota — span 1 */}
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