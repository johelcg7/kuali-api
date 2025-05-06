import { CompaniesService } from '../services/companiesService.js';

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await CompaniesService.getAll();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const company = await CompaniesService.getById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const newCompany = await CompaniesService.create(req.body);
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const updatedCompany = await CompaniesService.update(req.params.id, req.body);
    if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const deleted = await CompaniesService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Company not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
