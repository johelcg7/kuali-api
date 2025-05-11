import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ensureDefaultRecordsExist = async () => {
  // Verificar y crear compañía por defecto si no existe
  const defaultCompany = await prisma.companies.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Empresa por defecto',
      sector: 'General',
      country: 'Perú',
      employee_numbers: 1
    },
  });

  // Verificar y crear evento por defecto si no existe
  const defaultEvent = await prisma.events.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Evento por defecto',
      type: 'General',
      location: 'Virtual',
      fecha: new Date(),
      description: 'Evento por defecto',
      company_id: defaultCompany.id
    },
  });

  // Verificar y crear usuario por defecto si no existe
  const defaultUser = await prisma.users.upsert({
    where: { id: 1 },
    update: {},
    create: {
      email: 'default@kuali.com',
      name: 'Usuario por defecto',
      password_google: 'default',
      unique_code: 'DEFAULT001'
    },
  });

  return {
    company_id: defaultCompany.id,
    event_id: defaultEvent.id,
    user_id: defaultUser.id
  };
};

const createOrGetCompany = async (companyName) => {
  try {
    if (!companyName) {
      const defaultIds = await ensureDefaultRecordsExist();
      return { id: defaultIds.company_id };
    }

    // Crear nueva empresa
    const newCompany = await prisma.companies.create({
      data: {
        name: companyName,
        sector: 'General',
        country: 'Perú',
        employee_numbers: 1
      }
    });

    return newCompany;
  } catch (error) {
    console.error('Error al crear empresa:', error);
    throw new Error('Error al crear la empresa: ' + error.message);
  }
};

const createOrGetEvent = async (eventName, companyId) => {
  try {
    if (!eventName) {
      const defaultIds = await ensureDefaultRecordsExist();
      return { id: defaultIds.event_id };
    }

    // Crear nuevo evento
    const newEvent = await prisma.events.create({
      data: {
        name: eventName,
        type: 'General',
        location: 'Virtual',
        fecha: new Date(),
        description: 'Evento creado automáticamente',
        company_id: companyId
      }
    });

    return newEvent;
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw new Error('Error al crear el evento: ' + error.message);
  }
};

export const LeadsService = {
  getAll: async () => {
    try {
      return await prisma.leads.findMany({
        include: {
          users: true,
          company: true,
          events: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      throw new Error('Error al obtener los leads');
    }
  },

  getById: async (id) => {
    try {
      return await prisma.leads.findUnique({
        where: { id: Number(id) },
        include: {
          users: true,
          company: true,
          events: true,
        }
      });
    } catch (error) {
      console.error('Error en getById:', error);
      throw new Error('Error al obtener el lead');
    }
  },

  create: async (data) => {
    try {
      // Validar campos obligatorios
      if (!data.name || !data.email) {
        console.error('Faltan campos obligatorios:', { name: data.name, email: data.email });
        throw new Error('Los campos "name" y "email" son obligatorios');
      }

      // Crear o obtener la empresa primero
      const company = await createOrGetCompany(data.company_name);
      
      // Crear o obtener el evento usando el ID de la empresa
      const event = await createOrGetEvent(data.event_name, company.id);
      
      // Obtener IDs por defecto para otros campos
      const defaultIds = await ensureDefaultRecordsExist();

      // Preparar datos para crear el lead
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        job_role: data.job_role || null,
        work_area: data.work_area || null,
        company_id: company.id,
        event_id: event.id,
        user_id: Number(data.user_id) || defaultIds.user_id,
      };

      // Crear el lead con sus relaciones
      return await prisma.leads.create({
        data: leadData,
        include: {
          users: true,
          company: true,
          events: true,
        }
      });
    } catch (error) {
      console.error('Error en create:', error);
      throw new Error('Error al crear el lead: ' + error.message);
    }
  },

  update: async (id, data) => {
    try {
      const leadId = Number(id);
      if (isNaN(leadId)) throw new Error('ID de lead inválido');

      console.log('Datos recibidos para actualización:', { id: leadId, data });

      // Si se proporciona un nuevo nombre de empresa, crear o actualizar la empresa
      let companyId = data.company_id;
      if (data.company_name) {
        const company = await createOrGetCompany(data.company_name);
        companyId = company.id;
      }

      // Si se proporciona un nuevo nombre de evento, crear o actualizar el evento
      let eventId = data.event_id;
      if (data.event_name) {
        const event = await createOrGetEvent(data.event_name, companyId || data.company_id);
        eventId = event.id;
      }

      // Preparar datos limpios para la actualización
      const cleanData = {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.linkedin && { linkedin: data.linkedin }),
        ...(data.job_role && { job_role: data.job_role }),
        ...(data.work_area && { work_area: data.work_area }),
        ...(companyId && { company_id: companyId }),
        ...(eventId && { event_id: eventId }),
        ...(data.user_id && { user_id: Number(data.user_id) })
      };

      console.log('Datos limpios para actualización:', cleanData);

      // Realizar actualización
      const updatedLead = await prisma.leads.update({
        where: {
          id: leadId
        },
        data: cleanData,
        include: {
          users: true,
          company: true,
          events: true
        }
      });

      console.log('Lead actualizado exitosamente:', updatedLead);
      return updatedLead;

    } catch (error) {
      console.error('Error detallado en actualización:', error);
      throw new Error(`Error al actualizar el lead: \n${error.message}`);
    }
  },

  delete: async (id) => {
    try {
      return await prisma.leads.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      console.error('Error en delete:', error);
      if (error.code === 'P2025') {
        throw new Error('Lead no encontrado');
      }
      throw new Error('Error al eliminar el lead');
    }
  },
};
