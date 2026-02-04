"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevenueChart } from "@/components/host/revenue-chart";
import { BookingStatusChart } from "@/components/host/booking-status-chart";
import { PropertyRankingTable } from "@/components/host/property-ranking-table";
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface StatsData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalReviews: number;
    averageRating: number;
    recentBookingsCount: number;
    monthlyRevenue: number;
    monthlyBookingsCount: number;
  };
  bookingsByStatus: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
    REJECTED: number;
    NO_SHOW: number;
  };
  revenueByDate: Array<{ date: string; revenue: number }>;
  propertyPerformance: Array<{
    propertyId: string;
    propertyName: string;
    totalBookings: number;
    confirmedBookings: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
  }>;
}

export default function HostStatsPage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/host/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = () => {
    fetchStats();
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchStats();
    }, 100);
  };

  if (loading || !statsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { summary, bookingsByStatus, revenueByDate, propertyPerformance } =
    statsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/host/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              ← 대시보드로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">통계</h1>
          <p className="text-gray-600">호스트 성과 및 통계를 확인하세요</p>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilter}>
                  <Calendar className="w-4 h-4 mr-2" />
                  조회
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  초기화
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₩{(summary.totalRevenue / 10000).toFixed(0)}만
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    이번 달: ₩{(summary.monthlyRevenue / 10000).toFixed(0)}만
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Bookings */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 예약</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.totalBookings}건
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    이번 달: {summary.monthlyBookingsCount}건
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmed Bookings */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">확정된 예약</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.confirmedBookings}건
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    대기 중: {summary.pendingBookings}건
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">평균 평점</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.averageRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    총 리뷰: {summary.totalReviews}개
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <RevenueChart data={revenueByDate} />

          {/* Booking Status Chart */}
          <BookingStatusChart data={bookingsByStatus} />
        </div>

        {/* Property Ranking */}
        <PropertyRankingTable data={propertyPerformance} />
      </div>
    </div>
  );
}
