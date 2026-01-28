import { TenantContext } from "@/components/tenant/TenantContext";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {


    return (
        <TenantContext>
            <section className="dashboard-layout">{children}</section>
        </TenantContext>
    )

}