"use client";

import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-system";

interface AuditLog {
  id: number;
  timestamp: string;
  adminUserId: number;
  adminUser: {
    id: number;
    email: string;
    name: string | null;
  };
  action: string;
  details: string | null;
  createdAt: string;
}

export default function LogsAuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const { showError } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/audit-logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        showError("Failed to fetch audit logs");
      }
    } catch (error) {
      showError("Error fetching audit logs");
    } finally {
      setLoading(false);
    }
  };

  // Get unique admin users for filter
  const uniqueAdmins = Array.from(
    new Set(logs.map((log) => log.adminUser.email))
  );

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details &&
        log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.adminUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdmin =
      adminFilter === "all" || log.adminUser.email === adminFilter;

    return matchesSearch && matchesAdmin;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportLogs = () => {
    // Export functionality - download CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Admin User,Action,Details\n" +
      filteredLogs
        .map(
          (log) =>
            `"${formatTimestamp(log.timestamp)}","${log.adminUser.email}","${log.action}","${log.details || ""}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Logs & Audit Trail
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all administrative actions and system events
          </p>
        </div>

        <Button
          onClick={handleExportLogs}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs by action, details, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Admin User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueAdmins.map((admin) => (
                  <SelectItem key={admin} value={admin}>
                    {admin.split("@")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>{log.adminUser.email.split("@")[0]}</TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell
                    className="max-w-md truncate"
                    title={log.details || undefined}
                  >
                    {log.details || "No details"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
