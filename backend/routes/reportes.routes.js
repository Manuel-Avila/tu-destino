import { Router } from 'express';
import multer from 'multer';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import { reportRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createReporteSchema, updateReporteStatusSchema } from '../validators/reportes.validators.js';
import {
  createReporte,
  getReporte,
  getReporteByFolio,
  consultarFolios,
  getMisReportes,
  getReportes,
  patchReporteStatus,
} from '../controllers/reportes.controller.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF.'));
    }
    return cb(null, true);
  },
});

function uploadEvidence(req, res, next) {
  upload.array('evidencias', 5)(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Cada imagen debe pesar como máximo 10 MB.'
      : err.message || 'No se pudieron procesar las evidencias.';
    return res.status(400).json({ error: message });
  });
}

router.post('/', reportRateLimiter, optionalAuth, uploadEvidence, validateRequest(createReporteSchema), createReporte);
router.get('/folio/:folio', reportRateLimiter, getReporteByFolio);
router.post('/consulta', reportRateLimiter, consultarFolios);
router.get('/mios', requireAuth, getMisReportes);
router.get('/', requireAdmin, getReportes);
router.get('/:id', requireAdmin, getReporte);
router.patch('/:id/estado', requireAdmin, validateRequest(updateReporteStatusSchema), patchReporteStatus);

export default router;
