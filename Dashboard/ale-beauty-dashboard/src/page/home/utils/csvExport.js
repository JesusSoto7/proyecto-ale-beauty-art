export function exportCSV({ rows, metric, level, startDate, endDate }) {
  if (!rows || rows.length === 0) return;
  const header = 'id,nombre,valor\n';
  const lines = rows
    .map(r => `${r.id},"${(r.name || '').replace(/"/g, '""')}",${r.value}`)
    .join('\n');
  const csv = header + lines;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${metric === 'revenue' ? 'ganancias' : 'productos'}_${level}_${formatDate(startDate)}_${formatDate(endDate)}.csv`;
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}