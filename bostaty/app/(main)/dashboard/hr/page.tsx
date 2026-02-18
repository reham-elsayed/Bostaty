
import { Suspense } from "react";
import { TenantService } from "@/lib/services/tenant-service";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ModuleGuard } from "@/components/auth/ModuleGuard";
import { EmployeeList } from "@/components/Dashboard/HrDashboard/EmployeeList/EmployeeList";
import { Briefcase,  Shield } from "lucide-react";
import { TotalEmpoluee } from "@/components/Dashboard/HrDashboard/StatsCardsDataDisplay/TotalEmpoluee";
import { ActiveMembers } from "@/components/Dashboard/HrDashboard/StatsCardsDataDisplay/ActiveMembers";
import { StatCard } from "@/components/Dashboard/HrDashboard/StatCard";

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
        <header className="relative mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        <Briefcase className="w-3 h-3" />
                        <span>HR Module</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                        {description} for <span className="text-foreground font-semibold px-2 py-0.5 bg-muted rounded">{tenant?.name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 self-end">
                    <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-mono font-bold text-muted-foreground">{tenant?.slug}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}


export default async function HRDashboardPage() {
    return (
        <ModuleGuard module="HR">
            <div className="min-h-screen bg-background/50">
                <div className="p-8 max-w-7xl mx-auto space-y-12">
                    <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-2xl mb-12" />}>
                        <ModuleHeader
                            title="Human Resources"
                            description="Manage your employees and organizational structure"
                        />
                    </Suspense>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-2xl mb-12" />}>
                            <TotalEmpoluee />
                        </Suspense>
                        <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-2xl mb-12" />}>
                            <ActiveMembers />
                        </Suspense>
                        <StatCard
                            label="Permissions Managed"
                            value="Standard"
                            icon={Shield}
                            colorClass="bg-amber-500/10 text-amber-500"
                        />
                        <StatCard
                            label="Company Slug"
                            value="..."
                            icon={Briefcase}
                            colorClass="bg-purple-500/10 text-purple-500"
                        />
                    </div>

                    <div className="mt-12">
                        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-2xl" />}>
                            <EmployeeList />
                        </Suspense>
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}
