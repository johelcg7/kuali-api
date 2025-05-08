import { UsersService } from '../services/usersService.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por email
    const user = await UsersService.getByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verificar la contraseña (esto asume que la contraseña no está encriptada)
    if (user.password_google !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Si todo está bien, devolver los datos del usuario (puedes incluir un token aquí si usas JWT)
    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
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
  const { username, name, password_google, unique_code } = req.body;
  try {
    const newUser = await UsersService.create({
      username,
      name,
      password_google,
      unique_code,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, name, password_google, unique_code } = req.body;
  try {
    const updatedUser = await UsersService.update(parseInt(id), {
      username,
      name,
      password_google,
      unique_code,
    });
    res.json(updatedUser);
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