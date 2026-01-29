"use server"

import { createClient } from "@/lib/supabase/server";
import { TenantService } from "@/lib/services/tenant-service";
import { revalidatePath } from "next/cache";
type getTenantDataProps = {
    tenantId: string;
    id: string;
}
export async function getTenantData(tenantId: string, id: string) {
    const tenant = await TenantService.getTenantContext(tenantId, id);
    return tenant;
}



export async function updateTenantSettings(tenantId: string, newSettings: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. AUTHORIZATION CHECK (Using Service)
    const role = await TenantService.getMemberRole(tenantId, user.id);
    const isAuthorized = role === "OWNER" || role === "ADMIN";

    if (!isAuthorized) {
        throw new Error("You do not have permission to change settings.");
    }

    // 2. EXECUTION (Using Service)
    await TenantService.updateTenantSettings(tenantId, newSettings);

    // 3. CACHE INVALIDATION
    revalidatePath("/dashboard", "layout");

    return { success: true };
}