"use client";

import * as React from "react";
// ✅ 1. IMPORT `differenceInCalendarDays` for a more robust check
import { format, parseISO, subDays, isWithinInterval, startOfDay, differenceInCalendarDays } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type DayProps, type SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getIndianHolidays } from "@/actions/calendar.Actions";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Holiday = {
  name: string;
  date: string;
};

interface CalendarProps {
  selectedDate: Date | undefined;
  onDateChange: SelectSingleEventHandler;
}

export function CalendarComponent({ selectedDate, onDateChange }: CalendarProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHolidays = React.useCallback(async () => {
    setIsLoading(true);
    const holidayData = await getIndianHolidays();
    setHolidays(holidayData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const holidayMap = React.useMemo(() => {
    const map = new Map<string, string>();
    holidays.forEach(h => {
      map.set(h.date, h.name);
    });
    return map;
  }, [holidays]);

  // --- START OF CORRECTED LOGIC ---

  const displayHolidays = React.useMemo(() => {
    if (holidays.length === 0) return [];

    const today = startOfDay(new Date());

    const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

    return sortedHolidays.filter(holiday => {
      const holidayDate = parseISO(holiday.date);
      
      // ✅ 2. Use a more robust check to eliminate past dates.
      // If the difference in days is negative, the holiday is in the past.
      if (differenceInCalendarDays(holidayDate, today) < 0) {
        return false;
      }
      
      // If it's today or in the future, now check if we are in the 5-day display window.
      const displayStartDate = subDays(holidayDate, 5);
      return isWithinInterval(today, { start: displayStartDate, end: holidayDate });
    });
  }, [holidays]);

  // --- END OF CORRECTED LOGIC ---


  const DayWithHoliday = (props: DayProps) => {
    const { day, modifiers, className } = props;
    const dateStr = format(day.date, 'yyyy-MM-dd');
    const holidayName = holidayMap.get(dateStr);
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <td className={cn(className, "p-0")}>
            <div className={cn(
              "relative h-9 w-full p-0 font-normal flex items-center justify-center rounded-md",
              !modifiers.disabled && "hover:bg-accent hover:text-accent-foreground",
              modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary",
              modifiers.today && "bg-accent text-accent-foreground",
            )}>
              <span>{format(day.date, 'd')}</span>
              {holidayName && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              )}
            </div>
          </td>
        </TooltipTrigger>
        {holidayName && (
          <TooltipContent className="text-sm">
            <p>{holidayName}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card text-card-foreground border rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold">Calendar {format(new Date(), 'yyyy')}</h2>
          
          {displayHolidays.length > 0 && (
            <p className="text-sm text-yellow-500 animate-pulse">
              Upcoming: {displayHolidays.map(h => h.name).join(', ')}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={fetchHolidays} disabled={isLoading}>
          <RefreshCcw className={cn("h-4 w-4 text-muted-foreground", isLoading && "animate-spin")} />
        </Button>
      </div>
      
      <TooltipProvider>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
          showOutsideDays={false}
          className="w-full p-0"
          classNames={{
            table: "w-full border-collapse table-fixed",
            head_cell: "text-muted-foreground rounded-md font-normal text-[0.8rem] p-1",
            cell: "p-0",
            day: "h-9 w-full p-0",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
            day_today: "bg-accent text-accent-foreground rounded-md",
          }}
          components={{ Day: DayWithHoliday }}
        />
      </TooltipProvider>
    </motion.div>
  );
}