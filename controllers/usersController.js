import { UsersService } from '../services/usersService.js';

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
  const { username, role, password_hash, unique_code, company_id } = req.body;
  try {
    const newUser = await UsersService.create({
      username,
      role,
      password_hash,
      unique_code,
      company_id,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, role, password_hash, unique_code, company_id } = req.body;
  try {
    const updatedUser = await UsersService.update(parseInt(id), {
      username,
      role,
      password_hash,
      unique_code,
      company_id,
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