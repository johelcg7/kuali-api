import { Router } from 'express';
import { LogsController } from '../controllers/logsController.js';

const router = Router();

// Ruta protegida solo para admin
router.get('/', LogsController.getAll);

// Nueva ruta para eliminar un registro por ID
router.delete('/:id', LogsController.deleteLog);

export default router;
