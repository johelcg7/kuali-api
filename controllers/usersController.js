import { UsersService } from '../services/usersService.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UsersService.verifyCredentials(email, password);
    
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Establecer la sesión
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    
    // Asegurarse de que la sesión se guarde antes de responder
    req.session.save(err => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
        return res.status(500).json({ error: "Error al iniciar sesión" });
      }
      
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
    console.error("Error durante el login:", error);
    // Si es un error específico de autenticación con Google, devolver el mensaje
    if (error.message.includes('Google')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await UsersService.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UsersService.getById(parseInt(id));
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  const { email, name, password, unique_code } = req.body;
  try {
    const newUser = await UsersService.create({
      email,
      name,
      password,
      unique_code,
    });
    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, password, unique_code } = req.body;
  try {
    const updatedUser = await UsersService.update(parseInt(id), {
      email,
      name,
      password,
      unique_code,
    });
    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await UsersService.delete(parseInt(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};