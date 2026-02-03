"use client";

import { useTenant } from "@/providers/TenantContext";
import { PlanSettingsForm } from "@/components/Dashboard/PlanSettingsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function PlanSettingsPage() {
    const { role } = useTenant();

    if (role !== "OWNER") {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        Only the workspace owner can access plan settings.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Plan Settings</h1>
                <p className="text-muted-foreground">Manage your organization's subscription and features.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Feature Management</CardTitle>
                    <CardDescription>
                        Select which modules are enabled for your workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PlanSettingsForm />
                </CardContent>
            </Card>
        </div>
    );
}
