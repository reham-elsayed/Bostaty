
import { Suspense } from "react";
import { TenantService } from "@/lib/services/tenant-service";
import { InviteMemberModal } from "@/components/tenant/InviteMemberModal";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Dashboard/DashboardOwnerNavbar";
import { AppearanceSettings } from "@/components/Dashboard/AppearanceForm";
import { getMemberRoleAction, getTenantDataAction } from "./actions";
import { getAuth } from "@/lib/auth/getTenantId";
import { SeedEmployeesButton } from "@/components/Dashboard/SeedEmployeesButton";


async function DashboardHeader() {

    const { userId } = await getAuth()
    const tenant = await getTenantDataAction();
    const role = await getMemberRoleAction()

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">

                    Welcome back to <span className="text-foreground font-semibold uppercase">{tenant?.name}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border w-fit transition-all hover:bg-muted">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium">{tenant?.slug}</span>
                    <span className="text-xs font-mono font-medium">{tenant?.members[0].role}</span>
                </div>
                {(role === "OWNER" || role === "ADMIN") && (
                    <>
                        <SeedEmployeesButton />
                        <InviteMemberModal tenantId={tenant?.id as string} inviterId={userId as string} />

                        <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-xl mb-8" />}>
                            <AppearanceSettings />
                        </Suspense>
                    </>
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
