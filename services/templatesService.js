import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TemplatesService = {
  getAll: async () => {
    return prisma.templates.findMany();
  },
  getById: async (id) => {
    return prisma.templates.findUnique({ where: { id } });
  },
  create: async (data) => {
    return prisma.templates.create({ data });
  },
  update: async (id, data) => {
    return prisma.templates.update({ where: { id }, data });
  },
  delete: async (id) => {
    return prisma.templates.delete({ where: { id } });
  },
};