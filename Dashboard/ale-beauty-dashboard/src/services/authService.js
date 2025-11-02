import { parseJwt } from './jwt';

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
  if (!expMs) return true; // si no hay exp, lo tratamos como inválido/expirado
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