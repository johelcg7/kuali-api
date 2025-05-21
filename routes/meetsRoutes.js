import express from 'express';
import { PrismaClient } from '@prisma/client';
import { logAction } from '../services/logAction.js';
import { createCalendarEvent } from '../services/googleCalendarService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las reuniones
router.get('/', async (req, res) => {
  try {
    const meets = await prisma.meets.findMany({
      include: {
        lead: true,
      },
    });
    res.json(meets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva reunión
router.post('/', async (req, res) => {
  try {
    const { title, description, fecha, duration, leadId, recordatorio } = req.body;

    // Crear evento en Google Calendar y obtener el enlace de Meet
    const { eventId, meetLink } = await createCalendarEvent({
      title,
      description: `${description}\n\nRecordatorio: ${recordatorio || 'No hay recordatorio'}`,
      fecha,
      duration,
    });

    // Crear reunión en la base de datos
    const meet = await prisma.meets.create({
      data: {
        title,
        description,
        fecha: new Date(fecha),
        duration,
        link: meetLink,
        recordatorio,
        calendarEventId: eventId,
        leadId: leadId || null,
        userId: req.session.userId,
      },
      include: {
        lead: true,
        user: true,
      },
    });

    // Registrar la acción
    await logAction({
      userId: req.session.userId,
      leadId: leadId || null,
      action: 'create_meet',
      details: {
        meetId: meet.id,
        title: meet.title,
        fecha: meet.fecha,
        meetUrl: meet.link,
      },
    });

    res.status(201).json(meet);
  } catch (error) {
    console.error('Error creating meet:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
