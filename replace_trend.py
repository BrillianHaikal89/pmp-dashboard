import os

filepath = r'c:\BBPMP\pmp-dashboard\app\dashboard-provinsi\components\grafik-kabkot\2025.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject the new component before the main export
new_component = """
// ── Trend Indikator 2025 (Khusus) ────────────────────────────────────────────────────────────
function TrendIndikator2025() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [jenjangList, setJenjangList] = useState<string[]>([]);
  const [activeJenjang, setActiveJenjang] = useState<string>("SMA Umum");

  useEffect(() => {
    setLoading(true);
    // Note: space before .json to match the actual file name
    fetch("/dataProvinsi/2025/indikator_prioritas_menurun_meningkat .json")
      .then(r => r.json())
      .then(d => {
        setData(d);
        const jList = Array.from(new Set(d.map((x:any) => x.jenjang))).sort() as string[];
        if (jList.length > 0 && !jList.includes(activeJenjang)) {
          setActiveJenjang(jList.find((x: string) => x.includes("SMA")) || jList[0]);
        }
        setJenjangList(["Semua", ...jList]);
        setLoading(false);
      })
      .catch(e => {
        console.error("Gagal memuat data trend", e);
        setLoading(false);
      });
  }, []);

  const chartData = useMemo(() => {
    if (!data.length) return [];
    const filtered = data.filter((d: any) => 
      (activeJenjang === "Semua" || d.jenjang === activeJenjang) && 
      d.status === "Semua"
    );

    const kabMap: Record<string, {naik: number, turun: number, tetap: number}> = {};
    for (const r of filtered) {
       if (!kabMap[r.kab_kota]) kabMap[r.kab_kota] = {naik: 0, turun: 0, tetap: 0};
       if (r.perubahan === "Naik") kabMap[r.kab_kota].naik++;
       else if (r.perubahan === "Turun") kabMap[r.kab_kota].turun++;
       else if (r.perubahan === "Tidak Berubah") kabMap[r.kab_kota].tetap++;
    }
    
    return Object.entries(kabMap).map(([kab, counts]) => ({
       kab_kota: kab.replace("Kab. ", "").replace("Kota ", "Kota "),
       "Meningkat": counts.naik,
       "Menurun": counts.turun,
       "Tidak Berubah": counts.tetap,
       total: counts.naik + counts.turun + counts.tetap
    })).filter(d => d.total > 0).sort((a,b) => b["Meningkat"] - a["Meningkat"]);
  }, [data, activeJenjang]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Tren Indikator Prioritas (2024 ➔ 2025)</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Grafik capaian indikator prioritas menurun dan meningkat 27 Kab/kota per jenjang</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {jenjangList.map(j => (
            <button key={j} onClick={() => setActiveJenjang(j)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                activeJenjang === j
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}>{j}</button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Memuat tren...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">Tidak ada data untuk jenjang {activeJenjang}</div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: Math.max(700, chartData.length * 40) }}>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 80 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="kab_kota" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} angle={-45} textAnchor="end" interval={0} height={80} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="Meningkat" stackId="a" fill="#10b981" />
                  <Bar dataKey="Menurun" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Tidak Berubah" stackId="a" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
"""

if "function TrendIndikator2025()" not in content:
    content = content.replace("// ── Main Component ────────────────────────────────────────────────────────────", new_component)

# 2. Replace the Grafik 3 invocation
grafik3_old = """      {/* 📊 Grafik 3: Trend Indikator Prioritas 📊 */}
      <div className="mt-8 px-6 pb-6 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="text-base font-black text-slate-800">3. Tren Indikator Prioritas — Naik & Turun per Kab/Kota</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-3">
          Berapa banyak indikator yang meningkat atau menurun dibanding tahun sebelumnya
        </p>
        {TrendChart && (
          <TrendChart
            title={`Tren Indikator Prioritas (${tahun === '2024' ? '2023 ➔ 2024' : '2024 ➔ 2025'})`}
            data={allKabkotData}
            jenjangList={chartJenjangAll}
            activeJenjang={chartTrendIndJenjang}
            onJenjangChange={setChartTrendIndJenjang}
            tahun={tahun}
            indikatorKeys={allChartIndKeys && allChartIndKeys.length > 0 ? allChartIndKeys : chartIndKeys}
            colorFn={getIndColor}
          />
        )}
      </div>"""

grafik3_new = """      {/* 📊 Grafik 3: Trend Indikator Prioritas (Custom) 📊 */}
      <div className="mt-8 px-6 pb-6 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="text-base font-black text-slate-800">3. Tren Indikator Prioritas — Naik & Turun per Kab/Kota</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-3">
          Berapa banyak indikator yang meningkat atau menurun dibanding tahun sebelumnya
        </p>
        <TrendIndikator2025 />
      </div>"""

# Try to replace safely
import re
# Because formatting might be slightly different, use a robust replace
pattern = re.compile(r'\{\/\* 📊 Grafik 3: Trend Indikator Prioritas 📊 \*\/}.*?<\/div>', re.DOTALL)
if pattern.search(content):
    content = pattern.sub(grafik3_new, content)
else:
    print("WARNING: Could not find Grafik 3 block to replace.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
