"use server";

export interface Holiday {
  date: string;
  name: string;
}

// Define the interface for the Google Calendar API event item
interface Event {
  summary: string;
  start: {
    date: string;
  };
}

export async function getIndianHolidays() {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const calendarId = 'en.indian%23holiday%40group.v.calendar.google.com';
  const timeMin = new Date().toISOString();
  const timeMax = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&maxResults=200`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items.map((event: Event) => ({
      date: event.start.date,
      name: event.summary,
    }));
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
}