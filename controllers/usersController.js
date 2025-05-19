import { UsersService } from '../services/usersService.js';
import { logAction } from '../services/logAction.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Intento de login con email:', email);

  if (!email || !password) {
    console.log('Faltan credenciales:', { email: !!email, password: !!password });
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    console.log('Verificando credenciales para:', email);
    const result = await UsersService.verifyCredentials(email, password);
    
    console.log('Resultado de verificación:', {
      hasError: !!result.error,
      error: result.error,
      hasUser: !!result.user
    });

    if (result.error) {
      console.log('Error de verificación:', result.error);
      return res.status(401).json({ error: result.error });
    }

    const user = result.user;
    console.log('Usuario autenticado correctamente:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });
    
    // Establecer la sesión
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    
    // Asegurarse de que la sesión se guarde antes de responder
    req.session.save(err => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
        return res.status(500).json({ error: "Error al iniciar sesión" });
      }

      console.log('Sesión guardada correctamente');
      
      // Devolver respuesta exitosa incluyendo el rol
      res.json({ 
        message: "Login exitoso", 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Error detallado en login:', error);
    res.status(500).json({ error: error.message || "Error durante la autenticación" });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  console.log('Obteniendo todos los usuarios');
  try {
    const users = await UsersService.getAll();
    console.log('Usuarios obtenidos:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log('Obteniendo usuario con ID:', id);
  try {
    const user = await UsersService.getById(parseInt(id));
    if (!user) {
      console.log('Usuario no encontrado con ID:', id);
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    console.log('Usuario obtenido:', user);
    res.json(user);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  const { email, name, password, unique_code } = req.body;
  console.log('Creando usuario con email:', email);
  try {
    const newUser = await UsersService.create({
      email,
      name,
      password,
      unique_code,
    });
    console.log('Usuario creado:', newUser.id);

    // Registrar acción de creación de usuario
    logAction({
      userId: newUser.id,
      action: 'create_user',
      details: {
        email: newUser.email,
        name: newUser.name,
        created_by: req.session.userEmail || 'system', // Registrar quién creó el usuario
      }
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, password, unique_code } = req.body;
  console.log('Actualizando usuario con ID:', id);
  try {
    // Obtener datos actuales del usuario antes de actualizar
    const oldUser = await UsersService.getById(parseInt(id));

    const updatedUser = await UsersService.update(parseInt(id), {
      email,
      name,
      password,
      unique_code,
    });
    console.log('Usuario actualizado:', updatedUser.id);

    // Registrar acción de actualización de usuario
    logAction({
      userId: req.session.userId, // Usuario que realiza la acción
      action: 'update_user',
      details: {
        user_id: updatedUser.id,
        user_email: updatedUser.email,
        user_name: updatedUser.name,
        updated_by: req.session.userEmail || 'system',
        changes: {
          // Comparar oldUser con updatedUser para registrar solo los cambios
          ...(oldUser?.email !== updatedUser.email && { email: { from: oldUser?.email, to: updatedUser.email } }),
          ...(oldUser?.name !== updatedUser.name && { name: { from: oldUser?.name, to: updatedUser.name } }),
          // No registrar cambios de contraseña directamente por seguridad
          ...(unique_code !== undefined && { unique_code: { from: oldUser?.unique_code, to: unique_code } }),
        }
      }
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log('Eliminando usuario con ID:', id);
  try {
    // Obtener datos del usuario antes de eliminar
    const userToDelete = await UsersService.getById(parseInt(id));

    await UsersService.delete(parseInt(id));
    console.log('Usuario eliminado con ID:', id);

    // Registrar acción de eliminación de usuario
    if (userToDelete) {
      logAction({
        userId: req.session.userId, // Usuario que realiza la acción
        action: 'delete_user',
        details: {
          user_id: userToDelete.id,
          user_email: userToDelete.email,
          user_name: userToDelete.name,
          deleted_by: req.session.userEmail || 'system',
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};