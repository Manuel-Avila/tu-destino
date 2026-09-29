import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { resenaSchema } from '../validators/resenas.validators.js';
import {
  deleteResenaPropia,
  getMisResenas,
  getResenasDestino,
  postResena,
} from '../controllers/resenas.controller.js';

const router = Router();

// Todo el módulo de reseñas exige sesión iniciada.
router.use(requireAuth);

router.get('/mias', getMisResenas);
router.get('/destino/:destinoId', getResenasDestino);
router.post('/destino/:destinoId', validateRequest(resenaSchema), postResena);
router.delete('/:id', deleteResenaPropia);

export default router;
