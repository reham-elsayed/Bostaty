import { headers } from "next/headers";
import { TenantService } from "../../lib/services/tenant-service";
import TenantProvider from "@/providers/TenantProvider";
import { createClient } from "@/lib/supabase/server";

export async function TenantContext({ children }: { children: React.ReactNode }) {
    const h = await headers();
    const rawTenantId = h.get("x-tenant-id");

    let tenantData = null;
    let role = null;
    let permissions = null;

    if (rawTenantId) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const [meta, memberRole, memberPermissions] = await Promise.all([
            TenantService.getTenantMetaData(rawTenantId),
            user ? TenantService.getMemberRole(rawTenantId, user.id) : null,
            user ? TenantService.getMemberPermissions(rawTenantId, user.id) : null
        ]);

        tenantData = meta;
        role = memberRole;
        permissions = memberPermissions;
    }

    const tenantContextValue = {
        tenantId: rawTenantId,
        settings: tenantData?.settings || {},
        enabledModules: tenantData?.enabledModules || [],
        role: role,
        permissions: permissions || [],
    };

    return (
        <TenantProvider initialValue={tenantContextValue}>
            {children}
        </TenantProvider>
    );
}
