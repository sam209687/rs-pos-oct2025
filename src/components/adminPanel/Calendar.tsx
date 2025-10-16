"use client";

import * as React from "react";
import {
  format,
  parseISO,
  subDays,
  isWithinInterval,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";
import { RefreshCcw } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { type DayProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getIndianHolidays } from "@/actions/calendar.Actions";
import { MemoEventDialog } from "./memoEvent";

type Holiday = { name: string; date: string };
type CustomEvent = { date: string; name: string };

const CALENDAR_EVENTS_STORAGE_KEY = "calendarCustomEvents_v1";

export function CalendarComponent() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<Date | null>(null);
  const [eventName, setEventName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false); // ✅ prevents premature overwrite

  // ✅ Fetch holidays from API
  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    const holidayData = await getIndianHolidays();
    setHolidays(holidayData);
    setIsLoading(false);
  }, []);

  // ✅ Load events from localStorage once on mount
  useEffect(() => {
    fetchHolidays();

    try {
      const savedEvents = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
      if (savedEvents) {
        setCustomEvents(JSON.parse(savedEvents));
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    }

    setIsLoaded(true);
  }, [fetchHolidays]);

  // ✅ Save to localStorage only after loading existing data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        CALENDAR_EVENTS_STORAGE_KEY,
        JSON.stringify(customEvents)
      );
    }
  }, [customEvents, isLoaded]);

  const holidayMap = useMemo(() => {
    const map = new Map<string, string>();
    holidays.forEach((h) => map.set(h.date, h.name));
    return map;
  }, [holidays]);

  const customEventMap = useMemo(() => {
    const map = new Map<string, string>();
    customEvents.forEach((e) => map.set(e.date, e.name));
    return map;
  }, [customEvents]);

  const displayHolidays = useMemo(() => {
    if (holidays.length === 0) return [];
    const today = startOfDay(new Date());
    const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.filter((holiday) => {
      const holidayDate = parseISO(holiday.date);
      if (differenceInCalendarDays(holidayDate, today) < 0) return false;
      const displayStartDate = subDays(holidayDate, 5);
      return isWithinInterval(today, { start: displayStartDate, end: holidayDate });
    });
  }, [holidays]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setDialogDate(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const existingEvent = customEventMap.get(dateStr);
    setEventName(existingEvent || "");
    setIsDialogOpen(true);
  };

  const DayComponent = ({ day, modifiers, className, ...props }: DayProps) => {
    const dateStr = format(day.date, "yyyy-MM-dd");
    const holidayName = holidayMap.get(dateStr);
    const customEventName = customEventMap.get(dateStr);
    const tooltipContent = [customEventName, holidayName].filter(Boolean).join(" | ");

    return (
      <td
        {...props}
        className={cn(className, "p-0", {
          "cursor-pointer": !modifiers.disabled,
        })}
      >
        <div
          role="button"
          tabIndex={0}
          title={tooltipContent}
          onClick={() => !modifiers.disabled && handleDateSelect(day.date)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleDateSelect(day.date);
          }}
          className={cn(
            "relative h-9 w-full flex items-center justify-center rounded-md font-normal outline-none select-none",
            !modifiers.disabled &&
              "hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring",
            modifiers.selected &&
              "bg-primary text-primary-foreground hover:bg-primary",
            modifiers.today && "bg-accent text-accent-foreground"
          )}
        >
          <span>{format(day.date, "d")}</span>
          {holidayName && (
            <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
          )}
          {customEventName && (
            <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          )}
        </div>
      </td>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card text-card-foreground border rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">
              Calendar {format(new Date(), "yyyy")}
            </h2>
            {displayHolidays.length > 0 && (
              <p className="text-sm text-yellow-500 animate-pulse">
                Upcoming: {displayHolidays.map((h) => h.name).join(", ")}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchHolidays}
            disabled={isLoading}
          >
            <RefreshCcw
              className={cn(
                "h-4 w-4 text-muted-foreground",
                isLoading && "animate-spin"
              )}
            />
          </Button>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          showOutsideDays={false}
          className="w-full p-0"
          components={{ Day: DayComponent }}
          classNames={{
            table: "w-full border-collapse table-fixed",
            head_cell:
              "text-muted-foreground rounded-md font-normal text-[0.8rem] p-1",
            cell: "p-0",
            day: "h-9 w-full p-0",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary",
            day_today: "bg-accent text-accent-foreground rounded-md",
          }}
        />
      </motion.div>

      <MemoEventDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={dialogDate}
        eventName={eventName}
        hasEvent={customEventMap.has(
          dialogDate ? format(dialogDate, "yyyy-MM-dd") : ""
        )}
        onSave={(newEventName) => {
          if (!dialogDate || !newEventName.trim()) return;
          const dateStr = format(dialogDate, "yyyy-MM-dd");
          const existingEventIndex = customEvents.findIndex(
            (e) => e.date === dateStr
          );

          if (existingEventIndex > -1) {
            const updated = [...customEvents];
            updated[existingEventIndex].name = newEventName.trim();
            setCustomEvents(updated);
          } else {
            setCustomEvents([
              ...customEvents,
              { date: dateStr, name: newEventName.trim() },
            ]);
          }
          setIsDialogOpen(false);
        }}
        onDelete={() => {
          if (!dialogDate) return;
          const dateStr = format(dialogDate, "yyyy-MM-dd");
          setCustomEvents(customEvents.filter((e) => e.date !== dateStr));
          setIsDialogOpen(false);
        }}
      />
    </>
  );
}
