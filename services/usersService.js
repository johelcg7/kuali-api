import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const UsersService = {
  // Obtener todos los usuarios
  getAll: async () => {
    // Devuelve todos los usuarios (no filtra por role)
    return prisma.users.findMany({
      include: { leads: true },
    });
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    return prisma.users.findUnique({
      where: { id },
      include: { leads: true },
    });
  },

  // Obtener un usuario por email
  getByEmail: async (email) => {
    return prisma.users.findUnique({
      where: { email },
    });
  },

  // Crear un nuevo usuario
  create: async (userData) => {
    // Validar datos requeridos
    if (!userData.email || !userData.name) {
      throw new Error('El email y nombre son requeridos');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('El formato del email no es válido');
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Si se proporciona contraseña, validar y hashear
    if (userData.password) {
      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
    }
    
    // Asegurar que se genere un unique_code si no se proporciona
    if (!userData.unique_code) {
      userData.unique_code = Math.random().toString(36).substring(7);
    }

    return prisma.users.create({
      data: userData,
    });
  },

  // Actualizar un usuario existente
  update: async (id, data) => {
    // Validar que el usuario existe
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Si se está actualizando el email, validar formato y unicidad
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('El formato del email no es válido');
      }

      const emailExists = await prisma.users.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new Error('El email ya está en uso por otro usuario');
      }
    }

    // Si se está actualizando la contraseña, validar y hashear
    if (data.password) {
      if (data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    return prisma.users.update({
      where: { id },
      data,
    });
  },

  // Eliminar un usuario
  delete: async (id) => {
    // Validar que el usuario existe
    const existingUser = await prisma.users.findUnique({
      where: { id },
      include: { leads: true },
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Eliminar todos los leads asociados antes de eliminar el usuario (por seguridad extra)
    await prisma.leads.deleteMany({ where: { user_id: id } });

    return prisma.users.delete({ where: { id } });
  },

  // Verificar credenciales de usuario
  verifyCredentials: async (email, password) => {
    if (!email || !password) {
      console.log('Faltan credenciales:', { email: !!email, password: !!password });
      throw new Error('Email y contraseña son requeridos');
    }

    console.log('Buscando usuario con email:', email);
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return null;
    }

    console.log('Usuario encontrado:', { id: user.id, hasGoogleId: !!user.googleId, hasPassword: !!user.password });

    // Si el usuario se registró con Google, no permitir login manual
    if (user.googleId && !user.password) {
      console.log('Usuario registrado con Google');
      throw new Error("Esta cuenta fue creada con Google. Por favor, usa el botón 'Continuar con Google'");
    }

    // Verificar que existe una contraseña
    if (!user.password) {
      console.log('Usuario no tiene contraseña');
      return null;
    }

    try {
      console.log('Comparando contraseñas');
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Resultado de comparación:', isValid);
      
      if (!isValid) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
      throw new Error('Error en la verificación de credenciales');
    }
  },
};