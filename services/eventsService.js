import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const EventsService = {
  // Obtener todos los eventos
  getAll: async () => {
    return prisma.events.findMany();
  },

  // Obtener un evento por ID
  getById: async (id) => {
    return prisma.events.findUnique({ where: { id } });
  },

  // Crear un nuevo evento
  create: async (data) => {
    return prisma.events.create({ data });
  },

  // Actualizar un evento existente
  update: async (id, data) => {
    return prisma.events.update({ where: { id }, data });
  },

  // Eliminar un evento
  delete: async (id) => {
    return prisma.events.delete({ where: { id } });
  },
};