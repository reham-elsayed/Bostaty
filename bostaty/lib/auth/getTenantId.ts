import { headers } from "next/headers"

export async function getTenantId() {
    const h = await headers()
    const tenantId = h.get("x-tenant-id")
    return tenantId
}