"use client";

import { Sidebar, Header } from "@/components/layout/AdminLayout";
import LicenseManagement from "@/components/licenses/LicenseManagement";

export default function LicensesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="License Management" />
        <main className="flex-1 overflow-y-auto">
          <LicenseManagement />
        </main>
      </div>
    </div>
  );
}
