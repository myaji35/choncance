"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmBookingDialog } from "./confirm-booking-dialog";
import { RejectBookingDialog } from "./reject-booking-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  thumbnailUrl: string | null;
}

interface Payment {
  status: string;
  amount: number | { toNumber: () => number };
}

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalAmount: number | { toNumber: () => number };
  createdAt: Date;
  property: Property;
  payment: Payment | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BookingManagementTableProps {
  bookings: Booking[];
  properties: { id: string; name: string }[];
  pagination: Pagination;
  currentFilters: {
    propertyId?: string;
    status?: string;
  };
}

const statusInfo: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기 중", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "확정됨", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "취소됨", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "완료됨", color: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "거절됨", color: "bg-gray-100 text-gray-800" },
  NO_SHOW: { label: "노쇼", color: "bg-gray-100 text-gray-800" },
};

export function BookingManagementTable({
  bookings,
  properties,
  pagination,
  currentFilters,
}: BookingManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState(
    currentFilters.propertyId || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    currentFilters.status || "all"
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedProperty}
          onValueChange={(value) => {
            setSelectedProperty(value);
            handleFilterChange("propertyId", value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="모든 숙소" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 숙소</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value);
            handleFilterChange("status", value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="모든 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="PENDING">대기 중</SelectItem>
            <SelectItem value="CONFIRMED">확정됨</SelectItem>
            <SelectItem value="COMPLETED">완료됨</SelectItem>
            <SelectItem value="CANCELLED">취소됨</SelectItem>
            <SelectItem value="REJECTED">거절됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">예약이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>예약 번호</TableHead>
                  <TableHead>숙소</TableHead>
                  <TableHead>게스트</TableHead>
                  <TableHead>체크인</TableHead>
                  <TableHead>체크아웃</TableHead>
                  <TableHead>인원</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm">
                      {booking.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {booking.property.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.guestName}</div>
                        <div className="text-sm text-gray-600">
                          {booking.guestPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.checkIn), "yyyy.MM.dd (eee)", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.checkOut), "yyyy.MM.dd (eee)", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>{booking.guests}명</TableCell>
                    <TableCell>
                      ₩{(typeof booking.totalAmount === 'number' ? booking.totalAmount : booking.totalAmount.toNumber()).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={statusInfo[booking.status]?.color || ""}
                        variant="secondary"
                      >
                        {statusInfo[booking.status]?.label || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === "PENDING" && (
                        <div className="flex gap-2 justify-end">
                          <ConfirmBookingDialog bookingId={booking.id}>
                            <Button size="sm" variant="default">
                              확정
                            </Button>
                          </ConfirmBookingDialog>
                          <RejectBookingDialog bookingId={booking.id}>
                            <Button size="sm" variant="outline">
                              거절
                            </Button>
                          </RejectBookingDialog>
                        </div>
                      )}
                      {booking.status !== "PENDING" && (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                총 {pagination.total}개 중 {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center px-3 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
