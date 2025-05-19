import { TemplatesService } from '../services/templatesService.js';
import { Resend } from 'resend';
import { logAction } from '../services/logAction.js';
import { LeadsService } from '../services/leadsService.js';
import { LogWhatsappService } from '../services/logWhatsappService.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const TemplatesController = {
  getAll: async (req, res) => {
    try {
      const templates = await TemplatesService.getAll();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const template = await TemplatesService.getById(Number(req.params.id));
      if (!template) return res.status(404).json({ error: 'Template not found' });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const template = await TemplatesService.create(req.body);

      // Registrar acción de creación de plantilla
      logAction({
        userId: req.session.userId,
        action: 'create_template',
        details: {
          template_id: template.id,
          template_name: template.name,
          template_type: template.type,
          created_by: req.session.userEmail || 'system',
        }
      });

      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const templateId = Number(req.params.id);
      // Obtener datos actuales de la plantilla antes de actualizar
      const oldTemplate = await TemplatesService.getById(templateId);

      const updatedTemplate = await TemplatesService.update(templateId, req.body);

      // Registrar acción de actualización de plantilla
      logAction({
        userId: req.session.userId,
        action: 'update_template',
        details: {
          template_id: updatedTemplate.id,
          template_name: updatedTemplate.name,
          updated_by: req.session.userEmail || 'system',
          changes: {
            // Comparar oldTemplate con req.body para registrar solo los cambios enviados
            ...(req.body.name !== undefined && req.body.name !== oldTemplate?.name && { name: { from: oldTemplate?.name, to: req.body.name } }),
            ...(req.body.type !== undefined && req.body.type !== oldTemplate?.type && { type: { from: oldTemplate?.type, to: req.body.type } }),
            ...(req.body.body !== undefined && req.body.body !== oldTemplate?.body && { body: { from: oldTemplate?.body, to: req.body.body } }),
          }
        }
      });

      res.json(updatedTemplate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const templateId = Number(req.params.id);
      // Obtener datos de la plantilla antes de eliminar
      const templateToDelete = await TemplatesService.getById(templateId);

      await TemplatesService.delete(templateId);

      // Registrar acción de eliminación de plantilla
      if (templateToDelete) {
        logAction({
          userId: req.session.userId,
          action: 'delete_template',
          details: {
            template_id: templateToDelete.id,
            template_name: templateToDelete.name,
            template_type: templateToDelete.type,
            deleted_by: req.session.userEmail || 'system',
          }
        });
      }

      res.json({ message: 'Template deleted' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  sendMailToLead: async (req, res) => {
    const { to, subject, body, leadId, templateId } = req.body;
    try {
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html: body,
      });

      // Obtener detalles del lead y la plantilla para el log
      const lead = leadId ? await LeadsService.getById(leadId) : null;
      const template = templateId ? await TemplatesService.getById(templateId) : null;

      // Registrar la acción de envío de correo con detalles completos
      await logAction({
        userId: req.session.userId,
        leadId: leadId || null,
        templateId: templateId || null,
        action: 'send_mail',
        details: { // Pasar un objeto para que logAction lo stringifique
          to,
          subject,
          leadName: lead?.name || 'Desconocido',
          leadEmail: lead?.email || 'Desconocido', // Añadir email del lead
          templateName: template?.name || 'Desconocida',
        },
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error al enviar correo:', error);
      res.status(500).json({ error: 'Error al enviar correo', details: error.message });
    }
  },

  // Nuevo endpoint para registrar envíos de WhatsApp
  logWhatsApp: async (req, res) => {
    console.log('Received request to log WhatsApp send'); // Log de inicio
    try {
      const { leadId, templateId, details } = req.body;
      const userId = req.session.userId;

      console.log('Log data received:', { userId, leadId, templateId, details }); // Log de datos recibidos

      // Obtener detalles del lead y la plantilla para el log
      const lead = leadId ? await LeadsService.getById(leadId) : null;
      const template = templateId ? await TemplatesService.getById(templateId) : null;

      // Registrar la acción de envío de WhatsApp con detalles completos
      const logDetails = { // Preparar detalles para el logAction
        phone: details.phone,
        leadName: lead?.name || 'Desconocido',
        templateName: template?.name || 'Desconocida',
      };

      console.log('Details being sent to logAction:', logDetails); // Log de detalles para logAction

      const log = await logAction({
        userId,
        leadId,
        templateId,
        action: 'send_whatsapp', // Añadido: Especificar la acción
        details: logDetails,
      });

      console.log('Log entry created successfully:', log); // Log de éxito

      res.json({ success: true, log });
    } catch (error) {
      console.error('Error in logWhatsApp controller:', error); // Log de error
      res.status(500).json({ error: 'Error al registrar envío de WhatsApp', details: error.message });
    }
  },
};