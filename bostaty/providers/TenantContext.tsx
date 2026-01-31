"use client";

import { createContext, useContext } from "react";

export interface TenantValue {
    tenantId: string | null;
    settings: any;
    enabledModules: string[];
}

export const TenantContext = createContext<TenantValue | null>(null);

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}
