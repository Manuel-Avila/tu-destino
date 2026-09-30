import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/destinos.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);

router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, remove);

export default router;
