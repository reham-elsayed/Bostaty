"use client";

import { ThemeInjector } from "@/components/Dashboard/ThemeInjector/ThemeInjector";
import { createContext, useContext } from "react";

// Define the shape of your data
interface TenantValue {
    tenantId: string | null;
    settings: any;
    enabledModules: string[];
}

const TenantContext = createContext<TenantValue | null>(null);

export default function TenantProvider({
    children,
    initialValue
}: {
    children: React.ReactNode;
    initialValue: TenantValue
}) {
    return (
        <TenantContext.Provider value={initialValue}>

            {children}
        </TenantContext.Provider>

    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}