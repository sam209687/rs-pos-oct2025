"use server";

import { format } from 'date-fns';

type Holiday = {
  name: string;
  date: string;
};

export async function getIndianHolidays(): Promise<Holiday[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const calendarId = process.env.PUBLIC_INDIAN_HOLIDAYS_CALENDAR_ID;

  if (!apiKey || !calendarId) {
    console.error("Google Calendar API Key or Calendar ID is not configured.");
    return [];
  }

  const year = new Date().getFullYear();
  const timeMin = new Date(year, 0, 1).toISOString();
  const timeMax = new Date(year, 11, 31).toISOString();

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.append('key', apiKey);
  url.searchParams.append('timeMin', timeMin);
  url.searchParams.append('timeMax', timeMax);
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Calendar API error: ${error.error.message}`);
    }

    const data = await response.json();

    // ✅ ADD THIS LOG to see the raw response from Google
    console.log("--- Raw Response from Google API ---", JSON.stringify(data, null, 2));

    // Ensure data.items exists before trying to map it
    const holidays: Holiday[] = data.items?.map((event: any) => ({
      name: event.summary,
      date: event.start.date,
    })) || []; // Use || [] as a fallback in case items is undefined

    return holidays;

  } catch (error) {
    console.error("Failed to fetch Indian holidays:", error);
    return [];
  }
}