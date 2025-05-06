import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventsController.js';

const router = express.Router();

// Rutas CRUD
router.get('/', getEvents); // Obtener todos los eventos
router.get('/:id', getEventById); // Obtener un evento por ID
router.post('/', createEvent); // Crear un nuevo evento
router.put('/:id', updateEvent); // Actualizar un evento existente
router.delete('/:id', deleteEvent); // Eliminar un evento

export default router;