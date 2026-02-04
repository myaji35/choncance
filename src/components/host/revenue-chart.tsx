"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.revenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>일별 매출</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₩${(value / 10000).toFixed(0)}만`}
              />
              <Tooltip
                formatter={(value: number) =>
                  `₩${value.toLocaleString("ko-KR")}`
                }
                labelStyle={{ color: "#000" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>매출 데이터가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
