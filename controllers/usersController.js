import { UsersService } from '../services/usersService.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Intento de login con email:', email);

  if (!email || !password) {
    console.log('Faltan credenciales:', { email: !!email, password: !!password });
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    console.log('Verificando credenciales para:', email);
    const user = await UsersService.verifyCredentials(email, password);
    
    if (!user) {
      console.log('Credenciales inválidas para:', email);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    console.log('Usuario autenticado correctamente:', { id: user.id, email: user.email });
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
      // Devolver respuesta exitosa
      res.json({ 
        message: "Login exitoso", 
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    });
  } catch (error) {
    console.error('Error detallado en login:', error);
    if (error.message.includes('Google')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error durante la autenticación" });
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
    const updatedUser = await UsersService.update(parseInt(id), {
      email,
      name,
      password,
      unique_code,
    });
    console.log('Usuario actualizado:', updatedUser.id);
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
    await UsersService.delete(parseInt(id));
    console.log('Usuario eliminado con ID:', id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};