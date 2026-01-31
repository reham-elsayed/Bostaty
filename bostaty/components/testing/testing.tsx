"use client";

import { useTenant } from "@/providers/TenantContext";

export function DebugTenant() {
    const data = useTenant();

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg z-50">
            <p><strong>Tenant ID:</strong> {data.tenantId || "NULL"}</p>
            <p><strong>Modules:</strong> {data.enabledModules.join(", ") || "NONE"}</p>
            <p><strong>Primary Color:</strong> {data.settings?.theme?.primaryColor || "NOT SET"}</p>
        </div>
    );
}