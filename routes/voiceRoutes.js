// backend/routes/voiceRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { processVoiceCommand, confirmAndScheduleMeeting } from './controllers/voiceController.js';

const router = express.Router();

// Configuración de Multer para guardar archivos de audio temporalmente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista en la raíz de tu backend
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre de archivo único
  }
});
const upload = multer({ storage: storage });

// Ruta para procesar el comando de voz (transcripción y extracción)
router.post('/process-command', upload.single('audio'), processVoiceCommand);

// Ruta para confirmar y agendar la reunión (después de que el usuario vea los detalles)
router.post('/schedule-confirmed-meeting', express.json(), confirmAndScheduleMeeting);


export default router;
