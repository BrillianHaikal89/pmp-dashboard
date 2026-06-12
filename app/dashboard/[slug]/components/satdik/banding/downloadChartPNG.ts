import type { BarChartRef, LegendItem } from "./types";

type LegendRowItem = LegendItem & { textW: number };

export const downloadChartPNG = (
  chartRef: BarChartRef,
  filename: string,
  legendItems: LegendItem[],
) => {
  const chart = chartRef.current;
  if (!chart) return;

  const src = chart.canvas;
  const dpr = window.devicePixelRatio || 1;
  const pad = 16 * dpr;
  const swatchSize = 12 * dpr;
  const swatchGap = 6 * dpr;
  const itemGap = 16 * dpr;
  const fontSize = 11 * dpr;
  const lineH = swatchSize;

  const maxW = src.width - pad * 2;
  const tmp = document.createElement("canvas").getContext("2d");
  if (!tmp) return;

  tmp.font = `${fontSize}px 'DM Sans', sans-serif`;

  const rows: LegendRowItem[][] = [[]];
  let rowW = 0;
  legendItems.forEach((item) => {
    const textW = tmp.measureText(item.label).width;
    const itemW = swatchSize + swatchGap + textW + itemGap;
    if (rowW + itemW > maxW && rows[rows.length - 1].length > 0) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push({ ...item, textW });
    rowW += itemW;
  });

  const legendH = rows.length * (lineH + 6 * dpr) + pad * 1.5;
  const offscreen = document.createElement("canvas");
  offscreen.width = src.width;
  offscreen.height = src.height + legendH;

  const ctx = offscreen.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#fafaf8";
  ctx.fillRect(0, 0, offscreen.width, offscreen.height);
  ctx.drawImage(src, 0, 0);

  ctx.strokeStyle = "#e8e7e0";
  ctx.lineWidth = dpr;
  ctx.beginPath();
  ctx.moveTo(pad, src.height + pad * 0.5);
  ctx.lineTo(src.width - pad, src.height + pad * 0.5);
  ctx.stroke();

  ctx.font = `${fontSize}px 'DM Sans', sans-serif`;
  ctx.textBaseline = "middle";
  rows.forEach((row, ri) => {
    let x = pad;
    const y = src.height + pad + ri * (lineH + 6 * dpr) + lineH / 2;
    row.forEach(({ color, label }) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y - swatchSize / 2, swatchSize, swatchSize, 2 * dpr);
      ctx.fill();

      ctx.fillStyle = "#9a9990";
      ctx.fillText(label, x + swatchSize + swatchGap, y);
      x += swatchSize + swatchGap + ctx.measureText(label).width + itemGap;
    });
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = offscreen.toDataURL("image/png");
  link.click();
};
