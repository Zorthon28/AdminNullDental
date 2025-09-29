"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, AlertTriangle, Calendar } from "lucide-react";

interface StatCardsProps {
  totalClinics?: number;
  activeLicenses?: number;
  expiredLicenses?: number;
  expiringSoon?: number;
}

export function StatCards({
  totalClinics = 123,
  activeLicenses = 98,
  expiredLicenses = 25,
  expiringSoon = 12
}: StatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            Total Clinics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClinics}</div>
          <p className="text-xs text-green-600">+5% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            Active Licenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeLicenses}</div>
          <p className="text-xs text-muted-foreground">{expiredLicenses} expired</p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            Expired Licenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiredLicenses}</div>
          <p className="text-xs text-red-600">+3 from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-yellow-600" />
            Support Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringSoon}</div>
          <p className="text-xs text-yellow-600">Within 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
}