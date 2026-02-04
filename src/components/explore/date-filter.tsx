"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

interface DateFilterProps {
  checkIn?: Date;
  checkOut?: Date;
  onChange: (checkIn?: Date, checkOut?: Date) => void;
}

export function DateFilter({ checkIn, checkOut, onChange }: DateFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: checkIn,
    to: checkOut,
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    onChange(range?.from, range?.to);
  };

  const handleClear = () => {
    setDateRange(undefined);
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">날짜</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "PPP", { locale: ko })} ~{" "}
                  {format(dateRange.to, "PPP", { locale: ko })}
                </>
              ) : (
                format(dateRange.from, "PPP", { locale: ko })
              )
            ) : (
              <span>날짜 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={(date) => date < new Date()}
            locale={ko}
          />
        </PopoverContent>
      </Popover>

      {(dateRange?.from || dateRange?.to) && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="w-full">
          날짜 초기화
        </Button>
      )}

      {dateRange?.from && dateRange?.to && (
        <p className="text-xs text-gray-500 text-center">
          {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))}박
        </p>
      )}
    </div>
  );
}
