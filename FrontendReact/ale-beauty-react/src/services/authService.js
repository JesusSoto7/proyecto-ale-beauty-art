export async function register({ email, password, password_confirmation, nombre, apellido }) {
  const response = await fetch('https://localhost:4000/api/v1/auth/sign_up', {
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
  const response = await fetch('https://localhost:4000/api/v1/auth/sign_in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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