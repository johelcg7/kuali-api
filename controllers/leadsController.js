import { LeadsService } from '../services/leadsService.js';
import { logAction } from '../services/logAction.js';

export const getLeads = async (req, res) => {
  try {
    // Obtener el usuario autenticado
    const userId = req.session.userId;
    // Obtener el rol del usuario autenticado
    const userRole = req.session.userRole;

    let leads;
    if (userRole === 'admin') {
      // Admin ve todos los leads
      leads = await LeadsService.getAll();
    } else {
      // Usuario normal ve solo sus leads
      leads = await LeadsService.getAllByUser(userId);
    }
    if (!Array.isArray(leads)) {
      throw new Error('La respuesta no es un array');
    }
    res.json(leads);
  } catch (error) {
    console.error('Error al obtener los leads:', error);
    res.status(500).json({ error: 'Error al obtener los leads', details: error.message });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await LeadsService.getById(parseInt(id));
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    console.error('Error al obtener el lead:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const data = req.body;
    // Forzar el user_id al de la sesión
    data.user_id = req.session.userId;
    // Crear el lead y obtenerlo con relaciones
    const newLead = await LeadsService.create(data);
    // Obtener el lead completo con relaciones (incluyendo user)
    const leadWithUser = await LeadsService.getById(newLead.id);

    // Registrar la acción de creación de lead con detalles en formato JSON
    await logAction({
      userId: req.session.userId,
      leadId: leadWithUser.id,
      action: 'create_lead',
      details: { // Pasar un objeto para que logAction lo stringifique
        name: leadWithUser.name,
        email: leadWithUser.email,
        created_by: req.session.userEmail || 'system',
      },
    });

    res.status(201).json(leadWithUser);
  } catch (error) {
    console.error('Error al crear el lead:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log('Datos recibidos en updateLead:', { id, data });

    // Validar que el ID sea un número válido
    const leadId = parseInt(id);
    if (isNaN(leadId)) {
      return res.status(400).json({ 
        error: 'ID inválido',
        details: `El ID proporcionado "${id}" no es un número válido`
      });
    }

    // Validar el status
    const validStatus = ['inicio', 'en seguimiento', 'cerrado'];
    if (data.status && !validStatus.includes(data.status)) {
      return res.status(400).json({ 
        error: 'Status inválido',
        details: `El status "${data.status}" no es válido. Valores permitidos: ${validStatus.join(', ')}`,
        validStatus
      });
    }

    const updatedLead = await LeadsService.update(leadId, data);
    console.log('Lead actualizado:', updatedLead);    // Registrar la acción de actualización de lead con detalles de los cambios
    await logAction({
      userId: req.session.userId,
      leadId: updatedLead.id,
      action: 'update_lead',
      details: JSON.stringify({
        lead_name: updatedLead.name,
        lead_email: updatedLead.email,
        user: req.session.userEmail,
        updated_at: new Date().toISOString(),
        changes: {
          ...data,
          company_name: data.company_name || updatedLead.company?.name,
          event_name: data.event_name || (updatedLead.events?.length > 0 ? updatedLead.events[0].name : null)
        }
      })
    });
    
    res.json(updatedLead);
  } catch (error) {
    console.error('Error al actualizar el lead:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el lead',
      details: error.message
    });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener el lead antes de eliminarlo para registrar sus detalles
    const leadToDelete = await LeadsService.getById(parseInt(id));
    await LeadsService.delete(parseInt(id));    // Registrar la acción de eliminación de lead con detalles completos
    if (leadToDelete) {
      await logAction({
        userId: req.session.userId,
        leadId: parseInt(id),
        action: 'delete_lead',
        details: JSON.stringify({
          name: leadToDelete.name,
          email: leadToDelete.email,
          phone: leadToDelete.phone,
          company: leadToDelete.company?.name,
          event: leadToDelete.events?.length > 0 ? leadToDelete.events[0].name : null,
          status: leadToDelete.status,
          job_role: leadToDelete.job_role,
          work_area: leadToDelete.work_area,
          linkedin: leadToDelete.linkedin,
          deleted_at: new Date().toISOString(),
          deleted_by: req.session.userEmail
        })
      });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar el lead:', error);
    res.status(500).json({ error: error.message });
  }
};
