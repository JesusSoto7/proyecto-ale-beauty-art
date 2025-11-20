import { getChartDataUrl, downloadChartPNG } from '../utils/imageCapture.js';
import { exportPDF } from '../utils/pdfExport.js';
import { exportCSV } from '../utils/csvExport.js';
import dayjs from 'dayjs';

export function useExportActions({ metric, level, startDate, endDate, rows, summary }) {
  const baseName = () =>
    `${metric === 'revenue' ? 'ganancias' : 'productos'}_${level}_${dayjs(startDate).format('YYYYMMDD')}_${dayjs(endDate).format('YYYYMMDD')}`;

  async function handlePNG(chartRef) {
    if (!chartRef?.current) return;
    await downloadChartPNG(chartRef.current, baseName());
  }

  async function handlePDF(chartRef, title) {
    if (!chartRef?.current || !summary) return;
    const dataUrl = await getChartDataUrl(chartRef.current);
    await exportPDF({
      title,
      startDate: summary.start,
      endDate: summary.end,
      summaryTotal: summary.total,
      metric,
      rows,
      chartDataUrl: dataUrl,
      filenameBase: baseName(),
    });
  }

  function handleCSV() {
    if (!summary) return;
    exportCSV({
      rows,
      metric,
      level,
      startDate: summary.start,
      endDate: summary.end,
    });
  }

  return { handlePNG, handlePDF, handleCSV };
}