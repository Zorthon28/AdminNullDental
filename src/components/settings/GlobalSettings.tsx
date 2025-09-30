"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  RefreshCw,
  Shield,
  Clock,
  Database,
  Mail,
  Edit,
  X,
  Bell,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast-system";
import { PRICING_PLANS, formatCurrency, type PricingPlan } from "@/lib/pricing";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { QRCodeCanvas } from "qrcode.react";

interface GlobalSettings {
  // Theme Settings
  theme: "light" | "dark" | "system";

  // Feature Toggles
  advancedReportsEnabled: boolean;
  automaticBackupsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  maintenanceModeEnabled: boolean;

  // Email Notification Granularity
  emailLicenseExpiry: boolean;
  emailLicenseExpiringSoon: boolean;
  emailNewClinicAdded: boolean;
  emailSystemAlerts: boolean;
  emailWeeklyReports: boolean;

  // License Settings
  defaultLicenseDuration: number;
  maxClinicsPerLicense: number;
  licenseRenewalReminderDays: number;

  // Advanced License Features
  licenseTemplatesEnabled: boolean;
  bulkImportExportEnabled: boolean;
  licenseTransferEnabled: boolean;
  licenseHistoryEnabled: boolean;

  // System Settings
  backupSchedule: string;
  backupRetentionDays: number;
  sessionTimeoutMinutes: number;

  // Notification Settings
  supportExpiryWarningDays: number;
  licenseExpiryWarningDays: number;
  adminEmailAddress: string;

  // Push Notification Settings
  pushNotificationsEnabled: boolean;
  pushLicenseExpiryAlerts: boolean;
  pushSystemAlerts: boolean;
  pushNewClinicAlerts: boolean;
}

const defaultSettings: GlobalSettings = {
  theme: "system",
  advancedReportsEnabled: true,
  automaticBackupsEnabled: false,
  emailNotificationsEnabled: true,
  maintenanceModeEnabled: false,
  emailLicenseExpiry: true,
  emailLicenseExpiringSoon: true,
  emailNewClinicAdded: true,
  emailSystemAlerts: true,
  emailWeeklyReports: false,
  defaultLicenseDuration: 12,
  maxClinicsPerLicense: 1,
  licenseRenewalReminderDays: 30,
  licenseTemplatesEnabled: false,
  bulkImportExportEnabled: false,
  licenseTransferEnabled: false,
  licenseHistoryEnabled: true,
  backupSchedule: "daily",
  backupRetentionDays: 30,
  sessionTimeoutMinutes: 60,
  supportExpiryWarningDays: 30,
  licenseExpiryWarningDays: 14,
  adminEmailAddress: "admin@nulldental.com",
  pushNotificationsEnabled: false,
  pushLicenseExpiryAlerts: true,
  pushSystemAlerts: true,
  pushNewClinicAlerts: false,
};

export default function GlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editForm, setEditForm] = useState({
    monthlyPrice: "",
    yearlyPrice: "",
    description: "",
  });
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loadingPricingPlans, setLoadingPricingPlans] = useState(true);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>("");
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [confirmDisable2FA, setConfirmDisable2FA] = useState(false);
  const { showError, showSuccess, showWarning } = useToast();
  const { twoFactorEnabled, enableTwoFactor, disableTwoFactor } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    loadSettings();
    loadPricingPlans();
  }, []);

  // Sync theme setting with theme provider
  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const loadPricingPlans = async () => {
    try {
      console.log("Loading pricing plans...");
      const response = await fetch("/api/pricing-plans");
      console.log("API response status:", response.status);
      if (response.ok) {
        const plans = await response.json();
        console.log("Loaded pricing plans:", plans);
        setPricingPlans(plans);
      } else {
        console.error("API error:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to load pricing plans:", error);
    } finally {
      setLoadingPricingPlans(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/global-settings");
      if (response.ok) {
        const dbSettings = await response.json();
        const loadedSettings = { ...defaultSettings };

        // Map database settings to our interface
        dbSettings.forEach((setting: any) => {
          const key = setting.key as keyof GlobalSettings;
          if (key in loadedSettings) {
            // Convert string values back to appropriate types
            if (typeof loadedSettings[key] === "boolean") {
              (loadedSettings as any)[key] = setting.value === "true";
            } else if (typeof loadedSettings[key] === "number") {
              (loadedSettings as any)[key] = parseInt(setting.value);
            } else {
              (loadedSettings as any)[key] = setting.value;
            }
          }
        });

        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validation before saving
    if (
      settings.supportExpiryWarningDays < 1 ||
      settings.supportExpiryWarningDays > 365
    ) {
      showError(
        "Invalid Support Warning Days",
        "Support expiry warning must be between 1 and 365 days"
      );
      return;
    }

    if (
      settings.licenseExpiryWarningDays < 1 ||
      settings.licenseExpiryWarningDays > 365
    ) {
      showError(
        "Invalid License Warning Days",
        "License expiry warning must be between 1 and 365 days"
      );
      return;
    }

    if (
      !settings.adminEmailAddress.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.adminEmailAddress)
    ) {
      showError("Invalid Admin Email", "Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    try {
      // Save each setting to the database
      const savePromises = Object.entries(settings).map(
        async ([key, value]) => {
          return fetch("/api/global-settings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key,
              value: value.toString(),
            }),
          });
        }
      );

      await Promise.all(savePromises);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Save Failed", "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const startEditingPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setEditForm({
      monthlyPrice: plan.monthlyPrice.toString(),
      yearlyPrice: plan.yearlyPrice.toString(),
      description: plan.description || "",
    });
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setEditForm({ monthlyPrice: "", yearlyPrice: "", description: "" });
  };

  const savePricingPlan = async () => {
    if (!editingPlan) return;

    const monthlyPrice = parseFloat(editForm.monthlyPrice);
    const yearlyPrice = parseFloat(editForm.yearlyPrice);

    if (isNaN(monthlyPrice) || monthlyPrice < 0) {
      showError(
        "Invalid Price",
        "Monthly price must be a valid positive number"
      );
      return;
    }

    if (
      editingPlan.type === "Subscription" &&
      (isNaN(yearlyPrice) || yearlyPrice < 0)
    ) {
      showError(
        "Invalid Price",
        "Yearly price must be a valid positive number"
      );
      return;
    }

    try {
      const response = await fetch(`/api/pricing-plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyPrice,
          yearlyPrice:
            editingPlan.type === "Subscription"
              ? yearlyPrice
              : editingPlan.yearlyPrice,
          description: editForm.description,
        }),
      });

      if (response.ok) {
        showSuccess(
          "Pricing Plan Updated",
          `${editingPlan.name} has been updated successfully`
        );
        // Invalidate cache to refresh pricing data
        const { invalidatePricingCache } = await import("@/lib/pricing");
        invalidatePricingCache();
        cancelEditing();
        // Optionally reload the page or update local state
        window.location.reload();
      } else {
        showError("Update Failed", "Failed to update pricing plan");
      }
    } catch (error) {
      showError("Update Failed", "Network error while updating pricing plan");
    }
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Global Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-800">
              <strong>Unsaved Changes:</strong> You have unsaved changes. Don't
              forget to save your settings.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="h-5 w-5 mr-2" />
              Theme Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme-select">
                Application Theme <span className="text-red-500">*</span>
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  updateSetting("theme", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose your preferred theme or follow system settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Feature Toggles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="advanced-reports">Advanced Reports</Label>
                <div className="text-sm text-gray-500">
                  Enable advanced analytics and reporting features
                </div>
              </div>
              <Switch
                id="advanced-reports"
                checked={settings.advancedReportsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("advancedReportsEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="automatic-backups">Automatic Backups</Label>
                  <Badge variant="secondary" className="text-xs">
                    Work in Progress
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Enable scheduled automatic system backups (coming soon)
                </div>
              </div>
              <Switch
                id="automatic-backups"
                checked={settings.automaticBackupsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("automaticBackupsEnabled", checked)
                }
                disabled
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <div className="text-sm text-gray-500">
                  Send email alerts for important events
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotificationsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("emailNotificationsEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <div className="text-sm text-gray-500">
                  Put the system in maintenance mode
                </div>
                {settings.maintenanceModeEnabled && (
                  <Badge variant="destructive" className="mt-1">
                    System in Maintenance
                  </Badge>
                )}
              </div>
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceModeEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("maintenanceModeEnabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-master">Enable Email Notifications</Label>
                <div className="text-sm text-gray-500">
                  Master switch for all email notifications
                </div>
              </div>
              <Switch
                id="email-master"
                checked={settings.emailNotificationsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("emailNotificationsEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Notification Types</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-license-expiry"
                  checked={settings.emailLicenseExpiry}
                  onCheckedChange={(checked) =>
                    updateSetting("emailLicenseExpiry", checked as boolean)
                  }
                  disabled={!settings.emailNotificationsEnabled}
                />
                <Label
                  htmlFor="email-license-expiry"
                  className={`text-sm ${
                    !settings.emailNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  License Expiry Alerts
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-license-expiring-soon"
                  checked={settings.emailLicenseExpiringSoon}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "emailLicenseExpiringSoon",
                      checked as boolean
                    )
                  }
                  disabled={!settings.emailNotificationsEnabled}
                />
                <Label
                  htmlFor="email-license-expiring-soon"
                  className={`text-sm ${
                    !settings.emailNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  License Expiring Soon (30 days)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-new-clinic"
                  checked={settings.emailNewClinicAdded}
                  onCheckedChange={(checked) =>
                    updateSetting("emailNewClinicAdded", checked as boolean)
                  }
                  disabled={!settings.emailNotificationsEnabled}
                />
                <Label
                  htmlFor="email-new-clinic"
                  className={`text-sm ${
                    !settings.emailNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  New Clinic Added
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-system-alerts"
                  checked={settings.emailSystemAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("emailSystemAlerts", checked as boolean)
                  }
                  disabled={!settings.emailNotificationsEnabled}
                />
                <Label
                  htmlFor="email-system-alerts"
                  className={`text-sm ${
                    !settings.emailNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  System Alerts & Errors
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-weekly-reports"
                  checked={settings.emailWeeklyReports}
                  onCheckedChange={(checked) =>
                    updateSetting("emailWeeklyReports", checked as boolean)
                  }
                  disabled={!settings.emailNotificationsEnabled}
                />
                <Label
                  htmlFor="email-weekly-reports"
                  className={`text-sm ${
                    !settings.emailNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  Weekly Summary Reports
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              License Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="default-duration">
                Default License Duration (Months)
              </Label>
              <Select
                value={settings.defaultLicenseDuration.toString()}
                onValueChange={(value) =>
                  updateSetting("defaultLicenseDuration", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="36">36 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max-clinics">Max Clinics per License</Label>
              <Input
                id="max-clinics"
                type="number"
                min="1"
                max="100"
                value={settings.maxClinicsPerLicense}
                onChange={(e) =>
                  updateSetting(
                    "maxClinicsPerLicense",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="renewal-reminder">
                License Renewal Reminder (Days)
              </Label>
              <Input
                id="renewal-reminder"
                type="number"
                min="1"
                max="90"
                value={settings.licenseRenewalReminderDays}
                onChange={(e) =>
                  updateSetting(
                    "licenseRenewalReminderDays",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="backup-schedule">Backup Schedule</Label>
                <Badge variant="secondary" className="text-xs">
                  Work in Progress
                </Badge>
              </div>
              <Select
                value={settings.backupSchedule}
                onValueChange={(value) =>
                  updateSetting("backupSchedule", value)
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="backup-retention">
                  Backup Retention (Days)
                </Label>
                <Badge variant="secondary" className="text-xs">
                  Work in Progress
                </Badge>
              </div>
              <Input
                id="backup-retention"
                type="number"
                min="1"
                max="365"
                value={settings.backupRetentionDays}
                onChange={(e) =>
                  updateSetting("backupRetentionDays", parseInt(e.target.value))
                }
                disabled
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="session-timeout">
                  Session Timeout (Minutes)
                </Label>
                <Badge variant="secondary" className="text-xs">
                  Work in Progress
                </Badge>
              </div>
              <Input
                id="session-timeout"
                type="number"
                min="15"
                max="480"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) =>
                  updateSetting(
                    "sessionTimeoutMinutes",
                    parseInt(e.target.value)
                  )
                }
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="support-warning">
                Support Expiry Warning (Days){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="support-warning"
                type="number"
                min="1"
                max="365"
                value={settings.supportExpiryWarningDays}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 365) {
                    updateSetting("supportExpiryWarningDays", value);
                  }
                }}
                className={
                  settings.supportExpiryWarningDays < 1 ||
                  settings.supportExpiryWarningDays > 365
                    ? "border-red-300"
                    : ""
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Days before support expiry to show warnings (1-365)
              </p>
              {(settings.supportExpiryWarningDays < 1 ||
                settings.supportExpiryWarningDays > 365) && (
                <p className="text-xs text-red-600 mt-1">
                  Must be between 1 and 365 days
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="license-warning">
                License Expiry Warning (Days){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="license-warning"
                type="number"
                min="1"
                max="365"
                value={settings.licenseExpiryWarningDays}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 365) {
                    updateSetting("licenseExpiryWarningDays", value);
                  }
                }}
                className={
                  settings.licenseExpiryWarningDays < 1 ||
                  settings.licenseExpiryWarningDays > 365
                    ? "border-red-300"
                    : ""
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Days before license expiry to show warnings (1-365)
              </p>
              {(settings.licenseExpiryWarningDays < 1 ||
                settings.licenseExpiryWarningDays > 365) && (
                <p className="text-xs text-red-600 mt-1">
                  Must be between 1 and 365 days
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="admin-email">
                Admin Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="admin-email"
                  type="email"
                  value={settings.adminEmailAddress}
                  onChange={(e) => {
                    const email = e.target.value;
                    updateSetting("adminEmailAddress", email);
                  }}
                  className={`flex-1 ${
                    !settings.adminEmailAddress.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                      settings.adminEmailAddress
                    )
                      ? "border-red-300"
                      : ""
                  }`}
                  placeholder="admin@example.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (
                      !settings.adminEmailAddress.trim() ||
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        settings.adminEmailAddress
                      )
                    ) {
                      showError(
                        "Invalid Email",
                        "Please enter a valid email address first"
                      );
                      return;
                    }

                    try {
                      const response = await fetch("/api/email/test", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          to: settings.adminEmailAddress,
                        }),
                      });

                      if (response.ok) {
                        showSuccess(
                          "Test Email Sent",
                          "Check your inbox for the test email"
                        );
                      } else {
                        const error = await response.json();
                        showError(
                          "Test Failed",
                          error.error || "Failed to send test email"
                        );
                      }
                    } catch (error) {
                      showError(
                        "Test Failed",
                        "Network error while sending test email"
                      );
                    }
                  }}
                  disabled={
                    !settings.adminEmailAddress.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                      settings.adminEmailAddress
                    )
                  }
                >
                  Test Email
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email address for system notifications and alerts
              </p>
              {(!settings.adminEmailAddress.trim() ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                  settings.adminEmailAddress
                )) && (
                <p className="text-xs text-red-600 mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans Management */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Pricing Plans Management
            </CardTitle>
            <p className="text-sm text-gray-600">
              View and manage license pricing plans. Prices are displayed in
              Mexican Pesos (MXN).
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingPricingPlans ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                pricingPlans.map((plan: PricingPlan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {editingPlan?.id === plan.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={savePricingPlan}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">
                              Monthly Price (MXN)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editForm.monthlyPrice}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  monthlyPrice: e.target.value,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <>
                            {plan.type === "Subscription" && (
                              <div>
                                <Label className="text-sm">
                                  Yearly Price (MXN)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editForm.yearlyPrice}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      yearlyPrice: e.target.value,
                                    }))
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            )}

                            <div>
                              <Label className="text-sm">Description</Label>
                              <Textarea
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Plan description"
                                rows={2}
                              />
                            </div>
                          </>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                plan.type === "Standalone"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {plan.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingPlan(plan)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Monthly:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(plan.monthlyPrice)}
                            </span>
                          </div>

                          {plan.type === "Subscription" && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Yearly:
                              </span>
                              <span className="font-medium">
                                {formatCurrency(plan.yearlyPrice)}
                              </span>
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              {plan.description}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <div className="text-sm text-gray-500">
                  {twoFactorEnabled
                    ? "Your account is protected with two-factor authentication. Disabling requires confirmation."
                    : "Add an extra layer of security to your account with time-based one-time passwords"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorEnabled && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Enabled
                  </Badge>
                )}
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const secret = enableTwoFactor();
                      setTwoFactorSecret(secret);
                      setShowTwoFactorSetup(true);
                    } else {
                      // Require confirmation to disable 2FA
                      setConfirmDisable2FA(true);
                    }
                  }}
                />
              </div>
            </div>

            {showTwoFactorSetup && twoFactorSecret && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Setup Two-Factor Authentication
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Scan this QR code with your authenticator app (Google
                  Authenticator, Authy, etc.):
                </p>
                {twoFactorSecret && (
                  <div className="flex justify-center mb-3">
                    <QRCodeCanvas
                      value={`otpauth://totp/NullDental:admin@nulldental.com?secret=${twoFactorSecret}&issuer=NullDental`}
                      size={200}
                      level="M"
                      className="border border-gray-300 rounded"
                    />
                  </div>
                )}
                <p className="text-sm text-blue-700 mb-2">
                  Or manually enter this secret key:
                </p>
                <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                  {twoFactorSecret}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Keep this secret key safe. You'll need it to recover access if
                  you lose your device.
                </p>
                <Button
                  onClick={() => setShowTwoFactorSetup(false)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  I've Set Up 2FA
                </Button>
              </div>
            )}

            {twoFactorEnabled && !showTwoFactorSetup && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Security Active
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Two-factor authentication is enabled and protecting your
                  account. You'll be prompted for a verification code on each
                  login attempt.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  🔒 Your account is secure with an additional layer of
                  protection
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disable 2FA Confirmation Dialog */}
        <AlertDialog
          open={confirmDisable2FA}
          onOpenChange={setConfirmDisable2FA}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Disable Two-Factor Authentication
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disable two-factor authentication? This
                will remove the extra layer of security from your account and
                make it more vulnerable to unauthorized access.
                <br />
                <br />
                <strong>This action cannot be easily undone.</strong> You'll
                need to re-setup 2FA from scratch if you want to enable it
                again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  disableTwoFactor();
                  setShowTwoFactorSetup(false);
                  setTwoFactorSecret("");
                  setConfirmDisable2FA(false);
                  showWarning(
                    "2FA Disabled",
                    "Two-factor authentication has been disabled. Your account is now less secure."
                  );
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Disable 2FA
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Push Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Push Notifications</Label>
                <div className="text-sm text-gray-500">
                  Receive browser notifications for important events
                </div>
              </div>
              <Switch
                checked={settings.pushNotificationsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("pushNotificationsEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Notification Types</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push-license-expiry"
                  checked={settings.pushLicenseExpiryAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("pushLicenseExpiryAlerts", checked as boolean)
                  }
                  disabled={!settings.pushNotificationsEnabled}
                />
                <Label
                  htmlFor="push-license-expiry"
                  className={`text-sm ${
                    !settings.pushNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  License Expiry Alerts
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push-system-alerts"
                  checked={settings.pushSystemAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("pushSystemAlerts", checked as boolean)
                  }
                  disabled={!settings.pushNotificationsEnabled}
                />
                <Label
                  htmlFor="push-system-alerts"
                  className={`text-sm ${
                    !settings.pushNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  System Alerts & Errors
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push-new-clinic"
                  checked={settings.pushNewClinicAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("pushNewClinicAlerts", checked as boolean)
                  }
                  disabled={!settings.pushNotificationsEnabled}
                />
                <Label
                  htmlFor="push-new-clinic"
                  className={`text-sm ${
                    !settings.pushNotificationsEnabled ? "text-gray-400" : ""
                  }`}
                >
                  New Clinic Registrations
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced License Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Advanced License Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="license-templates">License Templates</Label>
                <div className="text-sm text-gray-500">
                  Predefined configurations for different client types
                </div>
              </div>
              <Switch
                id="license-templates"
                checked={settings.licenseTemplatesEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("licenseTemplatesEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bulk-import-export">Bulk Import/Export</Label>
                <div className="text-sm text-gray-500">
                  CSV upload for multiple licenses
                </div>
              </div>
              <Switch
                id="bulk-import-export"
                checked={settings.bulkImportExportEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("bulkImportExportEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="license-transfer">License Transfer</Label>
                <div className="text-sm text-gray-500">
                  Move licenses between clinics
                </div>
              </div>
              <Switch
                id="license-transfer"
                checked={settings.licenseTransferEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("licenseTransferEnabled", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="license-history">License History</Label>
                <div className="text-sm text-gray-500">
                  Complete audit trail per license
                </div>
              </div>
              <Switch
                id="license-history"
                checked={settings.licenseHistoryEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("licenseHistoryEnabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
