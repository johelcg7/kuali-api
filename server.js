// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import voiceRoutes from './routes/voiceRoutes.js';
import path from 'path'; // Necesario para servir archivos estáticos si es necesario
import { fileURLToPath } from 'url';

dotenv.config(); // Carga variables de entorno desde .env

const app = express();
const port = process.env.PORT || 3003; // Un puerto diferente al de tu frontend y API principal

// Helper para __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: 'http://localhost:5004', // La URL de tu frontend React (ajusta si es diferente)
  credentials: true,
}));
app.use(express.json()); // Para parsear JSON bodies
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies

// Sirve la carpeta 'uploads' si necesitas acceder a los archivos temporalmente (para debug)
// En producción, estos archivos deberían ser efímeros.
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/voice', voiceRoutes);

app.get('/', (req, res) => {
  res.send('Servidor de procesamiento de voz para Kuali CRM está funcionando.');
});

app.listen(port, () => {
  console.log(`Servidor de voz escuchando en http://localhost:${port}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("ADVERTENCIA: La variable de entorno OPENAI_API_KEY no está configurada. Las llamadas a OpenAI fallarán.");
  }
});
