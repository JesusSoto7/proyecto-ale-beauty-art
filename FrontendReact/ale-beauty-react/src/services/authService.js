// API Configuration
const API_BASE_URL = 'https://localhost:4000/api/v1';

export async function register({ email, password, password_confirmation, nombre, apellido }) {
  const response = await fetch(`${API_BASE_URL}/auth/sign_up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, password_confirmation, nombre, apellido })

  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Error en el registro');
  }


  const data = await response.json();
  return data; // Puedes devolver usuario, token, etc. según lo que tu API responda
}


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
    throw new Error(errorData.message || 'Error al inciar sesión');
  }

  const data = await response.json();
  return data;
}

export async function forgotPassword({ email }) {
  const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al solicitar restablecimiento de contraseña');
  }

  const data = await response.json();
  return data;
}

export async function resetPassword({ reset_password_token, password, password_confirmation }) {
  const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ reset_password_token, password, password_confirmation }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Error al restablecer contraseña');
  }

  const data = await response.json();
  return data;
}