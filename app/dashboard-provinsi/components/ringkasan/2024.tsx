"use client";

import React from "react";
import { BookMarked, School, BookOpen, GraduationCap, Building2 } from "lucide-react";

interface RingkasanItem {
  Jenjang: string;
  Capaian: string;
  "Indikator Prioritas": string;
}

interface RingkasanViewProps {
  tahun: string;
  jenjangList: string[];
  ringkasan: RingkasanItem[];
  getJenjangGradient: (jenjang: string) => string;
  SectionHeader: React.ComponentType<{
    icon: React.ReactNode;
    title: string;
    badge?: string;
  }>;
}

export default function Ringkasan2024({
  tahun,
  jenjangList,
  ringkasan,
  getJenjangGradient,
  SectionHeader,
}: RingkasanViewProps) {
  return (
    <div>
      <SectionHeader
        icon={<BookMarked size={18} />}
        title="Ringkasan Capaian Jenjang"
        badge={`${jenjangList.length} jenjang Â· Tahun ${tahun}`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jenjangList.filter(Boolean).map((jenjang) => {
          const j = jenjang ?? "";
          const items = ringkasan.filter((r) => r.Jenjang === jenjang);
          const gradient = getJenjangGradient(j);

          return (
            <div
              key={jenjang}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Header Jenjang */}
              <div
                className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center gap-3`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                  {j.includes("SD") && (
                    <School size={14} className="text-white" />
                  )}
                  {j.includes("SMP") && (
                    <BookOpen size={14} className="text-white" />
                  )}
                  {j.includes("SMA") && (
                    <GraduationCap size={14} className="text-white" />
                  )}
                  {j.includes("PAUD") && (
                    <Building2 size={14} className="text-white" />
                  )}
                </div>
                <div>
                  <span className="font-black text-white text-base">
                    {jenjang}
                  </span>
                  <p className="text-white/60 text-[10px] mt-0.5">
                    {items.length} indikator prioritas
                  </p>
                </div>
              </div>

              {/* List Indikator */}
              <div className="divide-y divide-slate-100/70">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="px-5 py-3.5 hover:bg-slate-50/80 transition flex items-start gap-3"
                  >
                    <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        {item.Capaian}
                      </p>
                      <p className="text-xs text-slate-700 font-semibold leading-tight">
                        {item["Indikator Prioritas"]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}