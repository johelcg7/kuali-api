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
    try {
      if (!email || !password) {
        console.log('Faltan credenciales:', { email: !!email, password: !!password });
        return { error: 'Email y contraseña son requeridos' };
      }

      console.log('Buscando usuario con email:', email);
      const user = await prisma.users.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          googleId: true,
          role: true,
          unique_code: true
        }
      });

      if (!user) {
        console.log('Usuario no encontrado');
        return { error: 'Credenciales inválidas' };
      }

      console.log('Usuario encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasGoogleId: !!user.googleId,
        hasPassword: !!user.password
      });
      
      // Si el usuario se registró con Google y no tiene contraseña local
      if (user.googleId && !user.password) {
        return { error: 'Este usuario debe iniciar sesión con Google' };
      }
      
      // Verificar que exista una contraseña
      if (!user.password) {
        console.log('Usuario no tiene contraseña configurada');
        return { error: 'Credenciales inválidas' };
      }

      console.log('Verificando contraseña para usuario:', user.email);
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('Contraseña inválida para usuario:', user.email);
        return { error: 'Credenciales inválidas' };
      }

      console.log('Autenticación exitosa para usuario:', user.email);
      // No enviar la contraseña en la respuesta
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword };
    } catch (error) {
      console.error('Error en verificación de credenciales:', error);
      return { error: 'Error durante la autenticación' };
    }
  },
};