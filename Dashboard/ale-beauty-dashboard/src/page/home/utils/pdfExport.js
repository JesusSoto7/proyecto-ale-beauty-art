// Generación de PDF con jsPDF
import { formatCurrencyFull, formatUnitsFull } from '../utils/formatters.js';

async function loadJsPDF() {
  const jspdfModule = await import('jspdf');
  return jspdfModule.jsPDF;
}

function formatDate(d) {
  return new Intl.DateTimeFormat('es-CO').format(d);
}

/**
 * Genera y descarga el PDF
 * @param {Object} params
 *  - title
 *  - startDate (Date)
 *  - endDate (Date)
 *  - summaryTotal (number)
 *  - metric ('revenue'|'products')
 *  - rows [{ id,name,value }]
 *  - chartDataUrl (string) capturado previamente
 *  - filenameBase (string)
 */
export async function exportPDF({
  title,
  startDate,
  endDate,
  summaryTotal,
  metric,
  rows,
  chartDataUrl,
  filenameBase,
}) {
  const jsPDF = await loadJsPDF();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = margin;

  // Espaciados configurables
  const HEADER_TO_LINE_OFFSET = 6;   // distancia de encabezados a la línea
  const LINE_TO_FIRST_ROW_OFFSET = 10; // distancia de la línea a la primera fila
  const ROW_HEIGHT = 14;             // altura por fila de datos
  const MAX_NAME_CHARS = 42;         // truncamiento
  const VALUE_COL_WIDTH = 110;

  // Encabezado
  pdf.setFontSize(16);
  pdf.text(title, margin, y);
  y += 22;
  pdf.setFontSize(11);
  pdf.text(`Rango: ${formatDate(startDate)} - ${formatDate(endDate)}`, margin, y);
  y += 16;
  pdf.text(
    `Total: ${
      metric === 'revenue'
        ? formatCurrencyFull(summaryTotal)
        : `${formatUnitsFull(summaryTotal)} uds`
    }`,
    margin,
    y
  );
  y += 20;

  // Gráfica
  const imgWidth = pageWidth - margin * 2;
  const imgProps = pdf.getImageProperties(chartDataUrl);
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  pdf.addImage(chartDataUrl, 'PNG', margin, y, imgWidth, imgHeight);
  y += imgHeight + 28;

  // Detalle
  pdf.setFontSize(12);
  pdf.text('Detalle:', margin, y);
  y += 16;

  const colNameX = margin;
  const colValueX = pageWidth - margin - VALUE_COL_WIDTH;

  // Encabezados de la tabla
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text('Nombre', colNameX, y);
  pdf.text(metric === 'revenue' ? 'Monto' : 'Cantidad', colValueX, y);
  pdf.setFont(undefined, 'normal');

  // Línea separadora con mayor espacio
  const lineY = y + HEADER_TO_LINE_OFFSET;
  pdf.setDrawColor(100);
  pdf.setLineWidth(0.5);
  pdf.line(margin, lineY, pageWidth - margin, lineY);

  // Avanza a la primera fila dejando más aire
  y = lineY + LINE_TO_FIRST_ROW_OFFSET;

  rows.forEach(r => {
    // Salto de página
    if (y > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      y = margin;
      pdf.setFontSize(12);
      pdf.text('Detalle (cont.):', margin, y);
      y += 16;

      // Reimprimir encabezados
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Nombre', colNameX, y);
      pdf.text(metric === 'revenue' ? 'Monto' : 'Cantidad', colValueX, y);
      pdf.setFont(undefined, 'normal');

      const contLineY = y + HEADER_TO_LINE_OFFSET;
      pdf.setDrawColor(100);
      pdf.setLineWidth(0.5);
      pdf.line(margin, contLineY, pageWidth - margin, contLineY);
      y = contLineY + LINE_TO_FIRST_ROW_OFFSET;
    }

    // Truncamiento del nombre
    let name = r.name || '';
    if (name.length > MAX_NAME_CHARS) {
      name = name.slice(0, MAX_NAME_CHARS - 3) + '...';
    }

    // Valor formateado
    const valueStr =
      metric === 'revenue'
        ? formatCurrencyFull(r.value)
        : `${formatUnitsFull(r.value)} uds`;

    pdf.setFontSize(10);
    pdf.text(name, colNameX, y);
    pdf.text(valueStr, colValueX, y);

    y += ROW_HEIGHT;
  });

  pdf.save(`${filenameBase}.pdf`);
}