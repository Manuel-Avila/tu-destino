import { Router } from 'express';
import multer from 'multer';
import {
  changePassword,
  login,
  me,
  register,
  updateProfile,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  changePasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from '../validators/auth.validators.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes JPG, PNG o WebP.'));
    }
    return cb(null, true);
  },
});

function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen de perfil no puede superar los 5 MB.'
      : err.message || 'No se pudo procesar la imagen de perfil.';
    return res.status(400).json({ errors: { avatar: message } });
  });
}

router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);

router.get('/me', requireAuth, me);
router.put(
  '/profile',
  requireAuth,
  uploadAvatar,
  validateRequest(profileSchema),
  updateProfile
);
router.put(
  '/password',
  requireAuth,
  authRateLimiter,
  validateRequest(changePasswordSchema),
  changePassword
);

export default router;
