import { EventsService } from '../services/eventsService.js';
import { logAction } from '../services/logAction.js';

// Obtener todos los eventos
export const getEvents = async (req, res) => {
  try {
    const events = await EventsService.getAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los eventos.' });
  }
};

// Obtener un evento por ID
export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await EventsService.getById(parseInt(id));
    if (!event) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el evento.' });
  }
};

// Crear un nuevo evento
export const createEvent = async (req, res) => {
  const { name, type, location, fecha, description, company_id } = req.body;
  try {
    const newEvent = await EventsService.create({
      name,
      type,
      location,
      fecha,
      description,
      company_id,
    });

    // Registrar acción de creación de evento
    logAction({
      userId: req.session.userId,
      action: 'create_event',
      details: {
        event_id: newEvent.id,
        event_name: newEvent.name,
        event_type: newEvent.type,
        created_by: req.session.userEmail || 'system',
      }
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el evento.' });
  }
};

// Actualizar un evento existente
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, type, location, fecha, description, company_id } = req.body;
  try {
    const eventId = parseInt(id);
    // Obtener datos actuales del evento antes de actualizar
    const oldEvent = await EventsService.getById(eventId);

    const updatedEvent = await EventsService.update(eventId, {
      name,
      type,
      location,
      fecha,
      description,
      company_id,
    });

    // Registrar acción de actualización de evento
    logAction({
      userId: req.session.userId,
      action: 'update_event',
      details: {
        event_id: updatedEvent.id,
        event_name: updatedEvent.name,
        updated_by: req.session.userEmail || 'system',
        changes: {
          // Comparar oldEvent con req.body para registrar solo los cambios enviados
          ...(req.body.name !== undefined && req.body.name !== oldEvent?.name && { name: { from: oldEvent?.name, to: req.body.name } }),
          ...(req.body.type !== undefined && req.body.type !== oldEvent?.type && { type: { from: oldEvent?.type, to: req.body.type } }),
          ...(req.body.location !== undefined && req.body.location !== oldEvent?.location && { location: { from: oldEvent?.location, to: req.body.location } }),
          ...(req.body.fecha !== undefined && req.body.fecha !== oldEvent?.fecha && { fecha: { from: oldEvent?.fecha, to: req.body.fecha } }),
          ...(req.body.description !== undefined && req.body.description !== oldEvent?.description && { description: { from: oldEvent?.description, to: req.body.description } }),
          ...(req.body.company_id !== undefined && req.body.company_id !== oldEvent?.company_id && { company_id: { from: oldEvent?.company_id, to: req.body.company_id } }),
        }
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el evento.' });
  }
};

// Eliminar un evento
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const eventId = parseInt(id);
    // Obtener datos del evento antes de eliminar
    const eventToDelete = await EventsService.getById(eventId);

    await EventsService.delete(eventId);

    // Registrar acción de eliminación de evento
    if (eventToDelete) {
      logAction({
        userId: req.session.userId,
        action: 'delete_event',
        details: {
          event_id: eventToDelete.id,
          event_name: eventToDelete.name,
          event_type: eventToDelete.type,
          deleted_by: req.session.userEmail || 'system',
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el evento.' });
  }
};