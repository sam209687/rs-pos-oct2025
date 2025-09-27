"use client";

import { useState } from 'react';
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export function PermanentCalendarCard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const sundayModifiers = {
    sunday: {
      dayOfWeek: [0] // 0 is Sunday
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="col-span-2"
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        {/* <CardHeader>
          <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        </CardHeader> */}
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={sundayModifiers}
            modifiersClassNames={{
              sunday: "text-red-500",
            }}
            initialFocus
            className="w-full" // ✅ FIX: Added w-full class to fill the width
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}