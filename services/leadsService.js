import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const LeadsService = {
  getAll: async () => {
    return prisma.leads.findMany({include:{company:true}});
  },
  getById: async (id) => {
    return prisma.leads.findUnique({ where: { id } });
  },
  create: async (data) => {
    return prisma.leads.create({ data });
  },
  update: async (id, data) => {
    return prisma.leads.update({ where: { id }, data });
  },
  delete: async (id) => {
    return prisma.leads.delete({ where: { id } });
  },
};
