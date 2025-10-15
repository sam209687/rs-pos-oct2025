"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker"; // ✅ Import the DateRange type

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardFilterProps {
  onFilterChange: (filterType: string, fromDate?: Date, toDate?: Date) => void;
}

export function DashboardFilter({ onFilterChange }: DashboardFilterProps) {
  // ✅ Use the imported DateRange type for better type safety
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState("last7days");

  const handleFilterChange = (value: string) => {
    // If a preset is chosen, clear the custom date range
    if (value !== "dateRange") {
      setSelectedRange(undefined);
    }
    
    setFilterType(value);
    const now = new Date();
    let fromDate: Date | undefined;
    let toDate: Date | undefined = now;

    switch (value) {
      case "today":
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case "last3months":
        fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 3);
        fromDate.setHours(0, 0, 0, 0);
        break;
      default:
        fromDate = undefined;
        toDate = undefined;
        break;
    }
    onFilterChange(value, fromDate, toDate);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      // ✅ When a custom range is selected, update the filter type
      setFilterType("dateRange");
      onFilterChange("dateRange", range.from, range.to);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select value={filterType} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today's Business</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last3months">Last 3 Months</SelectItem>
          {/* ✅ Add a disabled item for when a custom range is active */}
          <SelectItem value="dateRange" disabled>
            Custom Range
          </SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, "LLL dd, y")} -{" "}
                  {format(selectedRange.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedRange.from, "LLL dd, y")
              )
            ) : (
              <span>Filter by date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedRange?.from}
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}