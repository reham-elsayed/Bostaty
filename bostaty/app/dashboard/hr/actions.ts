"use server"

import { getAuth } from "@/lib/auth/getTenantId";
import { HrServices } from "@/lib/services/hr-services";
import { PermissionService } from "@/lib/services/permissions-service";
import { revalidatePath } from "next/cache";

export async function canEmployeeDo(userId: string, tenantId: string, permission: string) {

    return await PermissionService.can(userId, tenantId, permission);
}

export async function createEmployeeAction(data: any) {
    try {
        const { employeeSchema } = await import("@/lib/dtos/employee.dto");

        // Validate input
        const validated = employeeSchema.safeParse(data);
        if (!validated.success) {
            return {
                error: validated.error.issues[0].message,
            };
        }

        const { tenantId, userId } = await getAuth();

        if (!userId) return { error: "Unauthorized" };

        // Check permissions
        const canCreateEmployee = await canEmployeeDo(userId, tenantId, "hr.employees.manage")
        if (!canCreateEmployee) {
            return { error: "You do not have permission to create employees." };
        }

        // Create employee
        const employee = await HrServices.createEmployee(validated.data, tenantId);

        revalidatePath("/dashboard/hr");

        return { success: true, employee };
    } catch (error: any) {
        console.error("Create employee error:", error);
        return { error: error.message || "Failed to create employee" };
    }
}

export async function getMemberPermissionsAction(email: string) {
    try {
        const permissions = await PermissionService.getMemberPermissions(email);
        return { success: true, permissions };
    } catch (error: any) {
        console.error("Fetch permissions error:", error);
        return { error: error.message || "Failed to fetch permissions" };
    }
}

export async function updateMemberPermissionsAction(data: any) {
    try {
        const result = await PermissionService.updatePermissions(data);
        if ('error' in result) return result;

        revalidatePath("/dashboard/hr");
        return { success: true, message: "Permissions updated successfully" };
    } catch (error: any) {
        console.error("Update permissions error:", error);
        return { error: error.message || "Failed to update permissions" };
    }
}

export async function deleteEmployeeAction(employeeId: string) {
    try {
        const { tenantId, userId } = await getAuth();

        if (!userId) return { error: "Unauthorized" };

        // Check permissions
        const canDeleteEmployee = await canEmployeeDo(userId, tenantId, "hr.employees.manage");
        if (!canDeleteEmployee) {
            return { error: "You do not have permission to delete employees." };
        }

        await HrServices.deleteEmployee(employeeId, tenantId);

        revalidatePath("/dashboard/hr");
        return { success: true, message: "Employee deleted successfully" };
    } catch (error: any) {
        console.error("Delete employee error:", error);
        return { error: error.message || "Failed to delete employee" };
    }
}
