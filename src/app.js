import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import leadsRoutes from '../routes/leadsRoutes.js';
import authRouter from '../routes/authRoutes.js';
import usersRouter from '../routes/usersRoutes.js';
import companiesRoutes from '../routes/companiesRoutes.js';
import eventsRoutes from '../routes/eventsRoutes.js';
import templatesRouter from '../routes/templatesRouter.js';
import logsRoutes from '../routes/logsRoutes.js';
import meetsRoutes from '../routes/meetsRoutes.js'; // Importar rutas de meets

const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5004',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // false para desarrollo, true para producción con HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/'
  }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  console.log('Session:', req.session);
  console.log('Usuario autenticado:', !!req.session.userId);
  
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// Middleware para verificar si el usuario es administrador
const requireAdmin = async (req, res, next) => {
  console.log('Checking admin role for user:', req.session.userEmail);
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.session.userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    
    // Actualizar el rol en la sesión por si acaso
    req.session.userRole = user.role;
    next();
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error);
    return res.status(500).json({ error: 'Error al verificar permisos de administrador' });
  }
};

// Rutas públicas
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// Rutas protegidas
app.use('/api/leads', requireAuth, leadsRoutes);
app.use('/api/companies', requireAuth, companiesRoutes);
app.use('/api/events', requireAuth, eventsRoutes);
app.use('/api/templates', requireAuth, templatesRouter);
app.use('/api/meets', requireAuth, meetsRoutes); // Agregar ruta para meets
app.use('/registros', requireAuth, requireAdmin, logsRoutes); // Nueva ruta para registros solo admin

export default app;