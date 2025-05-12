import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import leadsRoutes from '../routes/leadsRoutes.js';
import authRouter from '../routes/authRoutes.js';
import usersRouter from '../routes/usersRoutes.js';
import companiesRoutes from '../routes/companiesRoutes.js';
import eventsRoutes from '../routes/eventsRoutes.js';
import templatesRouter from '../routes/templatesRouter.js';

const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5004',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// Rutas públicas
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// Rutas protegidas
app.use('/api/leads', requireAuth, leadsRoutes);
app.use('/api/companies', requireAuth, companiesRoutes);
app.use('/api/events', requireAuth, eventsRoutes);
app.use('/api/templates', requireAuth, templatesRouter);

export default app;