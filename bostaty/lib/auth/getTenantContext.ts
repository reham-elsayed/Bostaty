import { headers } from "next/headers";

export async function getTenantContext() {
    const h = await headers();

    const rawTenantId = h.get("x-tenant-id");


    return {
        tenantId: rawTenantId,          // string | null
        hasTenant: typeof rawTenantId === "string" && rawTenantId.length > 0,
    };
}
