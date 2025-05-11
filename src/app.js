import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import leadsRoutes from '../routes/leadsRoutes.js';
import usersRoutes from '../routes/usersRoutes.js';
import companiesRoutes from '../routes/companiesRoutes.js';
import eventsRoutes from '../routes/eventsRoutes.js';

const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de autenticación temporal para desarrollo
app.use((req, res, next) => {
  req.isAuthenticated = () => true; // Simular que el usuario está autenticado
  next();
});

// Usar las rutas
app.use('/api/leads', leadsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/events', eventsRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

export default app;