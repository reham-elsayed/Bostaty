"use server"

import { TenantService } from "@/lib/services/tenant-service";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth/getTenantId";

export async function getTenantDataAction() {
    const { tenantId, userId } = await getAuth();
    const tenant = await TenantService.getTenantContext(tenantId, userId);
    return tenant;
}

export async function updateTenantSettings(newSettings: any) {
    try {
        const { tenantId, userId } = await getAuth();

        if (!userId) return { error: "Unauthorized" };

        const role = await TenantService.getMemberRole(tenantId, userId);
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

export async function updateTenantModules(enabledModules: string[]) {
    try {
        const { tenantId, userId } = await getAuth();


        if (!userId) return { error: "Unauthorized" };

        const role = await TenantService.getMemberRole(tenantId, userId);
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


export async function getUserPermissionsAction() {
    const { tenantId, userId } = await getAuth();
    const permissions = await TenantService.getMemberPermissions(tenantId, userId);
    return permissions;
}

export async function getMemberRoleAction() {
    const { tenantId, userId } = await getAuth();
    const role = await TenantService.getMemberRole(tenantId, userId);
    return role;
}