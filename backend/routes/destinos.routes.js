import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/destinos.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);

router.post('/', requireAdmin, upload.single('image'), create);
router.put('/:id', requireAdmin, upload.single('image'), update);
router.delete('/:id', requireAdmin, remove);

export default router;
