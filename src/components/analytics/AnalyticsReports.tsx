"use client";

import React, { useState, useEffect } from "react";
import { Download, TrendingUp, Users, Calendar, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalLicenses: number;
    activeLicenses: number;
    expiredLicenses: number;
    revokedLicenses: number;
    totalClinics: number;
    totalRevenue: number;
    averageRevenuePerLicense: number;
    expiringSoon: number;
    totalAuditLogs: number;
  };
  charts: {
    licenseStatus: Array<{ name: string; value: number; color: string }>;
    licenseType: Array<{ name: string; value: number; color: string }>;
    revenueByMonth: Array<any>;
    clinicGrowth: Array<any>;
    monthlyTrends: Array<any>;
    auditActivity: Array<any>;
  };
  period: string;
  generatedAt: string;
}

export default function AnalyticsReports() {
  const [dateRange, setDateRange] = useState("6months");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?period=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExportCSV = () => {
    // Export current analytics data as CSV
    if (!analyticsData) return;

    const { summary } = analyticsData;
    const csvData = [
      ["Metric", "Value"],
      ["Total Clinics", summary.totalClinics.toString()],
      ["Active Licenses", summary.activeLicenses.toString()],
      ["Expired Licenses", summary.expiredLicenses.toString()],
      ["Revoked Licenses", summary.revokedLicenses.toString()],
      ["Expiring Soon", summary.expiringSoon.toString()],
      ["Total Revenue", formatCurrency(summary.totalRevenue)],
      [
        "Average Revenue per License",
        formatCurrency(summary.averageRevenuePerLicense),
      ],
      ["Total Audit Logs", summary.totalAuditLogs.toString()],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Mock PDF export - in real app, would use a library like jsPDF
    console.log("Exporting PDF report...");
    alert(
      "PDF export functionality would be implemented with a library like jsPDF"
    );
  };

  // Extract data from API response
  const licenseDistributionData = analyticsData?.charts.licenseType || [];
  const licenseStatusData = analyticsData?.charts.licenseStatus || [];
  const revenueData = analyticsData?.charts.revenueByMonth || [];
  const clinicGrowthData = analyticsData?.charts.clinicGrowth || [];
  const monthlyTrendsData = analyticsData?.charts.monthlyTrends || [];
  const auditActivityData = analyticsData?.charts.auditActivity || [];
  const summaryStats = analyticsData?.summary || {
    totalLicenses: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    revokedLicenses: 0,
    totalClinics: 0,
    totalRevenue: 0,
    averageRevenuePerLicense: 0,
    expiringSoon: 0,
    totalAuditLogs: 0,
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your dental clinic network
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Clinics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.totalClinics}
            </div>
            <p className="text-xs text-green-600">Active network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Active Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.activeLicenses}
            </div>
            <p className="text-xs text-green-600">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.expiringSoon}
            </div>
            <p className="text-xs text-yellow-600">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryStats.totalRevenue)}
            </div>
            <p className="text-xs text-green-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Ban className="h-4 w-4 mr-2" />
              Revoked Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.revokedLicenses}
            </div>
            <p className="text-xs text-red-600">Permanently revoked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Avg Revenue/License
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryStats.averageRevenuePerLicense)}
            </div>
            <p className="text-xs text-blue-600">Per license</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.totalAuditLogs}
            </div>
            <p className="text-xs text-purple-600">Audit events</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licenses">License Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="activity">Clinic Activity</TabsTrigger>
          <TabsTrigger value="audit">Audit Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* License Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>License Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={licenseStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${((percent as number) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {licenseStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="licenses"
                        stroke="#3b82f6"
                        name="New Licenses"
                      />
                      <Line
                        type="monotone"
                        dataKey="clinics"
                        stroke="#10b981"
                        name="New Clinics"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>License Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={licenseStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Count">
                      {licenseStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar
                      dataKey="standalone"
                      fill="#3b82f6"
                      name="Standalone Revenue"
                    />
                    <Bar
                      dataKey="subscription"
                      fill="#10b981"
                      name="Subscription Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clinicGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="New Clinics" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Activity</CardTitle>
              <p className="text-sm text-gray-600">
                Recent system activity and usage patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={auditActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* Dynamic bars based on available actions */}
                    {Object.keys(auditActivityData[0] || {})
                      .filter((key) => key !== "date")
                      .map((action, index) => (
                        <Bar
                          key={action}
                          dataKey={action}
                          fill={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                          name={action
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
