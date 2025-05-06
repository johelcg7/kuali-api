import { EventsService } from '../services/eventsService.js';

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
    const updatedEvent = await EventsService.update(parseInt(id), {
      name,
      type,
      location,
      fecha,
      description,
      company_id,
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
    await EventsService.delete(parseInt(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el evento.' });
  }
};