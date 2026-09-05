/**
 * Rate limiter simple en memoria, pensado solo para las rutas de auth
 * (registro/login) y para bloquear ráfagas de intentos desde una misma IP.
 *
 * Nota: al vivir en memoria del proceso, esto se reinicia si el servidor
 * se reinicia y no se comparte entre varias instancias. Para producción
 * con múltiples réplicas, reemplázalo por algo respaldado en Redis
 * (por ejemplo, la librería "rate-limiter-flexible" o "express-rate-limit"
 * con un store de Redis).
 */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 10;

const attemptsByIp = new Map();

export function authRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  const entry = attemptsByIp.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  attemptsByIp.set(ip, entry);

  if (entry.count > MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (WINDOW_MS - (now - entry.windowStart)) / 1000
    );
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      error: 'Demasiados intentos. Intenta de nuevo más tarde.',
    });
  }

  next();
}
