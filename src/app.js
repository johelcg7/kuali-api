import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import leadsRoutes from '../routes/leadsRoutes.js';
import usersRoutes from '../routes/usersRoutes.js';
import companiesRoutes from '../routes/companiesRoutes.js';
import eventsRoutes from '../routes/eventsRoutes.js';
import authRoutes from '../routes/authRoutes.js';

const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5004',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // false para desarrollo, true para producción con HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/'
  }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Usar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/events', eventsRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

export default app;