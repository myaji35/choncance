import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, Clock, Calendar } from "lucide-react";

interface DashboardStatsProps {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  totalBookings: number;
}

export function DashboardStats({
  totalProperties,
  activeProperties,
  pendingProperties,
  totalBookings,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "전체 숙소",
      value: totalProperties,
      icon: Home,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "승인된 숙소",
      value: activeProperties,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "검토 중",
      value: pendingProperties,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "총 예약",
      value: totalBookings,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
