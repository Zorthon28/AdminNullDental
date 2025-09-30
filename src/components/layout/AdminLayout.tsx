"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  BarChart3,
  FileSearch,
  Settings,
  Bell,
  User,
  LogOut,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast-system";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { showSuccess } = useToast();

  const handleLogout = () => {
    logout();
    showSuccess(
      "Logged out successfully",
      "You have been signed out of the admin portal"
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    { id: "clinics", label: "Clinics", icon: Building2, path: "/clinics" },
    { id: "licenses", label: "Licenses", icon: FileText, path: "/licenses" },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    { id: "logs", label: "Audit Logs", icon: FileSearch, path: "/logs" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          NullDental
        </h2>
        <p className="text-sm text-muted-foreground">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground border border-border"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {user?.username || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role || "Administrator"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [notifications, setNotifications] = useState(0);
  const [expiringLicenses, setExpiringLicenses] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load notifications
    loadNotifications();

    return () => clearInterval(timer);
  }, []);

  const loadNotifications = async () => {
    try {
      // Get licenses that are expiring soon
      const response = await fetch("/api/licenses");
      if (response.ok) {
        const licenses = await response.json();

        // Get global settings for reminder days
        const settingsResponse = await fetch("/api/global-settings");
        let reminderDays = 30; // default
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const reminderSetting = settings.find(
            (s: any) => s.key === "licenseRenewalReminderDays"
          );
          if (reminderSetting) {
            reminderDays = parseInt(reminderSetting.value);
          }
        }

        // Find licenses expiring soon
        const expiringSoon = licenses.filter((license: any) => {
          const expiryDate = new Date(license.supportExpiry);
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          );
          return (
            daysUntilExpiry <= reminderDays &&
            daysUntilExpiry > 0 &&
            license.status === "Active"
          );
        });

        setExpiringLicenses(expiringSoon);
        setNotifications(expiringSoon.length);

        // If no expiring licenses, load recent activity
        if (expiringSoon.length === 0) {
          const auditResponse = await fetch("/api/audit-logs?limit=3");
          if (auditResponse.ok) {
            const auditLogs = await auditResponse.json();
            setRecentActivity(auditLogs);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center space-x-6">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-accent/50"
                title={`${notifications} license${notifications !== 1 ? "s" : ""} expiring soon`}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground font-medium">
                    {notifications > 99 ? "99+" : notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                {notifications > 0 ? "Expiring Licenses" : "Recent Activity"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications > 0 ? (
                // Show expiring licenses
                expiringLicenses.slice(0, 5).map((license: any) => {
                  const daysUntilExpiry = Math.ceil(
                    (new Date(license.supportExpiry).getTime() - Date.now()) /
                      (24 * 60 * 60 * 1000)
                  );
                  return (
                    <DropdownMenuItem
                      key={license.id}
                      className="flex items-start space-x-3 p-3"
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {license.clinic.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          License expires in {daysUntilExpiry} day
                          {daysUntilExpiry !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              ) : // Show recent activity
              recentActivity.length > 0 ? (
                recentActivity.map((activity: any) => (
                  <DropdownMenuItem
                    key={activity.id}
                    className="flex items-start space-x-3 p-3"
                  >
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  No recent activity
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                View All {notifications > 0 ? "Licenses" : "Activity"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Current Time & Date */}
          <div className="flex items-center space-x-3 text-right">
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
