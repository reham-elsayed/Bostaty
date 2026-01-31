"use client";

import { useTenant } from "@/providers/TenantContext";
import { ModuleName } from "@/types/nav";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ModuleGuardProps {
    children: ReactNode;
    module: ModuleName;
}

export function ModuleGuard({ children, module }: ModuleGuardProps) {
    const { enabledModules } = useTenant();

    // If the tenant hasn't paid for/enabled this module, bounce them back to the dashboard
    const hasAccess = enabledModules.includes(module) || module === 'CORE';

    if (!hasAccess) {
        redirect("/dashboard"); // Or a custom "Upgrade Required" page
        return null;
    }

    return <>{children}</>;
}