
export const DEFAULT_LOCALE = 'es-CO';
export const DEFAULT_CURRENCY = 'COP';

// Cache para Intl.NumberFormat
const formatterCache = new Map();

function getCachedCurrencyFormatter(locale, currency, options) {
  const key = `${locale}|${currency}|${options.minimumFractionDigits}|${options.maximumFractionDigits}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, { style: 'currency', currency, ...options })
    );
  }
  return formatterCache.get(key);
}

// Moneda principal (COP) sin decimales por defecto
export function formatCurrencyFull(
  n,
  {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = {}
) {
  const num = Number(n || 0);
  if (!isFinite(num)) return '-';
  return getCachedCurrencyFormatter(locale, currency, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

// Números para el eje Y (sin símbolo). 0 decimales por defecto en COP.
export function formatAxisValue(
  n,
  { minimumFractionDigits = 0, maximumFractionDigits = 0 } = {}
) {
  const num = Number(n || 0);
  if (!isFinite(num)) return '0';
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

// Unidades (productos) siempre sin decimales
export function formatUnitsFull(n) {
  const num = Number(n || 0);
  if (!isFinite(num)) return '0';
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// "Nice number" para escalar el eje Y
export function getNiceNumber(value) {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const f = value / Math.pow(10, exp);
  let niceF;
  if (f < 1.5) niceF = 1;
  else if (f < 3) niceF = 2;
  else if (f < 7) niceF = 5;
  else niceF = 10;
  return niceF * Math.pow(10, exp);
}