"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingStatusChartProps {
  data: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
    REJECTED: number;
    NO_SHOW: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확정됨",
  CANCELLED: "취소됨",
  COMPLETED: "완료됨",
  REJECTED: "거절됨",
  NO_SHOW: "노쇼",
};

const COLORS: Record<string, string> = {
  PENDING: "#FBBF24", // yellow-400
  CONFIRMED: "#10B981", // green-500
  CANCELLED: "#EF4444", // red-500
  COMPLETED: "#3B82F6", // blue-500
  REJECTED: "#6B7280", // gray-500
  NO_SHOW: "#F97316", // orange-500
};

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  // Convert data to chart format
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0) // Only show statuses with bookings
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      status,
    }));

  const totalBookings = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>예약 상태</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value}건`,
                    "",
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                총 예약:{" "}
                <span className="font-semibold text-gray-900">
                  {totalBookings}건
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>예약 데이터가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
