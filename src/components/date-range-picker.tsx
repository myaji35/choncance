"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  onFocus,
  onBlur,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onChange) {
      onChange(range);
    }
    // 체크아웃 날짜까지 선택되면 팝오버 자동 닫기
    if (range?.from && range?.to) {
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const formatDateRange = () => {
    if (!date?.from) {
      return "날짜 선택";
    }
    if (date.to) {
      return `${format(date.from, "M월 d일", { locale: ko })} ~ ${format(date.to, "M월 d일", { locale: ko })}`;
    }
    return format(date.from, "M월 d일", { locale: ko });
  };

  return (
    <div className={cn("", className)}>
      <label className="block text-xs font-semibold text-gray-900 mb-1">
        숙박 기간
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal p-0 h-auto hover:bg-transparent",
              !date && "text-muted-foreground"
            )}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <span className="text-sm text-gray-500">
              {formatDateRange()}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ko}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
