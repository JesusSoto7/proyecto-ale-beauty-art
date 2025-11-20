import dayjs from 'dayjs';

const BASE_URL = 'https://localhost:4000';
const API_PATH = '/api/v1/admin/orders';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function fetchJSON(url) {
  const token = getToken();
  if (!token) throw new Error('No hay token (usuario no autenticado)');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const text = ct.includes('text/html')
      ? res.statusText
      : await res.text().catch(() => '');
    throw new Error(`Error ${res.status}: ${text || 'Fallo en la petición'}`);
  }
  return res.json();
}

export async function getSalesBounds() {
  return fetchJSON(`${BASE_URL}${API_PATH}/sales_bounds`);
}

export async function getSalesData({ startDate, endDate, metric, level }) {
  const endpoint =
    level === 'category'
      ? metric === 'products'
        ? 'products_sold_by_category'
        : 'sales_by_category'
      : metric === 'products'
        ? 'products_sold_by_subcategory'
        : 'sales_by_subcategory';

  const params = new URLSearchParams();
  params.append('start_date', dayjs(startDate).startOf('day').toDate().toISOString());
  params.append('end_date', dayjs(endDate).endOf('day').toDate().toISOString());

  const url = `${BASE_URL}${API_PATH}/${endpoint}?${params.toString()}`;
  const json = await fetchJSON(url);
  return (json || []).map(r => ({
    id: r.id,
    name: r.name,
    imagen_url: r.imagen_url || null,
    value:
      metric === 'products'
        ? Number(r.total_products ?? r.total_qty ?? 0)
        : Number(r.total_sales ?? 0),
  }));
}