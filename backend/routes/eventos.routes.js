import { Router } from 'express';
import { getEventos, getEvento, getParticipantesEvento, confirmarAsistencia, inscribirse, cancelarInscripcion, misInscripciones, createEvento, updateEvento, deleteEvento } from '../controllers/eventos.controller.js';
import { requireFormsSecret } from '../middleware/formsWebhook.middleware.js';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/', getEventos);
router.get('/mis-inscripciones', requireAuth, misInscripciones);
router.delete('/:slug/inscripcion', requireAuth, cancelarInscripcion);
router.get('/:slug/participantes', requireAdmin, getParticipantesEvento);
router.get('/:slug', getEvento);
router.post('/:slug/inscripcion', requireAuth, inscribirse);
router.post('/:slug/asistencia', requireFormsSecret, confirmarAsistencia);

router.post('/', requireAdmin, upload.array('imagenes'), createEvento);
router.put('/:slug', requireAdmin, upload.array('imagenes'), updateEvento);
router.delete('/:slug', requireAdmin, deleteEvento);

export default router;
