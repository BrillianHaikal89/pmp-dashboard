import { useMemo, useState, type MouseEvent } from "react";
import { Download } from "lucide-react";

const PIE_COLORS = [
  "rgb(16, 185, 129)",
  "rgb(239, 68, 68)",
  "rgb(245, 158, 11)",
  "rgb(100, 116, 139)",
  "rgb(59, 130, 246)",
  "rgb(139, 92, 246)",
  "rgb(6, 182, 212)",
];
// ── Pie Chart Component with Tooltip ─────────────────────────
export function SimplePieChart({
  data,
  title,
  onDownload,
  chartId,
}: {
  data: { label: string; value: number; color?: string }[];
  title: string;
  onDownload: () => void;
  chartId: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const slices = useMemo(() => {
    return data.reduce(
      (acc, item, idx) => {
        const angle = total > 0 ? (item.value / total) * 360 : 0;
        const start = acc.currentAngle;
        const end = start + angle;

        const startRad = (start * Math.PI) / 180;
        const endRad = (end * Math.PI) / 180;

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;
        const color = item.color || PIE_COLORS[idx % PIE_COLORS.length];

        return {
          currentAngle: end,
          items: [
            ...acc.items,
            {
              pathData: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
              color,
            },
          ],
        };
      },
      { currentAngle: 0, items: [] as { pathData: string; color: string }[] },
    ).items;
  }, [data, total]);
  const handleMouseMove = (
    e: MouseEvent<SVGPathElement>,
    idx: number,
  ) => {
    setHoveredSlice(idx);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  return (
    <div
      id={chartId}
      className="bg-white rounded-xl border border-slate-200 p-4 relative"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-600">{title}</h4>
        {data.length > 0 && (
          <button
            onClick={onDownload}
            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Download sebagai PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Tidak ada data untuk ditampilkan
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-56 h-56">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {slices.map((slice, idx) => {
                return (
                  <path
                    key={idx}
                    d={slice.pathData}
                    fill={slice.color}
                    stroke="white"
                    strokeWidth="1"
                    className="transition-opacity duration-200 cursor-pointer hover:opacity-80"
                    onMouseMove={(e) => handleMouseMove(e, idx)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </svg>

            {hoveredSlice !== null && data[hoveredSlice] && (
              <div
                className="fixed z-50 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
                style={{
                  left: tooltipPos.x + 10,
                  top: tooltipPos.y - 30,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-semibold">{data[hoveredSlice].label}</div>
                <div className="text-slate-300">
                  {((data[hoveredSlice].value / total) * 100).toFixed(1)}% (
                  {data[hoveredSlice].value})
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs">
            {data.map((item, idx) => {
              const percentage =
                total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              const color = item.color || PIE_COLORS[idx % PIE_COLORS.length];
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-600 truncate">{item.label}</span>
                  <span className="text-slate-400 ml-auto">{percentage}%</span>
                  <span className="text-slate-500 font-medium">
                    ({item.value})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}







