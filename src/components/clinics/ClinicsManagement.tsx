"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  ShieldCheck,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-system";
import { logAuditEvent } from "@/lib/audit";

interface Clinic {
  id: number;
  name: string;
  domain: string;
  dbConnectionString: string | null;
  licenseType: "Standalone" | "Subscription";
  adminContact: string;
  status: "Active" | "Inactive";
  supportExpiry: Date;
  lastVerified: Date | null;
  createdAt: string;
  updatedAt: string;
  licenses: any[]; // For counting licenses
}

export default function ClinicsManagement() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [licenseFilter, setLicenseFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [viewingClinic, setViewingClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics");
      if (response.ok) {
        const data = await response.json();
        setClinics(data);
      } else {
        showError("Failed to fetch clinics");
      }
    } catch (error) {
      showError("Error fetching clinics");
    } finally {
      setLoading(false);
    }
  };

  // Filter clinics based on search and filters
  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || clinic.status === statusFilter;
    const matchesLicense =
      licenseFilter === "all" || clinic.licenseType === licenseFilter;

    return matchesSearch && matchesStatus && matchesLicense;
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
      case "Expiring Soon":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Expiring Soon
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteClinic = async (id: number) => {
    try {
      const response = await fetch(`/api/clinics/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const clinic = clinics.find((c) => c.id === id);
        setClinics(clinics.filter((clinic) => clinic.id !== id));
        showWarning(
          "Clinic Deleted",
          `${clinic?.name} has been removed from the system`
        );

        // Log audit event
        await logAuditEvent(
          1,
          "Clinic Deleted",
          `Deleted clinic: ${clinic?.name}`
        );
      } else {
        showError("Failed to delete clinic");
      }
    } catch (error) {
      showError("Error deleting clinic");
    }
  };

  const handleResetLicense = async (clinicId: number) => {
    try {
      const clinic = clinics.find((c) => c.id === clinicId);
      if (!clinic) return;

      // Create a new license for this clinic
      const response = await fetch("/api/licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId: clinicId,
          type: clinic.licenseType,
          supportExpiry: clinic.supportExpiry.toISOString(),
          version: "1.0", // Default version
        }),
      });

      if (response.ok) {
        fetchClinics(); // Refresh clinic data
        showSuccess(
          "License Reset Complete",
          `New license issued for ${clinic.name}`
        );

        // Log audit event
        await logAuditEvent(
          1,
          "License Reset",
          `Reset license for clinic: ${clinic.name}`
        );
      } else {
        showError("Failed to reset license");
      }
    } catch (error) {
      showError("Error resetting license");
    }
  };

  const handleVerifyLicense = async (clinicId: number) => {
    try {
      const clinic = clinics.find((c) => c.id === clinicId);
      if (!clinic || clinic.licenses.length === 0) {
        showWarning(
          "No License Found",
          "This clinic doesn't have an active license to verify"
        );
        return;
      }

      // Get the most recent license
      const latestLicense = clinic.licenses[clinic.licenses.length - 1];

      const response = await fetch(
        `/api/licenses/status?licenseId=${latestLicense.id}`
      );

      if (response.ok) {
        const { status, lastVerified } = await response.json();
        const statusMessage =
          status === "Active"
            ? "License is valid and active"
            : `License status: ${status}`;

        showSuccess("License Verified", `${clinic.name}: ${statusMessage}`);

        // Refresh to update lastVerified
        fetchClinics();
      } else {
        showError("Failed to verify license");
      }
    } catch (error) {
      showError("Error verifying license");
    }
  };

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Clinics Management
          </h1>
          <p className="text-gray-600">
            Manage dental clinics, licenses, and configurations
          </p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Clinic
            </Button>
          </DialogTrigger>
          <ClinicModal
            clinic={null}
            onSave={() => {
              fetchClinics();
              setIsAddModalOpen(false);
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clinics by name or domain..."
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
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>

            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by license" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All License Types</SelectItem>
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
          <CardTitle>Clinics ({filteredClinics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Support Expiry</TableHead>
                <TableHead>Last Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinics.map((clinic) => {
                const supportExpiry = new Date(clinic.supportExpiry);
                const now = new Date();
                const thirtyDaysFromNow = new Date(
                  now.getTime() + 30 * 24 * 60 * 60 * 1000
                );
                const isExpired = supportExpiry < now;
                const isExpiringSoon =
                  supportExpiry < thirtyDaysFromNow && supportExpiry >= now;
                const displayStatus = isExpired
                  ? "Expired"
                  : isExpiringSoon
                    ? "Expiring Soon"
                    : clinic.status === "Active"
                      ? "Active"
                      : "Inactive";

                return (
                  <TableRow
                    key={clinic.id}
                    className={
                      isExpired
                        ? "bg-red-50"
                        : isExpiringSoon
                          ? "bg-yellow-50"
                          : ""
                    }
                  >
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>{clinic.domain}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{clinic.licenseType}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(displayStatus)}</TableCell>
                    <TableCell
                      className={
                        isExpired
                          ? "text-red-600 font-medium"
                          : isExpiringSoon
                            ? "text-yellow-600 font-medium"
                            : ""
                      }
                    >
                      {supportExpiry.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {clinic.lastVerified
                        ? new Date(clinic.lastVerified).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setViewingClinic(clinic)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingClinic(clinic)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVerifyLicense(clinic.id)}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Verify License
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetLicense(clinic.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset License
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClinic(clinic.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingClinic && (
        <Dialog
          open={!!editingClinic}
          onOpenChange={() => setEditingClinic(null)}
        >
          <ClinicModal
            clinic={editingClinic}
            onSave={() => {
              fetchClinics();
              setEditingClinic(null);
            }}
            onCancel={() => setEditingClinic(null)}
          />
        </Dialog>
      )}

      {/* View Modal */}
      {viewingClinic && (
        <Dialog
          open={!!viewingClinic}
          onOpenChange={() => setViewingClinic(null)}
        >
          <ViewClinicModal
            clinic={viewingClinic}
            onClose={() => setViewingClinic(null)}
          />
        </Dialog>
      )}
    </div>
  );
}

interface ClinicModalProps {
  clinic: Clinic | null;
  onSave: () => void;
  onCancel: () => void;
}

function ClinicModal({ clinic, onSave, onCancel }: ClinicModalProps) {
  const [formData, setFormData] = useState({
    name: clinic?.name || "",
    domain: clinic?.domain || "",
    dbConnectionString: clinic?.dbConnectionString || "",
    licenseType: clinic?.licenseType || "Standalone",
    adminContact: clinic?.adminContact || "",
    supportExpiry: clinic?.supportExpiry
      ? new Date(clinic.supportExpiry).toISOString().split("T")[0]
      : "",
  });

  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        domain: formData.domain,
        dbConnectionString: formData.dbConnectionString,
        licenseType: formData.licenseType,
        adminContact: formData.adminContact,
        supportExpiry: new Date(formData.supportExpiry).toISOString(),
      };

      const response = await fetch(
        clinic ? `/api/clinics/${clinic.id}` : "/api/clinics",
        {
          method: clinic ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        onSave();
        showSuccess(
          clinic ? "Clinic Updated" : "Clinic Added",
          clinic
            ? `${formData.name} has been updated successfully`
            : `${formData.name} has been added to the system`
        );

        // Log audit event
        await logAuditEvent(
          1,
          clinic ? "Clinic Updated" : "Clinic Added",
          clinic
            ? `Updated clinic: ${formData.name}`
            : `Added new clinic: ${formData.name}`
        );
      } else {
        showError(clinic ? "Failed to update clinic" : "Failed to add clinic");
      }
    } catch (error) {
      showError("Error saving clinic");
    }
  };

  const fillWithDebugData = () => {
    const debugData = {
      name: `Test Clinic ${Math.floor(Math.random() * 1000)}`,
      domain: `testclinic${Math.floor(Math.random() * 1000)}.com`,
      dbConnectionString: `postgresql://user:pass@localhost:5432/test_db_${Math.floor(Math.random() * 1000)}`,
      licenseType:
        Math.random() > 0.5
          ? "Standalone"
          : ("Subscription" as "Standalone" | "Subscription"),
      adminContact: `admin@testclinic${Math.floor(Math.random() * 1000)}.com`,
      supportExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 1 year from now
    };
    setFormData(debugData);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{clinic ? "Edit Clinic" : "Add New Clinic"}</DialogTitle>
        <DialogDescription>
          {clinic
            ? "Update clinic information"
            : "Enter clinic details to add to your network"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Clinic Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            value={formData.domain}
            onChange={(e) =>
              setFormData({ ...formData, domain: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="dbConnectionString">DB Connection String</Label>
          <Input
            id="dbConnectionString"
            type="password"
            value={formData.dbConnectionString}
            onChange={(e) =>
              setFormData({ ...formData, dbConnectionString: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="licenseType">License Type</Label>
          <Select
            value={formData.licenseType}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                licenseType: value as "Standalone" | "Subscription",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standalone">Standalone</SelectItem>
              <SelectItem value="Subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="adminContact">Admin Contact</Label>
          <Input
            id="adminContact"
            type="email"
            value={formData.adminContact}
            onChange={(e) =>
              setFormData({ ...formData, adminContact: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="supportExpiry">Support Expiry</Label>
          <Input
            id="supportExpiry"
            type="date"
            value={formData.supportExpiry}
            onChange={(e) =>
              setFormData({ ...formData, supportExpiry: e.target.value })
            }
            required
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillWithDebugData}
            className="text-xs"
          >
            🧪 Fill with Debug Data
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save
            </Button>
          </DialogFooter>
        </div>
      </form>
    </DialogContent>
  );
}

interface ViewClinicModalProps {
  clinic: Clinic;
  onClose: () => void;
}

function ViewClinicModal({ clinic, onClose }: ViewClinicModalProps) {
  const supportExpiry = new Date(clinic.supportExpiry);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = supportExpiry < now;
  const isExpiringSoon =
    supportExpiry < thirtyDaysFromNow && supportExpiry >= now;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Clinic Details: {clinic.name}</DialogTitle>
        <DialogDescription>
          Complete information about this clinic and its licensing status
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Clinic Name
            </Label>
            <p className="text-lg font-semibold">{clinic.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Domain</Label>
            <p className="text-lg">{clinic.domain}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">
              License Type
            </Label>
            <Badge variant="outline" className="text-base px-3 py-1">
              {clinic.licenseType}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Status</Label>
            <div className="mt-1">
              {isExpired ? (
                <Badge className="bg-red-500 text-white">Expired</Badge>
              ) : isExpiringSoon ? (
                <Badge className="bg-yellow-500 text-white">
                  Expiring Soon
                </Badge>
              ) : clinic.status === "Active" ? (
                <Badge className="bg-green-500 text-white">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Database */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Admin Contact
            </Label>
            <p className="text-base">{clinic.adminContact}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Database
            </Label>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
              {clinic.dbConnectionString ? "••••••••" : "Not configured"}
            </p>
          </div>
        </div>

        {/* License Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">License Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Support Expiry
              </Label>
              <p
                className={`text-lg font-semibold ${
                  isExpired
                    ? "text-red-600"
                    : isExpiringSoon
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {supportExpiry.toLocaleDateString()}
                {isExpiringSoon && !isExpired && (
                  <span className="text-sm ml-2">(Expiring Soon)</span>
                )}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Last Verified
              </Label>
              <p className="text-lg">
                {clinic.lastVerified
                  ? new Date(clinic.lastVerified).toLocaleString()
                  : "Never"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Active Licenses
              </Label>
              <p className="text-lg font-semibold">
                {clinic.licenses?.length || 0}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Created
              </Label>
              <p className="text-lg">
                {new Date(clinic.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* License List */}
        {clinic.licenses && clinic.licenses.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Recent Licenses</h3>
            <div className="space-y-2">
              {clinic.licenses.slice(-3).map((license: any, index: number) => (
                <div
                  key={license.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">License #{license.id}</p>
                    <p className="text-sm text-gray-600">
                      Version {license.version} • {license.type} •{" "}
                      {license.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Expires:{" "}
                      {new Date(license.supportExpiry).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Activated:{" "}
                      {new Date(license.activationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
