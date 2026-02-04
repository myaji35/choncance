"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications?limit=100");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "BOOKING_CONFIRMED":
        return "✅";
      case "BOOKING_REJECTED":
        return "❌";
      case "BOOKING_CANCELLED":
        return "🚫";
      case "REVIEW_RECEIVED":
        return "⭐";
      case "HOST_REPLY":
        return "💬";
      case "PAYMENT_SUCCESS":
        return "💰";
      case "PAYMENT_FAILED":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">알림</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              읽지 않은 알림 {unreadCount}개
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            모두 읽음 처리
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="all">
            전체 ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            안읽음 ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            getNotificationIcon={getNotificationIcon}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            getNotificationIcon={getNotificationIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  notifications,
  isLoading,
  onNotificationClick,
  getNotificationIcon,
}: {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
  getNotificationIcon: (type: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gray-100 p-4 rounded-full">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">알림이 없습니다</h3>
            <p className="text-sm text-gray-500 mt-1">
              새로운 알림이 도착하면 여기에 표시됩니다
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            !notification.read ? "bg-blue-50 border-blue-200" : "bg-white"
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="flex items-start gap-4">
            <div className="text-2xl flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3
                  className={`font-semibold ${
                    !notification.read ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {notification.title}
                </h3>
                {!notification.read && (
                  <Badge variant="secondary" className="flex-shrink-0">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
