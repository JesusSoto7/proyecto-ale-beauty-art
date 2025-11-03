import { parseJwt } from './jwt';
import { apiPost } from './api.js';

const LOGIN_PATH = import.meta.env.VITE_AUTH_LOGIN_PATH ?? '/api/v1/auth/sign_in';

export async function login({ email, password }) {
  const payload = { email, password };
  const data = await apiPost(LOGIN_PATH, payload);

  if (!data?.token) {
    throw new Error(data?.error || data?.message || 'Respuesta de login inválida');
  }
  if (!data.user) data.user = {};
  if (!Array.isArray(data.user.roles)) data.user.roles = [];

  return data;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getRoles() {
  try {
    return JSON.parse(localStorage.getItem('roles') || '[]');
  } catch {
    return [];
  }
}

export function getTokenPayload(token = getToken()) {
  if (!token) return null;
  return parseJwt(token);
}

export function getTokenExpMs(token = getToken()) {
  const payload = getTokenPayload(token);
  const expSec = payload?.exp;
  return typeof expSec === 'number' ? expSec * 1000 : null;
}

export function isTokenExpired(token = getToken()) {
  const expMs = getTokenExpMs(token);
  if (!expMs) return true; 
  return Date.now() >= expMs;
}

export function msUntilExpiry(token = getToken()) {
  const expMs = getTokenExpMs(token);
  if (!expMs) return 0;
  return Math.max(0, expMs - Date.now());
}

export function isAuthenticated() {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
}

export function isAdmin() {
  return getRoles().includes('admin');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('roles');
}