export const getChangeCategory = (raw: string): string => {
  const lower = raw.toLowerCase().trim();
  if (/naik/.test(lower)) return "Naik";
  if (/turun/.test(lower)) return "Turun";
  if (/tidak berubah|stabil/.test(lower)) return "Tidak Berubah";
  return "Tidak Tersedia";
};

export const getCapaiCategory = (labelCapaian: string): string => {
  const lower = labelCapaian?.toLowerCase().trim() || "";
  if (/baik/.test(lower)) return "Baik";
  if (/sedang/.test(lower)) return "Sedang";
  if (/kurang/.test(lower)) return "Kurang";
  return "Tidak Tersedia";
};

export const downloadChartAsPNG = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  import("html-to-image").then((htmlToImage) => {
    htmlToImage
      .toPng(element)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading chart:", error);
      });
  });
};
