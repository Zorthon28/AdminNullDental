"use client";

import { Sidebar, Header } from "@/components/layout/AdminLayout";
import LogsAuditTrail from "@/components/logs/LogsAuditTrail";

export default function LogsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Audit Logs" />
        <main className="flex-1 overflow-y-auto">
          <LogsAuditTrail />
        </main>
      </div>
    </div>
  );
}
