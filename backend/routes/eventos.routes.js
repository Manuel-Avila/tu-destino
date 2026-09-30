import { Router } from 'express';
import { getEventos, getEvento, confirmarAsistencia, createEvento, updateEvento, deleteEvento } from '../controllers/eventos.controller.js';
import { requireFormsSecret } from '../middleware/formsWebhook.middleware.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getEventos);
router.get('/:slug', getEvento);
// Lo llama Google Forms (Apps Script) al recibir una respuesta → actualiza la convocatoria.
router.post('/:slug/asistencia', requireFormsSecret, confirmarAsistencia);

router.post('/', requireAdmin, createEvento);
router.put('/:slug', requireAdmin, updateEvento);
router.delete('/:slug', requireAdmin, deleteEvento);

export default router;
