import { Router } from 'express';
import { register, login, me, googleAuth } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Rutas públicas
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/google', authRateLimiter, googleAuth);

// Ruta protegida: requiere "Authorization: Bearer <token>"
router.get('/me', requireAuth, me);

export default router;
