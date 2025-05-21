import OpenAI from 'openai';
import fs from 'fs'; // Necesario si guardas temporalmente el audio

// Configura tu clave API de OpenAI de forma segura (variables de entorno es lo ideal)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio a texto usando OpenAI Whisper.
 * @param {string} audioFilePath - Ruta al archivo de audio.
 * @returns {Promise<string>} - El texto transcrito.
 */
async function transcribeAudio(audioFilePath) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no está configurada en el servidor.");
  }
  try {
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(audioFilePath), // Whisper API espera un stream o buffer
    });
    return transcription.text;
  } catch (error) {
    console.error("Error en la transcripción con Whisper:", error);
    throw new Error("Fallo al transcribir el audio.");
  }
}

/**
 * Extrae detalles de la reunión de un texto usando OpenAI GPT.
 * @param {string} text - El texto del cual extraer detalles.
 * @returns {Promise<object>} - Un objeto con los detalles de la reunión.
 */
async function extractMeetingDetails(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no está configurada en el servidor.");
  }
  const prompt = `
    Extrae los detalles para agendar una reunión del siguiente texto.
    Devuelve la información en formato JSON con estas claves:
    - "title" (string, si no se menciona un título específico, usa "Reunión")
    - "participants" (lista de strings, por ejemplo ["Ana López", "Carlos Gómez"])
    - "date" (string, en formato YYYY-MM-DD. Intenta convertir fechas relativas como "mañana" o "próximo martes". Asume que hoy es ${new Date().toISOString().split('T')[0]} si necesitas una referencia.)
    - "time" (string, en formato HH:MM AM/PM o 24h, por ejemplo "02:00 PM" o "14:00")
    - "duration" (number, en minutos, si no se especifica, usa 30)
    - "description" (string, cualquier detalle adicional o descripción)

    Si alguna información no está claramente presente, usa null para ese valor en el JSON.
    No incluyas explicaciones adicionales, solo el JSON.

    Texto: "${text}"
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // o gpt-4
      messages: [
        { role: "system", content: "Eres un asistente experto en extraer detalles de reuniones de un texto y devolverlos estrictamente en formato JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
    });

    const resultText = response.choices[0].message.content.trim();
    // Limpiar posible markdown alrededor del JSON
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        return JSON.parse(jsonString);
    }
    console.warn("GPT no devolvió un JSON en el formato esperado, intentando parsear directamente:", resultText);
    return JSON.parse(resultText); // Intento de parseo directo

  } catch (error) {
    console.error("Error extrayendo detalles con GPT:", error.response ? error.response.data : error.message);
    throw new Error("Fallo al procesar la solicitud de reunión.");
  }
}

/**
 * Simulación de agendar en un calendario.
 * @param {object} meetingDetails - Detalles de la reunión.
 * @returns {Promise<object>} - Confirmación del agendamiento.
 */
async function scheduleMeetingOnCalendar(meetingDetails) {
  // Aquí integrarías con Google Calendar API, Microsoft Graph API, etc.
  console.log("Simulando agendamiento en calendario:", meetingDetails);
  // Ejemplo de respuesta simulada
  return {
    success: true,
    message: "Reunión agendada exitosamente (simulado).",
    eventId: `evt_${Date.now()}`,
    details: meetingDetails,
  };
}

export { transcribeAudio, extractMeetingDetails, scheduleMeetingOnCalendar };