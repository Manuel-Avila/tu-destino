import { Router } from 'express';
import { getEventos, getEvento, confirmarAsistencia } from '../controllers/eventos.controller.js';
import { requireFormsSecret } from '../middleware/formsWebhook.middleware.js';

const router = Router();

router.get('/', getEventos);
router.get('/:slug', getEvento);
// Lo llama Google Forms (Apps Script) al recibir una respuesta → actualiza la convocatoria.
router.post('/:slug/asistencia', requireFormsSecret, confirmarAsistencia);

export default router;
