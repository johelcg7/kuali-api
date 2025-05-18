import { LeadsService } from '../services/leadsService.js';

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
    console.log('Lead actualizado:', updatedLead);
    
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
    await LeadsService.delete(parseInt(id));
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar el lead:', error);
    res.status(500).json({ error: error.message });
  }
};
