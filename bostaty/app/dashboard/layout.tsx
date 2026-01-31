import { ThemeInjector } from "@/components/Dashboard/ThemeInjector/ThemeInjector";
import { TenantContext } from "@/components/tenant/TenantContext";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {


    return (
        <Suspense>
            <TenantContext>
                <ThemeInjector />
                <section className="dashboard-layout">{children}</section>
            </TenantContext>
        </Suspense>
    )

}