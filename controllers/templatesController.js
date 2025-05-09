import { TemplatesService } from '../services/templatesService.js';

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
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const template = await TemplatesService.update(Number(req.params.id), req.body);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await TemplatesService.delete(Number(req.params.id));
      res.json({ message: 'Template deleted' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};