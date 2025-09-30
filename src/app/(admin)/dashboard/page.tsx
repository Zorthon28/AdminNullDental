"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Header } from "@/components/layout/AdminLayout";
import { StatCards } from "@/components/dashboard/StatCards";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import { DashboardTutorial } from "@/components/tutorial/DashboardTutorial";

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
  }>;
}

function DashboardContent() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics");
      if (response.ok) {
        const data = await response.json();
        setClinics(data);
      }
    } catch (error) {
      console.error("Failed to fetch clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real data
  const calculateStats = () => {
    const totalClinics = clinics.length;

    // Count licenses by status
    let activeLicenses = 0;
    let expiredLicenses = 0;
    let expiringSoon = 0;

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    clinics.forEach((clinic) => {
      clinic.licenses.forEach((license) => {
        const expiryDate = new Date(license.supportExpiry);

        if (license.status === "Active") {
          activeLicenses++;
          if (expiryDate < thirtyDaysFromNow && expiryDate >= now) {
            expiringSoon++;
          }
        } else if (license.status === "Expired") {
          expiredLicenses++;
        }
      });
    });

    return {
      totalClinics,
      activeLicenses,
      expiredLicenses,
      expiringSoon,
    };
  };

  // Calculate license distribution
  const calculateLicenseDistribution = () => {
    const distribution = { standalone: 0, subscription: 0 };

    clinics.forEach((clinic) => {
      if (clinic.licenseType === "Standalone") {
        distribution.standalone++;
      } else if (clinic.licenseType === "Subscription") {
        distribution.subscription++;
      }
    });

    return distribution;
  };

  // Calculate expiration timeline (next 8 months)
  const calculateExpirationTimeline = () => {
    const timeline = [];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);

      let count = 0;
      clinics.forEach((clinic) => {
        clinic.licenses.forEach((license) => {
          if (license.status === "Active") {
            const expiryDate = new Date(license.supportExpiry);
            if (expiryDate >= monthStart && expiryDate <= monthEnd) {
              count++;
            }
          }
        });
      });

      timeline.push({
        date: monthStart.toLocaleDateString("en-US", { month: "short" }),
        count,
      });
    }

    return timeline;
  };

  const stats = calculateStats();
  const licenseDistribution = calculateLicenseDistribution();
  const expirationTimeline = calculateExpirationTimeline();

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Dashboard Overview" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard Overview" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div data-tutorial="stat-cards">
              <StatCards
                totalClinics={stats.totalClinics}
                activeLicenses={stats.activeLicenses}
                expiredLicenses={stats.expiredLicenses}
                expiringSoon={stats.expiringSoon}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2" data-tutorial="dashboard-charts">
                <DashboardCharts
                  licenseData={licenseDistribution}
                  expirationData={expirationTimeline}
                />
              </div>
              <div data-tutorial="notifications-panel">
                <NotificationsPanel />
              </div>
            </div>
            <div
              className="bg-card p-6 rounded-lg shadow border border-border"
              data-tutorial="recent-clinics"
            >
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Recent Clinics ({clinics.length})
              </h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {clinics.slice(0, 10).map((clinic) => (
                  <li
                    key={clinic.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {clinic.name}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({clinic.domain})
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          clinic.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {clinic.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {clinic.licenses.length} license
                      {clinic.licenses.length !== 1 ? "s" : ""}
                    </div>
                  </li>
                ))}
                {clinics.length > 10 && (
                  <li className="text-center text-muted-foreground text-sm py-2">
                    And {clinics.length - 10} more clinics...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardTutorial>
      <DashboardContent />
    </DashboardTutorial>
  );
}
