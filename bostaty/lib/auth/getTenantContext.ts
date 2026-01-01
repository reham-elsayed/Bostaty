import { headers } from "next/headers";

export async function getTenantContext() {
    const h = await headers();
    console.log(Object.fromEntries(h.entries())); const tenantId = h.get("x-tenant-id");


    if (!tenantId) {
        throw new Error("Missing tenant context");
    }

    return {
        tenantId,

    };
}
