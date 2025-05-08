import { LeadsService } from '../services/leadsService.js';

export const getLeads = async (req, res) => {
  try {
    const leads = await LeadsService.getAll();
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
    res.status(500).json({ error: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const data = req.body;
    const newLead = await LeadsService.create(data);
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedLead = await LeadsService.update(parseInt(id), data);
    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    await LeadsService.delete(parseInt(id));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
