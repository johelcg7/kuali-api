import { Router } from 'express';
import { LogsController } from '../controllers/logsController.js';

const router = Router();

// Ruta protegida solo para admin
router.get('/', LogsController.getAll);

// Ruta para eliminar todos los registros
router.delete('/', LogsController.deleteAll);

// Ruta para eliminar un registro específico
router.delete('/:id', LogsController.deleteLog);

export default router;
