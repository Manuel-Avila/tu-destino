import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware/auth.middleware.js';
import {
  create,
  getAll,
  remove,
  update,
} from '../controllers/educacion.controller.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Cualquier visitante puede leer las publicaciones.
router.get('/', getAll);

// Solo administradores pueden modificarlas.
router.post('/', requireAdmin, upload.single('imagen'), create);
router.put('/:id', requireAdmin, upload.single('imagen'), update);
router.delete('/:id', requireAdmin, remove);

export default router;
