"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface BookingWidgetProps {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
  minNights: number;
  maxNights: number;
}

export function BookingWidget({
  propertyId,
  pricePerNight,
  maxGuests,
  minNights,
  maxNights,
}: BookingWidgetProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<number>(1);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Fetch booked dates on mount
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const response = await fetch(`/api/properties/${propertyId}/calendar?year=${year}&month=${month}`);
        const data = await response.json();

        if (response.ok) {
          setBookedDates(data.bookedDates || []);
        }
      } catch (error) {
        console.error("Failed to fetch booked dates:", error);
      }
    };

    fetchBookedDates();
  }, [propertyId]);

  const handleDateSelect = async (range: DateRange | undefined) => {
    setDateRange(range);
    setAvailabilityError(null);
    setPriceBreakdown(null);

    if (range?.from && range?.to) {
      await checkAvailability(range.from, range.to, guests);
    }
  };

  const checkAvailability = async (checkIn: Date, checkOut: Date, guestCount: number) => {
    setIsCheckingAvailability(true);
    setAvailabilityError(null);

    try {
      const params = new URLSearchParams({
        propertyId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: guestCount.toString(),
      });

      const response = await fetch(`/api/availability/check?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check availability");
      }

      if (!data.available) {
        setAvailabilityError(data.reason || "이 날짜에는 예약할 수 없습니다");
        setPriceBreakdown(null);
      } else {
        setPriceBreakdown(data.price);
      }
    } catch (error: any) {
      setAvailabilityError(error.message || "예약 가능 여부를 확인하는 중 오류가 발생했습니다");
      setPriceBreakdown(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleGuestsChange = (value: string) => {
    const guestCount = parseInt(value);
    setGuests(guestCount);

    if (dateRange?.from && dateRange?.to) {
      checkAvailability(dateRange.from, dateRange.to, guestCount);
    }
  };

  const handleReserve = () => {
    if (!dateRange?.from || !dateRange?.to || !priceBreakdown) {
      return;
    }

    // Navigate to checkout page with booking details
    const checkInStr = dateRange.from.toISOString().split("T")[0];
    const checkOutStr = dateRange.to.toISOString().split("T")[0];

    router.push(
      `/booking/checkout?propertyId=${propertyId}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guests}`
    );
  };

  const canReserve = dateRange?.from && dateRange?.to && priceBreakdown && !availabilityError;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Price */}
        <div className="pb-6 border-b">
          <p className="text-sm text-gray-600 mb-1">1박 기준</p>
          <p className="text-3xl font-bold text-gray-900">
            ₩{pricePerNight.toLocaleString()}
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">날짜</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "PPP", { locale: ko })} -{" "}
                      {format(dateRange.to, "PPP", { locale: ko })}
                    </>
                  ) : (
                    format(dateRange.from, "PPP", { locale: ko })
                  )
                ) : (
                  <span>날짜를 선택하세요</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  // Disable past dates
                  if (date < new Date()) return true;

                  // Disable booked dates
                  const dateStr = date.toISOString().split("T")[0];
                  return bookedDates.includes(dateStr);
                }}
                numberOfMonths={2}
                locale={ko}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">게스트</label>
          <Select value={guests.toString()} onValueChange={handleGuestsChange}>
            <SelectTrigger>
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>게스트 {guests}명</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  게스트 {count}명
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Check Status */}
        {isCheckingAvailability && (
          <div className="text-sm text-gray-600 text-center py-2">
            예약 가능 여부 확인 중...
          </div>
        )}

        {/* Error Message */}
        {availabilityError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {availabilityError}
          </div>
        )}

        {/* Price Breakdown */}
        {priceBreakdown && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>
                ₩{priceBreakdown.nightlyRate.toLocaleString()} × {priceBreakdown.numberOfNights}박
              </span>
              <span>₩{priceBreakdown.accommodationTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>서비스 수수료</span>
              <span>₩{priceBreakdown.serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-3 border-t">
              <span>총 합계</span>
              <span>₩{priceBreakdown.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Reserve Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleReserve}
          disabled={!canReserve || isCheckingAvailability}
        >
          예약하기
        </Button>

        <p className="text-xs text-gray-500 text-center">
          예약 확정 전에는 요금이 청구되지 않습니다
        </p>

        {/* Min/Max Nights Info */}
        {minNights > 1 || maxNights < 30 ? (
          <p className="text-xs text-gray-500 text-center">
            {minNights > 1 && `최소 ${minNights}박`}
            {minNights > 1 && maxNights < 30 && " · "}
            {maxNights < 30 && `최대 ${maxNights}박`}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
