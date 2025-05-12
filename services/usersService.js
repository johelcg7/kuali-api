import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const UsersService = {
  // Obtener todos los usuarios
  getAll: async () => {
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
    // Si se proporciona contraseña, hashearla
    if (userData.password) {
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
    // Si se está actualizando la contraseña, hashearla
    if (data.password) {
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
    return prisma.users.delete({ where: { id } });
  },

  // Verificar credenciales de usuario
  verifyCredentials: async (email, password) => {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Si el usuario se registró con Google, no permitir login manual
    if (user.googleId && !user.password) {
      throw new Error("Esta cuenta fue creada con Google. Por favor, usa el botón 'Continuar con Google'");
    }

    // Verificar la contraseña
    if (!user.password) {
      return null;
    }

    try {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
      return null;
    }
  },
};