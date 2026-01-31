"use client";

import { TenantContext, TenantValue } from "./TenantContext";

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

