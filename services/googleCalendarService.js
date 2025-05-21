import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID_2,
  process.env.GOOGLE_CLIENT_SECRET_2,
  'http://localhost:3003/api/auth/google/callback'
);

// Configurar las credenciales del servicio
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const createCalendarEvent = async (eventDetails) => {
  try {
    const event = {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: {
        dateTime: new Date(eventDetails.fecha).toISOString(),
        timeZone: 'America/Lima',
      },
      end: {
        dateTime: new Date(new Date(eventDetails.fecha).getTime() + eventDetails.duration * 60000).toISOString(),
        timeZone: 'America/Lima',
      },
      conferenceData: {
        createRequest: {
          requestId: `meet_${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      resource: event,
    });

    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error('Error al crear evento en Google Calendar');
  }
};
