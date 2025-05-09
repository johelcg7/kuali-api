import { Router } from 'express';
import { TemplatesController } from '../controllers/templatesController.js';

const router = Router();

router.get('/', TemplatesController.getAll);
router.get('/:id', TemplatesController.getById);
router.post('/', TemplatesController.create);
router.put('/:id', TemplatesController.update);
router.delete('/:id', TemplatesController.delete);

export default router;