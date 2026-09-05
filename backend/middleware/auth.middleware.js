import { verifyAuthToken } from '../utils/token.js';

/**
 * Protege una ruta exigiendo un header "Authorization: Bearer <token>".
 * Si el token es válido, agrega req.user = { id, email } y continúa.
 * Si no, responde 401 y corta la cadena (nunca llama a next() con error silencioso).
 *
 * Uso:
 *   router.get('/perfil', requireAuth, controller);
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'No autorizado. Incluye un token válido en el header Authorization.',
    });
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'La sesión expiró, vuelve a iniciar sesión.'
        : 'Token inválido.';
    return res.status(401).json({ error: message });
  }
}
