import { getTenantContext } from "@/lib/auth/getTenantContext";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {


    return <section className="dashboard-layout">{children}</section>;
}