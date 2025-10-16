// File: app/test/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar"; // Make sure this path is correct

export default function SimplifiedCalendarTest() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // This is a barebones click handler.
  // Its only job is to log to the console and show a browser alert.
  const handleDateClick = (day: Date | undefined) => {
    console.log("Simplified handler fired:", day);
    if (day) {
      alert(`The click is working! You selected: ${day.toDateString()}`);
      setDate(day);
    }
  };

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#09090b',
    }}>
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>
        Stripped-Down Calendar Test
      </h1>
      
      {/*
        This is the most basic version of the Calendar.
        No custom components, no extra class names.
      */}
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateClick}
        style={{ 
          backgroundColor: '#1c1917', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '0.5rem' 
        }}
      />
    </main>
  );
}