import { CompaniesService } from '../services/companiesService.js';
import { logAction } from '../services/logAction.js';

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

    // Registrar acción de creación de empresa
    logAction({
      userId: req.session.userId,
      action: 'create_company',
      details: {
        company_id: newCompany.id,
        company_name: newCompany.name,
        created_by: req.session.userEmail || 'system',
      }
    });

    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    // Obtener datos actuales de la empresa antes de actualizar
    const oldCompany = await CompaniesService.getById(companyId);

    const updatedCompany = await CompaniesService.update(companyId, req.body);
    if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });

    // Registrar acción de actualización de empresa
    logAction({
      userId: req.session.userId,
      action: 'update_company',
      details: {
        company_id: updatedCompany.id,
        company_name: updatedCompany.name,
        updated_by: req.session.userEmail || 'system',
        changes: {
          // Comparar oldCompany con req.body para registrar solo los cambios enviados
          ...(req.body.name !== undefined && req.body.name !== oldCompany?.name && { name: { from: oldCompany?.name, to: req.body.name } }),
          // Añadir otros campos relevantes si se actualizan
        }
      }
    });

    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    // Obtener datos de la empresa antes de eliminar
    const companyToDelete = await CompaniesService.getById(companyId);

    const deleted = await CompaniesService.delete(companyId);
    if (!deleted) return res.status(404).json({ error: 'Company not found' });

    // Registrar acción de eliminación de empresa
    if (companyToDelete) {
      logAction({
        userId: req.session.userId,
        action: 'delete_company',
        details: {
          company_id: companyToDelete.id,
          company_name: companyToDelete.name,
          deleted_by: req.session.userEmail || 'system',
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
