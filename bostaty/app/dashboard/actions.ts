"use server"

import { createClient } from "@/lib/supabase/server";
import { TenantService } from "@/lib/services/tenant-service";
import { revalidatePath } from "next/cache";

export async function getTenantData(tenantId: string, id: string) {
    const tenant = await TenantService.getTenantContext(tenantId, id);
    return tenant;
}

export async function updateTenantSettings(tenantId: string, newSettings: any) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Unauthorized" };

        const role = await TenantService.getMemberRole(tenantId, user.id);
        const isAuthorized = role === "OWNER" || role === "ADMIN";

        if (!isAuthorized) {
            return { error: "You do not have permission to change settings." };
        }

        await TenantService.updateTenantSettings(tenantId, newSettings);
        revalidatePath("/dashboard", "layout");

        return { success: true, message: "Settings updated successfully" };
    } catch (error: any) {
        console.error("Update settings error:", error);
        return { error: error.message || "Failed to update settings" };
    }
}

export async function updateTenantModules(tenantId: string, enabledModules: string[]) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Unauthorized" };

        const role = await TenantService.getMemberRole(tenantId, user.id);
        if (role !== "OWNER") {
            return { error: "Only the workspace owner can manage plan settings." };
        }

        await TenantService.updateTenantModules(tenantId, enabledModules);
        revalidatePath("/dashboard", "layout");

        return { success: true, message: "Plan updated successfully" };
    } catch (error: any) {
        console.error("Update modules error:", error);
        return { error: error.message || "Failed to update plan" };
    }
}