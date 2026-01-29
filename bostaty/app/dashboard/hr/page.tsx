
import { Suspense } from "react";
import { TenantService } from "@/lib/services/tenant-service";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DebugTenant } from "@/components/testing/testing";
import { ModuleGuard } from "@/components/auth/ModuleGuard";

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
                    <DebugTenant />
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
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <span className="text-3xl">👥</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-foreground">HR Module Under Construction</h2>
                    <p className="max-w-md text-muted-foreground text-lg">
                        We're building a comprehensive HR suite to help you manage recruitment, payroll, and employee performance.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium">Recruitment</div>
                        <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium">Payroll</div>
                        <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium">Performance</div>
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}
