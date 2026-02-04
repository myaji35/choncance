"use client";

import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  checkIn?: Date;
  checkOut?: Date;
  onDateChange: (checkIn?: Date, checkOut?: Date) => void;
  disabledDates?: Date[];
  className?: string;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onDateChange,
  disabledDates = [],
  className,
}: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: checkIn,
    to: checkOut,
  });

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    onDateChange(selectedRange?.from, selectedRange?.to);
  };

  const disabled = [
    { before: new Date() }, // 과거 날짜 비활성화
    ...disabledDates.map((date) => ({ from: date, to: date })),
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !range?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "yyyy년 MM월 dd일", { locale: ko })} -{" "}
                  {format(range.to, "yyyy년 MM월 dd일", { locale: ko })}
                </>
              ) : (
                format(range.from, "yyyy년 MM월 dd일", { locale: ko })
              )
            ) : (
              <span>날짜를 선택하세요</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            disabled={disabled}
            locale={ko}
            numberOfMonths={2}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
