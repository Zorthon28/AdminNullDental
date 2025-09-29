"use client";

import { Sidebar, Header } from "@/components/layout/AdminLayout";
import ClinicsManagement from "@/components/clinics/ClinicsManagement";

export default function ClinicsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clinics Management" />
        <main className="flex-1 overflow-y-auto">
          <ClinicsManagement />
        </main>
      </div>
    </div>
  );
}
