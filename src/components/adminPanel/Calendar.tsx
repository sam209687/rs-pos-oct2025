"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { getIndianHolidays } from "@/actions/calendar.Actions";

interface CalendarProps {
  onDateChange: SelectSingleEventHandler;
  selectedDate: Date | undefined;
}

export function CalendarComponent({ onDateChange, selectedDate }: CalendarProps) {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHolidays = async () => {
    setIsLoading(true);
    const holidayData = await getIndianHolidays();
    setHolidays(holidayData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const holidayModifiers = {
    holiday: holidays.map(h => new Date(h.date))
  };

  const holidayMap = new Map<string, string>();
  holidays.forEach(h => {
    holidayMap.set(h.date, h.name);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-900 text-white border-gray-700 hover:bg-gray-800",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 text-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              modifiers={holidayModifiers}
              initialFocus
              components={{
                Day: ({ day }) => {
                  const dateStr = format(day.date, 'yyyy-MM-dd');
                  const holidayName = holidayMap.get(dateStr);
                  
                  return (
                    <td className="relative p-0.5 text-center">
                      <div
                        className="h-9 w-9 flex items-center justify-center rounded-full mx-auto"
                        title={holidayName || ''}
                        aria-label={holidayName ? `Holiday: ${holidayName}` : ''}
                      >
                        {format(day.date, 'd')}
                        {holidayName && (
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                    </td>
                  );
                }
              }}
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={fetchHolidays} disabled={isLoading}>
          <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>
    </motion.div>
  );
}