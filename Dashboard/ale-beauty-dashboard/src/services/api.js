// En dev usa http://localhost:4000 si tu backend no tiene TLS
export const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:4000';

let onUnauthorized = null;

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  try {
    data = contentType.includes('application/json') ? await res.json() : await res.text();
  } catch {
    data = null;
  }
  return data;
}

async function apiRequest(method, path, { token, body, headers: extraHeaders, ...options } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    if (res.status === 401 && typeof onUnauthorized === 'function') {
      try { onUnauthorized(data); } catch {}
    }
    const message =
      typeof data === 'object' && data && (data.error || data.message)
        ? (data.error || data.message)
        : res.statusText || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }
  return data;
}

// Variante que también retorna cabeceras (útil para login)
export async function apiPostRaw(path, body, { token, headers, ...options } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const data = await parseResponse(res);

  if (!res.ok) {
    if (res.status === 401 && typeof onUnauthorized === 'function') {
      try { onUnauthorized(data); } catch {}
    }
    const message =
      typeof data === 'object' && data && (data.error || data.message)
        ? (data.error || data.message)
        : res.statusText || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }
  return { data, headers: res.headers, status: res.status };
}

export function apiGet(path, token, options = {}) {
  return apiRequest('GET', path, { token, ...options });
}
export function apiPost(path, body, token, options = {}) {
  return apiRequest('POST', path, { token, body, ...options });
}
export function apiPatch(path, body, token, options = {}) {
  return apiRequest('PATCH', path, { token, body, ...options });
}
export function apiDelete(path, token, options = {}) {
  return apiRequest('DELETE', path, { token, ...options });
}