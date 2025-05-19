import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const LogsService = {
  getAll: async () => {
    return prisma.logs.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        lead: true,
        template: true,
      },
    });
  },
  // Puedes agregar más métodos si necesitas filtrar o crear logs

  // Nueva función para eliminar un registro por ID
  delete: async (id) => {
    try {
      return await prisma.logs.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      console.error('Error al eliminar registro en servicio:', error);
      if (error.code === 'P2025') {
        throw new Error('Registro no encontrado');
      }
      throw new Error('Error al eliminar el registro');
    }
  },
};
