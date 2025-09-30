"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Key,
  RefreshCw,
  Ban,
  Calendar,
  Copy,
  Download,
  ArrowRight,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast-system";
import { logAuditEvent } from "@/lib/audit";
import {
  PRICING_PLANS,
  getPlansByType,
  formatCurrency,
  getPricingPlan,
  getPricingPlans,
  type PricingPlan,
} from "@/lib/pricing";

// License Templates
interface LicenseTemplate {
  id: string;
  name: string;
  description: string;
  pricingPlanId: string;
  version: string;
  supportPeriod: number;
  supportPeriodUnit: "days" | "months";
}

const LICENSE_TEMPLATES: LicenseTemplate[] = [
  {
    id: "basic-standalone",
    name: "Basic Standalone",
    description: "Single clinic license with 12 months support",
    pricingPlanId: "standalone",
    version: "1.0",
    supportPeriod: 12,
    supportPeriodUnit: "months",
  },
  {
    id: "premium-standalone",
    name: "Premium Standalone",
    description: "Single clinic license with extended 24 months support",
    pricingPlanId: "standalone",
    version: "1.0",
    supportPeriod: 24,
    supportPeriodUnit: "months",
  },
  {
    id: "standard-subscription",
    name: "Standard Subscription",
    description: "Monthly subscription with 12 months support",
    pricingPlanId: "standard-monthly",
    version: "1.0",
    supportPeriod: 12,
    supportPeriodUnit: "months",
  },
  {
    id: "enterprise-subscription",
    name: "Enterprise Subscription",
    description: "Monthly subscription with 24 months support",
    pricingPlanId: "standard-monthly",
    version: "1.0",
    supportPeriod: 24,
    supportPeriodUnit: "months",
  },
];

interface License {
  id: number;
  clinicId: number;
  clinic: {
    id: number;
    name: string;
    domain: string;
  };
  key: string;
  type: "Standalone" | "Subscription";
  version: string;
  activationDate: string;
  firstActivated: string | null;
  supportExpiry: string;
  status: "Active" | "Expired" | "Revoked";
  lastVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Clinic {
  id: number;
  name: string;
  domain: string;
  licenseType: "Standalone" | "Subscription";
  licenses: Array<{
    id: number;
    status: "Active" | "Expired" | "Revoked";
  }>;
}

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedLicenses, setSelectedLicenses] = useState<number[]>([]);
  const [isNewLicenseModalOpen, setIsNewLicenseModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmRenewLicense, setConfirmRenewLicense] =
    useState<License | null>(null);
  const [confirmRevokeLicense, setConfirmRevokeLicense] =
    useState<License | null>(null);
  const [transferLicense, setTransferLicense] = useState<License | null>(null);
  const [selectedDestinationClinic, setSelectedDestinationClinic] =
    useState<string>("");
  const [confirmTransfer, setConfirmTransfer] = useState<{
    license: License;
    destinationClinicId: number;
  } | null>(null);
  const [licenseHistory, setLicenseHistory] = useState<License | null>(null);
  const [licenseAuditLogs, setLicenseAuditLogs] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    fetchLicenses();
    fetchClinics();
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      const response = await fetch("/api/global-settings");
      if (response.ok) {
        const settings = await response.json();
        const settingsMap: any = {};
        settings.forEach((setting: any) => {
          if (setting.key === "licenseRenewalReminderDays") {
            settingsMap.licenseRenewalReminderDays = parseInt(setting.value);
          } else if (setting.key === "bulkImportExportEnabled") {
            settingsMap.bulkImportExportEnabled = setting.value === "true";
          } else if (setting.key === "licenseTransferEnabled") {
            settingsMap.licenseTransferEnabled = setting.value === "true";
          } else if (setting.key === "licenseHistoryEnabled") {
            settingsMap.licenseHistoryEnabled = setting.value === "true";
          }
        });
        setGlobalSettings(settingsMap);
      }
    } catch (error) {
      console.error("Failed to load global settings:", error);
    }
  };

  const fetchLicenses = async () => {
    try {
      const response = await fetch("/api/licenses");
      if (response.ok) {
        const data = await response.json();
        setLicenses(data);
      } else {
        showError("Failed to fetch licenses");
      }
    } catch (error) {
      showError("Error fetching licenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics");
      if (response.ok) {
        const data = await response.json();
        setClinics(data);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
    }
  };

  // Filter licenses
  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || license.status === statusFilter;
    const matchesType = typeFilter === "all" || license.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Active
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            Expired
          </Badge>
        );
      case "Revoked":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
            Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSelectLicense = (licenseId: number) => {
    setSelectedLicenses((prev) =>
      prev.includes(licenseId)
        ? prev.filter((id) => id !== licenseId)
        : [...prev, licenseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLicenses.length === filteredLicenses.length) {
      setSelectedLicenses([]);
    } else {
      setSelectedLicenses(filteredLicenses.map((l) => l.id));
    }
  };

  const handleBatchRenewal = async () => {
    try {
      const renewalPromises = selectedLicenses.map(async (licenseId) => {
        const license = licenses.find((l) => l.id === licenseId);
        if (!license) return;

        const newExpiry = new Date(license.supportExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + 12); // Add 12 months

        return fetch("/api/licenses", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: licenseId,
            supportExpiry: newExpiry.toISOString(),
          }),
        });
      });

      await Promise.all(renewalPromises);
      fetchLicenses(); // Refresh the list
      showSuccess(
        "Batch Renewal Completed",
        `${selectedLicenses.length} licenses have been renewed for 12 months`
      );
      setSelectedLicenses([]);
    } catch (error) {
      showError("Failed to renew licenses");
    }
  };

  const handleRenewLicense = async (licenseId: number) => {
    try {
      const license = licenses.find((l) => l.id === licenseId);
      if (!license) return;

      // Check if license is revoked
      if (license.status === "Revoked") {
        showError(
          "Cannot Renew Revoked License",
          `License for ${license.clinic.name} is revoked and cannot be renewed`
        );
        return;
      }

      const newExpiry = new Date(license.supportExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + 12); // Add 12 months

      const response = await fetch("/api/licenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: licenseId,
          supportExpiry: newExpiry.toISOString(),
        }),
      });

      if (response.ok) {
        fetchLicenses(); // Refresh the list
        showSuccess(
          "License Renewed",
          `Support for ${license.clinic.name} extended by 12 months`
        );

        // Log audit event
        await logAuditEvent(
          1,
          "License Renewed",
          `Renewed license for ${license.clinic.name} (12 months)`
        );
      } else {
        showError("Failed to renew license");
      }
    } catch (error) {
      showError("Error renewing license");
    }
  };

  const handleRevokeLicense = async (licenseId: number) => {
    try {
      const response = await fetch("/api/licenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: licenseId, status: "Revoked" }),
      });

      if (response.ok) {
        const license = licenses.find((l) => l.id === licenseId);
        fetchLicenses(); // Refresh the list
        showWarning(
          "License Revoked",
          `License for ${license?.clinic.name} has been revoked`
        );

        // Log audit event
        await logAuditEvent(
          1,
          "License Revoked",
          `Revoked license for ${license?.clinic.name}`
        );
      } else {
        showError("Failed to revoke license");
      }
    } catch (error) {
      showError("Error revoking license");
    }
  };

  const handleTransferLicense = async (
    licenseId: number,
    newClinicId: number
  ) => {
    try {
      const response = await fetch("/api/licenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: licenseId, clinicId: newClinicId }),
      });

      if (response.ok) {
        const license = licenses.find((l) => l.id === licenseId);
        const newClinic = clinics.find((c) => c.id === newClinicId);
        fetchLicenses(); // Refresh the list
        showSuccess(
          "License Transferred",
          `License transferred from ${license?.clinic.name} to ${newClinic?.name}`
        );

        // Log audit event
        await logAuditEvent(
          1,
          "License Transferred",
          `Transferred license from ${license?.clinic.name} to ${newClinic?.name}`
        );
      } else {
        showError("Failed to transfer license");
      }
    } catch (error) {
      showError("Error transferring license");
    }
  };

  const showLicenseHistory = async (license: License) => {
    try {
      const response = await fetch("/api/audit-logs");
      if (response.ok) {
        const allLogs = await response.json();
        // Filter logs related to this license's clinic
        const relatedLogs = allLogs.filter(
          (log: any) =>
            log.details
              ?.toLowerCase()
              .includes(license.clinic.name.toLowerCase()) ||
            log.action.toLowerCase().includes("license")
        );
        setLicenseAuditLogs(relatedLogs);
        setLicenseHistory(license);
      } else {
        showError("Failed to fetch license history");
      }
    } catch (error) {
      showError("Error fetching license history");
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showSuccess(
      "License Key Copied",
      "License key has been copied to clipboard"
    );
  };

  const handleExportLicenses = () => {
    // Export functionality - download CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Clinic Name,License Key,Type,Version,Activation Date,First Activated,Support Expiry,Status,Last Verified\n" +
      filteredLicenses
        .map(
          (license) =>
            `"${license.clinic.name}","${license.key}","${license.type}","${license.version}","${license.activationDate}","${license.firstActivated || ""}","${license.supportExpiry}","${license.status}","${license.lastVerified || ""}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `licenses-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(
      "Export Complete",
      `${filteredLicenses.length} licenses exported to CSV`
    );
  };

  const handleImportLicenses = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split("\n").filter((line) => line.trim());
      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());

      // Expected headers
      const expectedHeaders = [
        "Clinic Name",
        "License Key",
        "Type",
        "Version",
        "Activation Date",
        "First Activated",
        "Support Expiry",
        "Status",
      ];

      if (!expectedHeaders.every((h) => headers.includes(h))) {
        showError(
          "Invalid CSV Format",
          "CSV must contain columns: Clinic Name, License Key, Type, Version, Activation Date, Support Expiry, Status"
        );
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(",")
          .map((v) => v.replace(/"/g, "").trim());
        if (values.length < 7) continue;

        const [
          clinicName,
          licenseKey,
          type,
          version,
          activationDate,
          firstActivated,
          supportExpiry,
          status,
        ] = values;

        // Find clinic by name
        const clinic = clinics.find((c) => c.name === clinicName);
        if (!clinic) {
          errorCount++;
          continue;
        }

        try {
          const response = await fetch("/api/licenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clinicId: clinic.id,
              type: type as "Standalone" | "Subscription",
              version,
              supportExpiry,
            }),
          });

          if (response.ok) {
            const createdLicense = await response.json();

            // Update status and firstActivated if needed
            const updates: any = {};
            if (status !== "Active") {
              updates.status = status as "Active" | "Expired" | "Revoked";
            }
            if (firstActivated && firstActivated.trim()) {
              updates.firstActivated = new Date(firstActivated).toISOString();
            }

            if (Object.keys(updates).length > 0) {
              await fetch("/api/licenses", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: createdLicense.id,
                  ...updates,
                }),
              });
            }
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      fetchLicenses(); // Refresh the list
      showSuccess(
        "Import Complete",
        `Successfully imported ${successCount} licenses. ${errorCount} failed.`
      );
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = "";
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            License Management
          </h1>
          <p className="text-gray-600">
            Manage software licenses and support renewals
          </p>
        </div>

        <div className="flex gap-2">
          {selectedLicenses.length > 0 && (
            <Button
              onClick={handleBatchRenewal}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Batch Renewal ({selectedLicenses.length})
            </Button>
          )}

          {globalSettings?.bulkImportExportEnabled && (
            <>
              <Button
                onClick={handleExportLicenses}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportLicenses}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="csv-import"
                />
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  asChild
                >
                  <label htmlFor="csv-import" className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Import CSV
                  </label>
                </Button>
              </div>
            </>
          )}

          <Dialog
            open={isNewLicenseModalOpen}
            onOpenChange={setIsNewLicenseModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Issue New License
              </Button>
            </DialogTrigger>
            <NewLicenseModal
              clinics={clinics}
              onSave={() => {
                fetchLicenses();
                setIsNewLicenseModalOpen(false);
              }}
              onCancel={() => setIsNewLicenseModalOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by clinic name or license key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Standalone">Standalone</SelectItem>
                <SelectItem value="Subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced table with better status colors */}
      <Card>
        <CardHeader>
          <CardTitle>Licenses ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedLicenses.length === filteredLicenses.length &&
                      filteredLicenses.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Clinic Name</TableHead>
                <TableHead>License Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Activation Date</TableHead>
                <TableHead>First Activated</TableHead>
                <TableHead>Support Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => {
                const reminderDays =
                  globalSettings?.licenseRenewalReminderDays || 30;
                const isExpiringSoon =
                  new Date(license.supportExpiry) <
                  new Date(Date.now() + reminderDays * 24 * 60 * 60 * 1000);

                return (
                  <TableRow
                    key={license.id}
                    className={
                      isExpiringSoon && license.status === "Active"
                        ? "bg-yellow-50"
                        : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedLicenses.includes(license.id)}
                        onCheckedChange={() => handleSelectLicense(license.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {license.clinic.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {license.key.length > 40
                            ? `${license.key.substring(0, 20)}...${license.key.substring(license.key.length - 20)}`
                            : license.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyLicenseKey(license.key)}
                          title="Copy full license key"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{license.type}</Badge>
                    </TableCell>
                    <TableCell>{license.version}</TableCell>
                    <TableCell>{license.activationDate}</TableCell>
                    <TableCell>
                      {license.firstActivated ? (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                            Activated
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(
                              license.firstActivated
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Activated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        isExpiringSoon && license.status === "Active"
                          ? "text-yellow-600 font-medium"
                          : ""
                      }
                    >
                      {license.supportExpiry}
                      {isExpiringSoon && license.status === "Active" && (
                        <span className="ml-2 text-xs text-yellow-600">
                          (Expires in{" "}
                          {Math.ceil(
                            (new Date(license.supportExpiry).getTime() -
                              Date.now()) /
                              (24 * 60 * 60 * 1000)
                          )}{" "}
                          days)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                    <TableCell>{license.lastVerified}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setConfirmRenewLicense(license)}
                          disabled={license.status === "Revoked"}
                          title={
                            license.status === "Revoked"
                              ? "Cannot renew revoked license"
                              : "Renew license (12 months)"
                          }
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        {globalSettings?.licenseTransferEnabled && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setTransferLicense(license)}
                            disabled={license.status === "Revoked"}
                            title={
                              license.status === "Revoked"
                                ? "Cannot transfer revoked license"
                                : "Transfer license to another clinic"
                            }
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {globalSettings?.licenseHistoryEnabled && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={() => showLicenseHistory(license)}
                            title="View license history"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setConfirmRevokeLicense(license)}
                          disabled={license.status === "Revoked"}
                          title="Revoke license"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={!!confirmRenewLicense}
        onOpenChange={() => setConfirmRenewLicense(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renew License</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to renew the license for{" "}
              <strong>{confirmRenewLicense?.clinic.name}</strong>? This will
              extend the support expiry by 12 months.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRenewLicense) {
                  handleRenewLicense(confirmRenewLicense.id);
                  setConfirmRenewLicense(null);
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Renew License
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmRevokeLicense}
        onOpenChange={() => setConfirmRevokeLicense(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke License</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the license for{" "}
              <strong>{confirmRevokeLicense?.clinic.name}</strong>? This action
              cannot be undone and will immediately invalidate the license.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRevokeLicense) {
                  handleRevokeLicense(confirmRevokeLicense.id);
                  setConfirmRevokeLicense(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Revoke License
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* License Transfer Modal */}
      <Dialog
        open={!!transferLicense}
        onOpenChange={() => {
          setTransferLicense(null);
          setSelectedDestinationClinic("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer License</DialogTitle>
            <DialogDescription>
              Transfer the license from{" "}
              <strong>{transferLicense?.clinic.name}</strong> to another clinic.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="destinationClinic">
                Select Destination Clinic{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedDestinationClinic}
                onValueChange={setSelectedDestinationClinic}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose destination clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics
                    .filter((clinic) => clinic.id !== transferLicense?.clinicId)
                    .map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id.toString()}>
                        {clinic.name} ({clinic.domain})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTransferLicense(null);
                setSelectedDestinationClinic("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedDestinationClinic}
              onClick={() => {
                if (transferLicense && selectedDestinationClinic) {
                  setConfirmTransfer({
                    license: transferLicense,
                    destinationClinicId: parseInt(selectedDestinationClinic),
                  });
                  setTransferLicense(null);
                  setSelectedDestinationClinic("");
                }
              }}
            >
              Transfer License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* License Transfer Confirmation */}
      <AlertDialog
        open={!!confirmTransfer}
        onOpenChange={() => setConfirmTransfer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm License Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer the license from{" "}
              <strong>{confirmTransfer?.license.clinic.name}</strong> to{" "}
              <strong>
                {
                  clinics.find(
                    (c) => c.id === confirmTransfer?.destinationClinicId
                  )?.name
                }
              </strong>
              ? This action will move the license immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmTransfer) {
                  handleTransferLicense(
                    confirmTransfer.license.id,
                    confirmTransfer.destinationClinicId
                  );
                  setConfirmTransfer(null);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Transfer License
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* License History Modal */}
      <Dialog
        open={!!licenseHistory}
        onOpenChange={() => setLicenseHistory(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>License History</DialogTitle>
            <DialogDescription>
              Audit trail for license: <strong>{licenseHistory?.key}</strong> (
              {licenseHistory?.clinic.name})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenseAuditLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.adminUser.email.split("@")[0]}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell
                      className="max-w-md truncate"
                      title={log.details}
                    >
                      {log.details || "No details"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {licenseAuditLogs.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No history events found for this license.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLicenseHistory(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NewLicenseModalProps {
  clinics: Clinic[];
  onSave: () => void;
  onCancel: () => void;
}

function NewLicenseModal({ clinics, onSave, onCancel }: NewLicenseModalProps) {
  const [formData, setFormData] = useState({
    clinicId: "",
    pricingPlanId: "",
    version: "1.0",
    activationDate: new Date().toISOString().split("T")[0],
    supportExpiry: "",
    supportPeriod: 12,
    supportPeriodUnit: "months" as "days" | "months",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [selectedPlanDescription, setSelectedPlanDescription] =
    useState<string>("");
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    loadGlobalSettings();
    loadPricingPlans();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      const response = await fetch("/api/global-settings");
      if (response.ok) {
        const settings = await response.json();
        const settingsMap: any = {};
        settings.forEach((setting: any) => {
          if (setting.key === "defaultLicenseDuration") {
            settingsMap.defaultLicenseDuration = parseInt(setting.value);
          } else if (setting.key === "maxClinicsPerLicense") {
            settingsMap.maxClinicsPerLicense = parseInt(setting.value);
          } else if (setting.key === "licenseTemplatesEnabled") {
            settingsMap.licenseTemplatesEnabled = setting.value === "true";
          }
        });
        setGlobalSettings(settingsMap);

        // Update form with default duration
        if (settingsMap.defaultLicenseDuration) {
          setFormData((prev) => ({
            ...prev,
            supportPeriod: settingsMap.defaultLicenseDuration,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load global settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadPricingPlans = async () => {
    try {
      const plans = await getPricingPlans();
      setPricingPlans(plans);
    } catch (error) {
      console.error("Failed to load pricing plans:", error);
    }
  };

  // Update pricing plan options when clinic changes
  const handleClinicChange = (clinicId: string) => {
    const clinic = clinics.find((c) => c.id.toString() === clinicId);
    const clinicType = clinic?.licenseType || "Standalone";

    // Set default pricing plan based on clinic type
    const defaultPlan =
      clinicType === "Standalone" ? "standalone" : "standard-yearly";

    setFormData((prev) => ({
      ...prev,
      clinicId,
      pricingPlanId: defaultPlan,
    }));

    // Update description for default plan
    getPricingPlan(defaultPlan).then((plan) => {
      setSelectedPlanDescription(plan?.description || "");
    });
  };

  // Update description when pricing plan changes
  const handlePricingPlanChange = async (pricingPlanId: string) => {
    setFormData((prev) => ({ ...prev, pricingPlanId }));
    const plan = await getPricingPlan(pricingPlanId);
    setSelectedPlanDescription(plan?.description || "");
  };

  // Apply template to form
  const applyTemplate = async (templateId: string) => {
    if (!templateId || templateId === "custom") {
      setSelectedTemplate("");
      return;
    }

    const template = LICENSE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    setFormData((prev) => ({
      ...prev,
      pricingPlanId: template.pricingPlanId,
      version: template.version,
      supportPeriod: template.supportPeriod,
      supportPeriodUnit: template.supportPeriodUnit,
    }));

    // Update plan description
    const plan = await getPricingPlan(template.pricingPlanId);
    setSelectedPlanDescription(plan?.description || "");
  };

  const { showSuccess, showError } = useToast();

  // Form validation
  const isFormValid =
    formData.clinicId &&
    formData.pricingPlanId &&
    formData.version.trim() &&
    formData.supportPeriod >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.clinicId) {
      showError("Clinic Required", "Please select a clinic for the license");
      return;
    }

    if (!formData.pricingPlanId) {
      showError("Pricing Plan Required", "Please select a pricing plan");
      return;
    }

    if (!formData.version.trim()) {
      showError("Version Required", "Please enter a version number");
      return;
    }

    if (formData.supportPeriod < 1) {
      showError("Invalid Support Period", "Support period must be at least 1");
      return;
    }

    // Get pricing plan details
    const selectedPlan = await getPricingPlan(formData.pricingPlanId);
    if (!selectedPlan) {
      showError("Invalid Pricing Plan", "Selected pricing plan is not valid");
      return;
    }

    // Check max clinics per license limit
    if (globalSettings?.maxClinicsPerLicense) {
      const selectedClinic = clinics.find(
        (c) => c.id.toString() === formData.clinicId
      );
      if (
        selectedClinic &&
        selectedClinic.licenses.length >= globalSettings.maxClinicsPerLicense
      ) {
        showError(
          "License Limit Exceeded",
          `This clinic already has ${selectedClinic.licenses.length} licenses. Maximum allowed: ${globalSettings.maxClinicsPerLicense}`
        );
        return;
      }
    }

    const supportExpiry = new Date(formData.activationDate);
    if (formData.supportPeriodUnit === "months") {
      supportExpiry.setMonth(supportExpiry.getMonth() + formData.supportPeriod);
    } else {
      supportExpiry.setDate(supportExpiry.getDate() + formData.supportPeriod);
    }

    try {
      const response = await fetch("/api/licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId: parseInt(formData.clinicId),
          type: selectedPlan.type,
          supportExpiry: supportExpiry.toISOString(),
          version: formData.version,
          price: selectedPlan.monthlyPrice, // Use monthly price as base
        }),
      });

      if (response.ok) {
        const clinic = clinics.find(
          (c) => c.id.toString() === formData.clinicId
        );
        onSave();
        showSuccess(
          "License Issued Successfully",
          `New ${selectedPlan.name} license created for ${clinic?.name}`
        );

        // Log audit event
        await logAuditEvent(
          1,
          "License Issued",
          `Issued ${selectedPlan.name} license for ${clinic?.name}`
        );
      } else {
        showError("Failed to create license");
      }
    } catch (error) {
      showError("Error creating license");
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Issue New License</DialogTitle>
        <DialogDescription>
          Create a new signed license and assign it to a clinic
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {globalSettings?.licenseTemplatesEnabled && (
          <div>
            <Label htmlFor="template">License Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or customize manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Configuration</SelectItem>
                {LICENSE_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-gray-600 mt-1">
                Template applied:{" "}
                {
                  LICENSE_TEMPLATES.find((t) => t.id === selectedTemplate)
                    ?.description
                }
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="clinicId">
            Select Clinic <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.clinicId} onValueChange={handleClinicChange}>
            <SelectTrigger
              className={!formData.clinicId ? "border-red-300" : ""}
            >
              <SelectValue placeholder="Choose a clinic" />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id.toString()}>
                  {clinic.name} ({clinic.domain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!formData.clinicId && (
            <p className="text-sm text-red-600 mt-1">Please select a clinic</p>
          )}
        </div>

        <div>
          <Label htmlFor="pricingPlan">
            Pricing Plan <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.pricingPlanId}
            onValueChange={handlePricingPlanChange}
          >
            <SelectTrigger
              className={!formData.pricingPlanId ? "border-red-300" : ""}
            >
              <SelectValue placeholder="Select a pricing plan" />
            </SelectTrigger>
            <SelectContent>
              {pricingPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - {formatCurrency(plan.monthlyPrice)}
                  {plan.type === "Subscription" && " (Monthly)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!formData.pricingPlanId && (
            <p className="text-sm text-red-600 mt-1">
              Please select a pricing plan
            </p>
          )}
          {formData.pricingPlanId && selectedPlanDescription && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedPlanDescription}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="version">
            Version <span className="text-red-500">*</span>
          </Label>
          <Input
            id="version"
            type="text"
            value={formData.version}
            onChange={(e) =>
              setFormData({ ...formData, version: e.target.value })
            }
            placeholder="e.g. 1.0"
            className={!formData.version.trim() ? "border-red-300" : ""}
            required
          />
          {!formData.version.trim() && (
            <p className="text-sm text-red-600 mt-1">Version is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="activationDate">Activation Date</Label>
          <Input
            id="activationDate"
            type="date"
            value={formData.activationDate}
            onChange={(e) =>
              setFormData({ ...formData, activationDate: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="supportPeriod">
            Support Period <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="supportPeriod"
              type="number"
              min="1"
              value={formData.supportPeriod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  supportPeriod: parseInt(e.target.value) || 1,
                })
              }
              className={`flex-1 ${formData.supportPeriod < 1 ? "border-red-300" : ""}`}
              placeholder="Enter duration"
            />
            <Select
              value={formData.supportPeriodUnit}
              onValueChange={(value: "days" | "months") =>
                setFormData({ ...formData, supportPeriodUnit: value })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.supportPeriod < 1 && (
            <p className="text-sm text-red-600 mt-1">
              Support period must be at least 1
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!isFormValid}
          >
            Issue License
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
