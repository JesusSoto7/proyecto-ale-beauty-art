
// Carga dinámica de html2canvas
async function loadHtml2Canvas() {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas;
}

// Devuelve el dataURL de la imagen SIN descargar
export async function getChartDataUrl(chartElement) {
  if (!chartElement) throw new Error('No existe el elemento de la gráfica');
  const html2canvas = await loadHtml2Canvas();
  await new Promise(r => setTimeout(r, 40));
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    ignoreElements: (el) => el?.hasAttribute?.('data-export-ignore'),
  });
  return canvas.toDataURL('image/png');
}

// Descarga directamente la imagen como PNG
export async function downloadChartPNG(chartElement, filenameBase) {
  const dataUrl = await getChartDataUrl(chartElement);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filenameBase}.png`;
  a.click();
  return dataUrl;
}