"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationType = "alert" | "info" | "success" | "warning";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
}

interface Clinic {
  id: number;
  name: string;
  domain: string;
  licenseType: "Standalone" | "Subscription";
  status: "Active" | "Inactive";
  supportExpiry: string;
  licenses: Array<{
    id: number;
    status: "Active" | "Expired" | "Revoked";
    supportExpiry: string;
    createdAt: string;
  }>;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = async () => {
    try {
      const response = await fetch("/api/clinics");
      if (response.ok) {
        const clinics: Clinic[] = await response.json();
        const generatedNotifications: Notification[] = [];

        const now = new Date();
        const sevenDaysFromNow = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const thirtyDaysFromNow = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        clinics.forEach((clinic) => {
          // Check for expired licenses
          clinic.licenses.forEach((license) => {
            const expiryDate = new Date(license.supportExpiry);

            if (license.status === "Expired" && expiryDate < now) {
              generatedNotifications.push({
                id: `expired-${clinic.id}-${license.id}`,
                title: "License Expired",
                message: `${clinic.name} license has expired`,
                type: "alert",
                date: expiryDate.toISOString(),
                read: false,
              });
            }
            // Check for licenses expiring soon (within 7 days)
            else if (
              license.status === "Active" &&
              expiryDate <= sevenDaysFromNow &&
              expiryDate >= now
            ) {
              const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
              );
              generatedNotifications.push({
                id: `expiring-${clinic.id}-${license.id}`,
                title: "License Expiring Soon",
                message: `${clinic.name} license expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`,
                type: "warning",
                date: now.toISOString(),
                read: false,
              });
            }
            // Check for licenses expiring within 30 days
            else if (
              license.status === "Active" &&
              expiryDate <= thirtyDaysFromNow &&
              expiryDate > sevenDaysFromNow
            ) {
              const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
              );
              generatedNotifications.push({
                id: `expiring-30-${clinic.id}-${license.id}`,
                title: "License Expiring Soon",
                message: `${clinic.name} license expires in ${daysUntilExpiry} days`,
                type: "info",
                date: now.toISOString(),
                read: false,
              });
            }
          });

          // Check for clinics with no active licenses
          const hasActiveLicense = clinic.licenses.some(
            (license) => license.status === "Active"
          );
          if (!hasActiveLicense && clinic.licenses.length > 0) {
            generatedNotifications.push({
              id: `no-active-${clinic.id}`,
              title: "No Active License",
              message: `${clinic.name} has no active licenses`,
              type: "alert",
              date: now.toISOString(),
              read: false,
            });
          }

          // Check for recently added clinics (within last 7 days)
          const clinicCreatedDate = new Date(clinic.supportExpiry); // Using supportExpiry as proxy for creation
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          if (clinicCreatedDate >= sevenDaysAgo) {
            generatedNotifications.push({
              id: `new-clinic-${clinic.id}`,
              title: "New Clinic Added",
              message: `${clinic.name} has been added to your network`,
              type: "success",
              date: clinicCreatedDate.toISOString(),
              read: false,
            });
          }
        });

        // Sort notifications by date (most recent first)
        generatedNotifications.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Limit to most recent 20 notifications
        setNotifications(generatedNotifications.slice(0, 20));
      }
    } catch (error) {
      console.error("Failed to generate notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Filter notifications based on active tab and filter type
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread" && notification.read) return false;
    if (filterType !== "all" && notification.type !== filterType) return false;
    return true;
  });

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Get notification type badge color
  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return <Badge variant="destructive">Alert</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "info":
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setFilterType("all")}
                className={filterType === "all" ? "bg-accent" : ""}
              >
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("alert")}
                className={filterType === "alert" ? "bg-accent" : ""}
              >
                Alerts
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("warning")}
                className={filterType === "warning" ? "bg-accent" : ""}
              >
                Warnings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("success")}
                className={filterType === "success" ? "bg-accent" : ""}
              >
                Success
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("info")}
                className={filterType === "info" ? "bg-accent" : ""}
              >
                Information
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      </CardHeader>

      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "all" | "unread")}
      >
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-3">
          <TabsContent value="all" className="m-0">
            <NotificationsList
              notifications={filteredNotifications}
              formatRelativeTime={formatRelativeTime}
              getNotificationBadge={getNotificationBadge}
              markAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationsList
              notifications={filteredNotifications}
              formatRelativeTime={formatRelativeTime}
              getNotificationBadge={getNotificationBadge}
              markAsRead={markAsRead}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

interface NotificationsListProps {
  notifications: Notification[];
  formatRelativeTime: (date: string) => string;
  getNotificationBadge: (type: NotificationType) => React.ReactNode;
  markAsRead: (id: string) => void;
}

function NotificationsList({
  notifications,
  formatRelativeTime,
  getNotificationBadge,
  markAsRead,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mb-2 opacity-20" />
        <p>No notifications to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`relative p-4 rounded-lg transition-colors ${notification.read ? "bg-gray-50" : "bg-blue-50"}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  {getNotificationBadge(notification.type)}
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(notification.date)}
                </p>
              </div>

              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
