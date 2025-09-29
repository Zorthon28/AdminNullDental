"use client";

import { Sidebar, Header } from "@/components/layout/AdminLayout";
import GlobalSettings from "@/components/settings/GlobalSettings";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Global Settings" />
        <main className="flex-1 overflow-y-auto">
          <GlobalSettings />
        </main>
      </div>
    </div>
  );
}
