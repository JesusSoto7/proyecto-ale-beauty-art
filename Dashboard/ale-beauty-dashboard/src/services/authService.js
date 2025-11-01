// API Configuration
const API_BASE_URL = 'https://localhost:4000/api/v1';

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/sign_in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al iniciar sesión');
  }

  const data = await response.json();
  return data;
}

export async function logout() {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE_URL}/auth/sign_out`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.warn('Error cerrando sesión:', err);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('roles');
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function hasRole(role) {
  const roles = JSON.parse(localStorage.getItem('roles')) || [];
  return roles.includes(role);
}

export function isAdmin() {
  return hasRole('admin');
}