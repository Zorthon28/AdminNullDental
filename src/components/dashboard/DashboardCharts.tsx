"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardChartsProps {
  licenseData?: {
    standalone: number;
    subscription: number;
  };
  expirationData?: Array<{
    date: string;
    count: number;
  }>;
}

const DashboardCharts = ({
  licenseData = { standalone: 65, subscription: 35 },
  expirationData = [
    { date: "Jan", count: 4 },
    { date: "Feb", count: 3 },
    { date: "Mar", count: 7 },
    { date: "Apr", count: 5 },
    { date: "May", count: 9 },
    { date: "Jun", count: 6 },
    { date: "Jul", count: 8 },
    { date: "Aug", count: 12 },
  ],
}: DashboardChartsProps) => {
  const [licenseView, setLicenseView] = useState<"pie" | "donut">("donut");
  const [timelineView, setTimelineView] = useState<"monthly" | "quarterly">(
    "monthly"
  );

  // Transform license data for pie chart
  const pieData = [
    { name: "Standalone", value: licenseData.standalone, color: "#4f46e5" },
    { name: "Subscription", value: licenseData.subscription, color: "#06b6d4" },
  ];

  // Quarterly data (aggregated from monthly)
  const quarterlyData = [
    {
      date: "Q1",
      count: expirationData
        .slice(0, 3)
        .reduce((sum, item) => sum + item.count, 0),
    },
    {
      date: "Q2",
      count: expirationData
        .slice(3, 6)
        .reduce((sum, item) => sum + item.count, 0),
    },
    {
      date: "Q3",
      count: expirationData
        .slice(6, 9)
        .reduce((sum, item) => sum + item.count, 0),
    },
    {
      date: "Q4",
      count: expirationData
        .slice(9, 12)
        .reduce((sum, item) => sum + item.count, 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background">
      {/* License Type Distribution Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>License Distribution</CardTitle>
              <CardDescription>
                Breakdown of license types across clinics
              </CardDescription>
            </div>
            <Tabs
              defaultValue="donut"
              className="w-[180px]"
              onValueChange={(value) =>
                setLicenseView(value as "pie" | "donut")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="donut">Donut</TabsTrigger>
                <TabsTrigger value="pie">Pie</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(Number(percent) * 100).toFixed(0)}%`
                  }
                  outerRadius={licenseView === "pie" ? 100 : 100}
                  innerRadius={licenseView === "donut" ? 60 : 0}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} clinics`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Support Expiration Timeline Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Expiration Timeline</CardTitle>
              <CardDescription>
                Upcoming support expirations over time
              </CardDescription>
            </div>
            <Tabs
              defaultValue="monthly"
              className="w-[180px]"
              onValueChange={(value) =>
                setTimelineView(value as "monthly" | "quarterly")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  timelineView === "monthly" ? expirationData : quarterlyData
                }
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} clinics`, "Expirations"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Expiring Support"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
