"use client";

import { SelectSingleEventHandler } from "react-day-picker";
import { CalendarComponent } from "./Calendar"; // Adjust path if your calendar component is elsewhere

interface PermanentCalendarCardProps {
    selectedDate: Date | undefined;
    onDateChange: SelectSingleEventHandler;
}

export function PermanentCalendarCard({ selectedDate, onDateChange }: PermanentCalendarCardProps) {
    return (
        <div>
            <CalendarComponent 
                selectedDate={selectedDate}
                onDateChange={onDateChange}
            />
        </div>
    );
}