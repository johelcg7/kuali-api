// backend/controllers/voiceController.js
import { transcribeAudio, extractMeetingDetails, scheduleMeetingOnCalendar } from './services/meetingProcessor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper para __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegúrate de que el directorio 'uploads' exista
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function processVoiceCommand(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se recibió ningún archivo de audio." });
  }

  const audioFilePath = req.file.path;

  try {
    // 1. Transcribir audio a texto
    const transcribedText = await transcribeAudio(audioFilePath);
    if (!transcribedText || transcribedText.trim() === "") {
        return res.status(400).json({ message: "No se pudo transcribir el audio o el audio estaba vacío." });
    }

    // 2. Extraer detalles de la reunión del texto
    const meetingDetails = await extractMeetingDetails(transcribedText);

    // (Opcional) Devolver detalles para confirmación del usuario antes de agendar
    // Por ahora, agendaremos directamente para simplificar el ejemplo.

    // 3. Agendar en el calendario (simulado)
    // const calendarResponse = await scheduleMeetingOnCalendar(meetingDetails);

    // Devolver los detalles extraídos para que el frontend los use en el formulario
    res.status(200).json({
      message: "Audio procesado, detalles extraídos.",
      transcribedText,
      meetingDetails,
      // calendarResponse // Descomentar si se agenda directamente
    });

  } catch (error) {
    console.error("Error en processVoiceCommand:", error);
    res.status(500).json({ message: error.message || "Error procesando el comando de voz." });
  } finally {
    // Limpiar el archivo de audio subido después de procesarlo
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error("Error eliminando archivo de audio temporal:", err);
    });
  }
}

export async function confirmAndScheduleMeeting(req, res) {
  const { meetingDetails } = req.body;

  if (!meetingDetails) {
    return res.status(400).json({ message: "No se proporcionaron detalles de la reunión." });
  }

  try {
    const calendarResponse = await scheduleMeetingOnCalendar(meetingDetails);
    res.status(200).json(calendarResponse);
  } catch (error) {
    console.error("Error en confirmAndScheduleMeeting:", error);
    res.status(500).json({ message: error.message || "Error al agendar la reunión en el calendario." });
  }
}
