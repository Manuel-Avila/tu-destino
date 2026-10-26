import { Router } from 'express';
import { getEventos, getEvento, confirmarAsistencia, inscribirse, misInscripciones, createEvento, updateEvento, deleteEvento } from '../controllers/eventos.controller.js';
import { requireFormsSecret } from '../middleware/formsWebhook.middleware.js';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/', getEventos);
// Va antes de '/:slug' para que no se confunda con un slug.
router.get('/mis-inscripciones', requireAuth, misInscripciones);
router.get('/:slug', getEvento);
// Inscripción desde el formulario de la app (usuario con sesión).
router.post('/:slug/inscripcion', requireAuth, inscribirse);
// Lo llama Google Forms (Apps Script) al recibir una respuesta → actualiza la convocatoria.
router.post('/:slug/asistencia', requireFormsSecret, confirmarAsistencia);

router.post('/', requireAdmin, upload.array('imagenes'), createEvento);
router.put('/:slug', requireAdmin, upload.array('imagenes'), updateEvento);
router.delete('/:slug', requireAdmin, deleteEvento);

export default router;
