
import { Suspense } from "react";
import { TenantService } from "@/lib/services/tenant-service";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DebugTenant } from "@/components/testing/testing";
import { ModuleGuard } from "@/components/auth/ModuleGuard";
import { EmployeeList } from "@/components/Dashboard/HrDashboard/EmployeeList/EmployeeList";
import { EmployeeForm } from "@/components/Dashboard/HrDashboard/EmployeeForm";

async function ModuleHeader({ title, description }: { title: string; description: string }) {
    const headersTenant = await headers();
    const tenantId = headersTenant.get("x-tenant-id");

    if (!tenantId) {
        redirect("/workspace");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const tenant = await TenantService.getTenantContext(tenantId, user?.id as string);

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
                <p className="text-muted-foreground mt-1">

                    {description} for <span className="text-foreground font-semibold uppercase">{tenant?.name}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border w-fit">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium">{tenant?.slug}</span>

                </div>
            </div>
        </header>
    );
}

export default async function HRDashboardPage() {
    return (
        <ModuleGuard module="HR">
            <div className="p-8 max-w-7xl mx-auto">
                <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-xl mb-8" />}>
                    <ModuleHeader
                        title="Human Resources"
                        description="Manage your employees and organizational structure"
                    />
                </Suspense>

                <div className="mt-8 p-12 border-2 border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center">
                    <EmployeeList />
                    <EmployeeForm />
                </div>
            </div>
        </ModuleGuard>
    );
}
