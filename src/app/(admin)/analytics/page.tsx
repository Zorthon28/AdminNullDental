"use client";

import { Sidebar, Header } from "@/components/layout/AdminLayout";
import AnalyticsReports from "@/components/analytics/AnalyticsReports";

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics & Reports" />
        <main className="flex-1 overflow-y-auto">
          <AnalyticsReports />
        </main>
      </div>
    </div>
  );
}
