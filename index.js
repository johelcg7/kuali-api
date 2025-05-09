import express from 'express';
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
import swaggerDocument from './swagger.json' assert { type: 'json' };
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors({
  origin: 'http://localhost:5173', // Permitir solicitudes desde el frontend
  credentials: true, // Habilitar credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
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
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Estoy vivo en http://localhost:${port}`);
});
