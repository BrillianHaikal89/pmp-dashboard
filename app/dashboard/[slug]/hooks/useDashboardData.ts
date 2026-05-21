// hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import { DashData, IndikatorPrioritasRow } from "../types";

export function useDashboardData(slug: string, tahun: "2024" | "2025") {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load main dashboard data
        const response = await fetch(`/data/${slug}/dashboard_data_${tahun}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawData = await response.json();
        
        // Load indikator prioritas if available
        let ipRows: IndikatorPrioritasRow[] = [];
        let satdikTren = null;
        
        try {
          const ipResponse = await fetch(`/indikatorPrioritasKabKota/${tahun}/${slug}/dashboard_data_${tahun}.json`);
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipRows = ipData?.indikator?.data ?? [];
            satdikTren = ipData?.satdik ?? null;
          }
        } catch (e) {
          console.warn("No indikator prioritas data", e);
        }
        
        setData({ 
          ...rawData, 
          indikator_prioritas: ipRows,
          satdik_tren: satdikTren
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [slug, tahun]);
  
  return { data, loading, error };
}