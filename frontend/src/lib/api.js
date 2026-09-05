const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Envoltura simple sobre fetch para hablar con el backend.
 * - Agrega el header Authorization automáticamente si hay token guardado.
 * - Parsea el JSON de respuesta y lanza un error legible si algo falla,
 *   incluyendo los errores de validación por campo que manda el backend.
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    const err = new Error(
      'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.'
    );
    err.cause = networkErr;
    throw err;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Respuesta sin cuerpo JSON (poco común, pero no debe tronar).
  }

  if (!response.ok) {
    const err = new Error(
      (data && (data.error || 'Ocurrió un error inesperado.')) ||
        'Ocurrió un error inesperado.'
    );
    err.status = response.status;
    err.fieldErrors = data && data.errors ? data.errors : null;
    throw err;
  }

  return data;
}

export const api = {
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) =>
    request('/api/auth/login', { method: 'POST', body: payload }),
  google: (idToken) =>
    request('/api/auth/google', { method: 'POST', body: { idToken } }),
  me: (token) => request('/api/auth/me', { token }),
};
