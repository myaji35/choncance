"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Check, X } from "lucide-react";

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: string;
  totalAmount: any;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  property: {
    name: string;
    thumbnailUrl: string | null;
  };
  user: {
    name: string | null;
    email: string | null;
  };
}

interface BookingListTableProps {
  bookings: Booking[];
}

export function BookingListTable({ bookings }: BookingListTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">아직 예약이 없습니다</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="default" className="bg-green-600">확정</Badge>;
      case "PENDING":
        return <Badge variant="secondary">대기 중</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">취소됨</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-600">완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>숙소</TableHead>
          <TableHead>게스트</TableHead>
          <TableHead>체크인</TableHead>
          <TableHead>체크아웃</TableHead>
          <TableHead>인원</TableHead>
          <TableHead>금액</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium">{booking.property.name}</TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">{booking.guestName}</div>
                <div className="text-gray-500">{booking.guestEmail}</div>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {format(new Date(booking.checkIn), "PPP", { locale: ko })}
            </TableCell>
            <TableCell className="text-sm">
              {format(new Date(booking.checkOut), "PPP", { locale: ko })}
            </TableCell>
            <TableCell className="text-sm">{booking.guests}명</TableCell>
            <TableCell className="font-medium">
              ₩{Number(booking.totalAmount).toLocaleString()}
            </TableCell>
            <TableCell>{getStatusBadge(booking.status)}</TableCell>
            <TableCell className="text-right">
              {booking.status === "PENDING" && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="default" className="bg-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    승인
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <X className="h-4 w-4 mr-1" />
                    거부
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
