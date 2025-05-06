import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeads = async (req, res) => {
  const leads = await prisma.leads.findMany();
  res.json(leads);
};

export const getLeadById = async (req, res) => {
  const { id } = req.params;
  const lead = await prisma.leads.findUnique({ where: { id } });
  res.json(lead);
};

export const createLead = async (req, res) => {
  const data = req.body;
  const newLead = await prisma.leads.create({ data });
  res.status(201).json(newLead);
};

export const updateLead = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updatedLead = await prisma.leads.update({ where: { id }, data });
  res.json(updatedLead);
};

export const deleteLead = async (req, res) => {
  const { id } = req.params;
  await prisma.leads.delete({ where: { id } });
  res.status(204).end();
};
