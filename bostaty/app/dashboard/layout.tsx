import { Sidebar } from "@/components/Dashboard/DashboardOwnerNavbar";
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">

                    <div className="col-span-1">
                        <Sidebar />
                    </div>
                    <section className="dashboard-layout col-span-3">{children}</section>


                </div>
            </TenantContext>
        </Suspense>
    )

}