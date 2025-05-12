import express from 'express';
import {
  loginUser,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';

const router = express.Router();

// Ruta de inicio de sesión (debe ir antes de las rutas protegidas)
router.post("/login", loginUser);

// Rutas CRUD (protegidas)
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

router.get('/', requireAuth, getUsers);
router.get('/:id', requireAuth, getUserById);
router.post('/', requireAuth, createUser);
router.put('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, deleteUser);

export default router;