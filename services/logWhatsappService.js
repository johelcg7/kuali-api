import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const LogWhatsappService = {
  logWhatsApp: async (data) => {
    const { userId, leadId, templateId, details } = data;

    try {
      return await prisma.actionLogs.create({
        data: {
          userId: userId,
          leadId: leadId,
          templateId: templateId,
          action: 'send_whatsapp',
          details: JSON.stringify(details)
        }
      });
    } catch (error) {
      console.error('Error al registrar envío de WhatsApp:', error);
      throw new Error('Error al registrar envío de WhatsApp');
    }
  }
};
