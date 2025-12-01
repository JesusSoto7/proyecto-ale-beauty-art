export function formatCOP(value) {
  const roundedValue = Math.round(value);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedValue);
}
