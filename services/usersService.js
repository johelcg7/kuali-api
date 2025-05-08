import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const UsersService = {
  // Obtener todos los usuarios
  getAll: async () => {
    return prisma.users.findMany({
      include: { leads: true }, // Incluir los leads relacionados
    });
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    return prisma.users.findUnique({
      where: { id },
      include: { leads: true }, // Incluir los leads relacionados
    });
  },

    // Obtener un usuario por email
    getByEmail: async (email) => {
      return prisma.users.findUnique({
        where: { email },
      });
    },

  // Crear un nuevo usuario
  create: async (data) => {
    return prisma.users.create({ data });
  },

  // Actualizar un usuario existente
  update: async (id, data) => {
    return prisma.users.update({
      where: { id },
      data,
    });
  },

  // Eliminar un usuario
  delete: async (id) => {
    return prisma.users.delete({ where: { id } });
  },
};