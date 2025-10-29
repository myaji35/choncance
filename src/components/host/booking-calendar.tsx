"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ko } from "date-fns/locale";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guestName: string;
  property: {
    name: string;
  };
}

interface BookingCalendarProps {
  propertyId?: string; // Optional: filter by specific property
}

export function BookingCalendar({ propertyId }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bookings for current month
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        const params = new URLSearchParams({
          year: year.toString(),
          month: month.toString(),
        });

        if (propertyId) {
          params.append("propertyId", propertyId);
        }

        const response = await fetch(`/api/host/bookings?${params}`);
        const data = await response.json();

        if (response.ok) {
          setBookings(data.bookings || []);

          // Build set of booked dates
          const dates = new Set<string>();
          data.bookings?.forEach((booking: Booking) => {
            const start = new Date(booking.checkIn);
            const end = new Date(booking.checkOut);

            let current = new Date(start);
            while (current < end) {
              dates.add(current.toISOString().split("T")[0]);
              current.setDate(current.getDate() + 1);
            }
          });

          setBookedDates(dates);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentMonth, propertyId]);

  // Get bookings for selected date
  const selectedDateBookings = selectedDate
    ? bookings.filter((booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        return selected >= checkIn && selected < checkOut;
      })
    : [];

  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-600">확정</Badge>;
      case "PENDING":
        return <Badge variant="secondary">대기</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-600">완료</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>예약 캘린더</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthChange("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {format(currentMonth, "yyyy년 M월", { locale: ko })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthChange("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={ko}
            className="rounded-md border"
            modifiers={{
              booked: (date) => {
                const dateStr = date.toISOString().split("T")[0];
                return bookedDates.has(dateStr);
              },
            }}
            modifiersClassNames={{
              booked: "bg-primary/20 font-bold",
            }}
          />

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 border"></div>
              <span>예약된 날짜</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary border"></div>
              <span>선택된 날짜</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? format(selectedDate, "M월 d일 (eee)", { locale: ko })
              : "날짜 선택"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">로딩 중...</p>
          ) : selectedDateBookings.length > 0 ? (
            <div className="space-y-4">
              {selectedDateBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{booking.property.name}</p>
                      <p className="text-sm text-gray-600">
                        게스트: {booking.guestName}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      체크인:{" "}
                      {format(new Date(booking.checkIn), "M/d (eee)", {
                        locale: ko,
                      })}
                    </p>
                    <p>
                      체크아웃:{" "}
                      {format(new Date(booking.checkOut), "M/d (eee)", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {selectedDate
                ? "이 날짜에 예약이 없습니다"
                : "날짜를 선택하여 예약을 확인하세요"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
