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
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Unauthorized" };

        // 1. AUTHORIZATION CHECK (Using Service)
        const role = await TenantService.getMemberRole(tenantId, user.id);
        console.log(role, "member role");
        const isAuthorized = role === "OWNER" || role === "ADMIN";

        if (!isAuthorized) {
            return { error: "You do not have permission to change settings." };
        }

        // 2. EXECUTION (Using Service)
        await TenantService.updateTenantSettings(tenantId, newSettings);

        // 3. CACHE INVALIDATION
        revalidatePath("/dashboard", "layout");

        return { success: true, message: "Settings updated successfully" };
    } catch (error: any) {
        console.error("Update settings error:", error);
        return { error: error.message || "Failed to update settings" };
    }
}