// app/dashboard/[slug]/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Menu, LayoutDashboard } from "lucide-react";

// Components
import { Sidebar } from "./components/common/Sidebar";
import { YearSwitcher } from "./components/common/YearSwitcher";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { RingkasanSingle, RingkasanBanding } from "./components/ringkasan";
import { IndikatorPrioritasSingle, IndikatorPrioritasBanding } from "./components/prioritas";
import { KabkotSingle, KabkotBanding } from "./components/kabkot";
import { SatdikSingle, SatdikBanding } from "./components/satdik";
import { PaudSingle, PaudBanding } from "./components/paud";
import { AkarPage } from "./components/akar";
import { PemdaTable, PemdaBanding } from "./components/pemda";

// Hooks & Utils
import { useDashboardData } from "./hooks/useDashboardData";
import { getWilayahInfo } from "./utils/helpers";
import { MENU } from "./utils/constants";
import { TahunFilter } from "./types";

function DashboardContent() {
  const params = useParams();
  const slug = params.slug as string;
  const wilayahInfo = getWilayahInfo(slug);
  
  const [active, setActive] = useState("ringkasan");
  const [tahun, setTahun] = useState<TahunFilter>("2024");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: data24, loading: loading24 } = useDashboardData(slug, "2024");
  const { data: data25, loading: loading25 } = useDashboardData(slug, "2025");
  
  const isLoading = tahun === "banding" ? (loading24 || loading25) : (tahun === "2025" ? loading25 : loading24);
  const activeData = tahun === "2025" ? data25 : data24;
  const activeLabel = MENU.find(m => m.id === active)?.label ?? "";
  
  if (wilayahInfo.type === "unknown") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Wilayah Tidak Ditemukan</h1>
          <p className="text-slate-500 mb-4">Maaf, wilayah yang Anda cari tidak tersedia.</p>
          <a href="/pilih-wilayah" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Kembali ke Pilih Wilayah
          </a>
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    if (isLoading) return <LoadingScreen msg={`Memuat data ${tahun === "banding" ? "2024 & 2025" : "tahun " + tahun}...`} />;
    
    switch (active) {
      case "ringkasan":
        if (tahun === "banding") return data24 && data25 ? <RingkasanBanding d24={data24} d25={data25} /> : <LoadingScreen />;
        return activeData ? <RingkasanSingle data={activeData} tahun={tahun} /> : <LoadingScreen />;
      
      case "prioritas":
        if (tahun === "banding") return data24 && data25 ? (
          <IndikatorPrioritasBanding 
            d24={data24.indikator_prioritas ?? []} 
            d25={data25.indikator_prioritas ?? []}
            satdik24={data24.satdik_tren ?? null}
            satdik25={data25.satdik_tren ?? null}
          />
        ) : <LoadingScreen />;
        return activeData ? <IndikatorPrioritasSingle data={activeData.indikator_prioritas ?? []} tahun={tahun} satdikTren={activeData.satdik_tren ?? null} /> : <LoadingScreen />;
      
      case "kabkot":
        if (tahun === "banding") return data24 && data25 ? <KabkotBanding d24={data24.kabkot ?? []} d25={data25.kabkot ?? []} /> : <LoadingScreen />;
        return activeData ? <KabkotSingle data={activeData.kabkot ?? []} tahun={tahun} /> : <LoadingScreen />;
      
      case "satdik":
        if (tahun === "banding") return data24 && data25 ? <SatdikBanding d24={data24.satdik ?? []} d25={data25.satdik ?? []} /> : <LoadingScreen />;
        return activeData ? <SatdikSingle data={activeData.satdik ?? []} tahun={tahun} /> : <LoadingScreen />;
      
      case "paud":
        if (tahun === "banding") return data24 && data25 ? <PaudBanding d24={data24.paud ?? []} d25={data25.paud ?? []} /> : <LoadingScreen />;
        return activeData ? <PaudSingle data={activeData.paud ?? []} tahun={tahun} /> : <LoadingScreen />;
      
      case "akar":
        if (tahun === "banding") return data24 && data25 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AkarPage data={data24.akar_masalah ?? []} tahun="2024" />
            <AkarPage data={data25.akar_masalah ?? []} tahun="2025" />
          </div>
        ) : <LoadingScreen />;
        return activeData ? <AkarPage data={activeData.akar_masalah ?? []} tahun={tahun} /> : <LoadingScreen />;
      
      case "pemda":
        if (tahun === "banding") return data24 && data25 ? <PemdaBanding d24={data24} d25={data25} /> : <LoadingScreen />;
        return activeData ? <PemdaTable data={activeData} tahun={tahun} /> : <LoadingScreen />;
      
      default:
        return null;
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        tahun={tahun}
        wilayahNama={wilayahInfo.displayName}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-5 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition" onClick={() => setSidebarOpen(true)}>
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-sm truncate">{activeLabel}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Rapor Pendidikan {wilayahInfo.displayName}</p>
          </div>
          
          <div className="flex-1 flex justify-center">
            <YearSwitcher tahun={tahun} setTahun={setTahun} />
          </div>
          
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {data24 && <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100"><span className="text-blue-400">2024</span> {data24.spm_value}</span>}
            {data25 && <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-100"><span className="text-violet-400">2025</span> {data25.spm_value}</span>}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function DynamicDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen msg="Loading..." />}>
      <DashboardContent />
    </Suspense>
  );
}