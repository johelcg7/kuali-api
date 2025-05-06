import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CompaniesService = {
  getAll: async () => {
    return prisma.companies.findMany();
  },
  getById: async (id) => {
    return prisma.companies.findUnique({ where: { id } });
  },
  create: async (data) => {
    return prisma.companies.create({ data });
  },
  update: async (id, data) => {
    return prisma.companies.update({ where: { id }, data });
  },
  delete: async (id) => {
    return prisma.companies.delete({ where: { id } });
  },
};
