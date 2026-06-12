import type { Chart as ChartJS, Plugin } from "chart.js";
import type { SatdikBandingChartOptions } from "./chartOptions";

export const dataLabelsPlugin: Plugin<"bar"> = {
  id: "satdikDataLabels",
  afterDatasetsDraw(chart: ChartJS<"bar">) {
    const { ctx, data } = chart;
    const options = chart.options as SatdikBandingChartOptions;
    const mode = options._sbcMode ?? "absolut";
    const suffix = mode === "persen" ? "%" : "";

    data.datasets.forEach((dataset, dsIdx) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (meta.hidden) return;

      meta.data.forEach((bar, idx) => {
        const raw = Number(dataset.data[idx] ?? 0);
        if (raw === 0) return;

        ctx.save();
        ctx.font = "500 10px 'Geist', 'DM Sans', sans-serif";
        ctx.fillStyle = "#5a5a58";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${raw}${suffix}`, bar.x, bar.y - 3);
        ctx.restore();
      });
    });
  },
};
