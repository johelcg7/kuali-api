import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import companiesRoutes from './routes/companiesRoutes.js';
import leadsRoutes from './routes/leadsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import templatesRoutes from './routes/templatesRouter.js';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = JSON.parse(
  readFileSync(join(__dirname, 'swagger.json'), 'utf-8')
);

const app = express();
const port = process.env.PORT || 3003;  // Cambiado a 3003

// Middleware
app.use(express.json());

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5004'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/companies', companiesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API de Kuali CRM está funcionando!');
});

// Start the server
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
  console.log(`Documentación API disponible en http://localhost:${port}/api-docs`);
});
