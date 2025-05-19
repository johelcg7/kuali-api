import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAction({ userId, leadId = null, templateId = null, action, details = null }) {
  return prisma.logs.create({
    data: {
      userId,
      leadId,
      templateId,
      action,
      details: details ? JSON.stringify(details) : null, // Asegurarse de que los detalles sean JSON stringificado
      createdAt: new Date(), // Corregido: usar 'createdAt' en lugar de 'created_at'
    },
  });
}
