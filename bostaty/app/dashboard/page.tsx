
import { Suspense } from "react";
import { TenantService } from "@/lib/services/tenant-service";
import { InviteMemberModal } from "@/components/tenant/InviteMemberModal";
import { useTenant } from "@/providers/TenantProvider";
import { getTenantData } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DebugTenant } from "@/components/testing/testing";

async function DashboardHeader() {
    const headersTenant = await headers();
    const tenantId = headersTenant.get("x-tenant-id");

    if (!tenantId) {
        redirect("/workspace");
    }
    // Get current user for inviterId
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const tenant = await TenantService.getTenantContext(tenantId, user?.id as string);


    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    <DebugTenant />
                    Welcome back to <span className="text-foreground font-semibold uppercase">{tenant?.name}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border w-fit transition-all hover:bg-muted">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium">{tenant?.slug}</span>
                    <span className="text-xs font-mono font-medium">{tenant?.members[0].role}</span>
                </div>
                {(tenant?.members[0].role === "OWNER" || tenant?.members[0].role === "ADMIN") && (
                    <InviteMemberModal tenantId={tenantId as string} inviterId={user?.id as string} />
                )}
            </div>
        </header>
    );
}

export default async function TenantDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-xl mb-8" />}>
                <DashboardHeader />
            </Suspense>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                    { label: "Active Projects", value: "12", trend: "+2.5%", color: "text-blue-500" },
                    { label: "Team Members", value: "8", trend: "+1", color: "text-purple-500" },
                    { label: "Storage Used", value: "45%", trend: "-5%", color: "text-amber-500" },
                    { label: "Monthly API Calls", value: "2.4k", trend: "+18%", color: "text-emerald-500" }
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all cursor-default">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-end justify-between mt-2">
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                            <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded italic">
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-8 border-2 border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Premium Experience Loading</h2>
                <p className="max-w-md text-muted-foreground">
                    We're currently finalizing the routing and data layers. Full dashboard features will be available here soon.
                </p>
            </div>
        </div>
    );
}
