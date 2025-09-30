"use client";

import React from "react";
import { TutorialProvider } from "./TutorialProvider";
import { Tutorial } from "./Tutorial";

const DASHBOARD_TUTORIAL_STEPS = [
  {
    id: "sidebar-navigation",
    title: "Navigation Menu",
    content:
      "This sidebar contains all the main sections of your admin panel. Use it to navigate between different areas like Dashboard, Clinics, Licenses, Analytics, and Settings.",
    target: ".w-64.bg-white",
    placement: "right" as const,
  },
  {
    id: "header-notifications",
    title: "Notifications & Time",
    content:
      "The header shows important notifications about expiring licenses and the current time. You can also access theme settings here.",
    target: ".bg-white.border-b",
    placement: "bottom" as const,
  },
  {
    id: "stat-cards",
    title: "Key Statistics",
    content:
      "These cards show your most important metrics at a glance: total clinics, active licenses, expired licenses, and licenses expiring soon.",
    target: "[data-tutorial='stat-cards']",
    placement: "bottom" as const,
  },
  {
    id: "dashboard-charts",
    title: "Analytics Charts",
    content:
      "Visual charts help you understand license distribution (Standalone vs Subscription) and upcoming expirations over the next 8 months.",
    target: "[data-tutorial='dashboard-charts']",
    placement: "top" as const,
  },
  {
    id: "notifications-panel",
    title: "Notifications Panel",
    content:
      "This panel shows critical alerts and reminders about license expirations and system events. Stay on top of important updates here.",
    target: "[data-tutorial='notifications-panel']",
    placement: "left" as const,
  },
  {
    id: "recent-clinics",
    title: "Recent Clinics",
    content:
      "View your most recently added clinics with their status and license counts. Click on clinic names to manage individual clinics.",
    target: "[data-tutorial='recent-clinics']",
    placement: "top" as const,
  },
];

interface DashboardTutorialProps {
  children: React.ReactNode;
}

export function DashboardTutorial({ children }: DashboardTutorialProps) {
  return (
    <TutorialProvider steps={DASHBOARD_TUTORIAL_STEPS}>
      {children}
      <Tutorial />
    </TutorialProvider>
  );
}
