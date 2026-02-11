"use server"

import { TenantService } from "@/lib/services/tenant-service";
import { HrServices } from "@/lib/services/hr-services";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth/getTenantId";
import prisma from "@/lib/prisma";

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

export async function seedEmployeesAction() {
    try {
        const { tenantId } = await getAuth();



        // Dummy employee data
        const dummyEmployees = [
            {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@company.com",
                position: "Senior Developer",
                department: "Engineering",
                salary: 95000,
                status: "ACTIVE"
            },
            {
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@company.com",
                position: "Product Manager",
                department: "Product",
                salary: 110000,
                status: "ACTIVE"
            },
            {
                firstName: "Michael",
                lastName: "Johnson",
                email: "michael.johnson@company.com",
                position: "HR Manager",
                department: "Human Resources",
                salary: 85000,
                status: "ACTIVE"
            },
            {
                firstName: "Emily",
                lastName: "Williams",
                email: "emily.williams@company.com",
                position: "UX Designer",
                department: "Design",
                salary: 78000,
                status: "ACTIVE"
            },
            {
                firstName: "David",
                lastName: "Brown",
                email: "david.brown@company.com",
                position: "Marketing Specialist",
                department: "Marketing",
                salary: 72000,
                status: "ON_LEAVE"
            }
        ];

        // Create employees with tenant association
        const createdEmployees = await prisma.employee.createMany({
            data: dummyEmployees.map(emp => ({
                ...emp,
                tenantId
            }))
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            message: `Successfully created ${createdEmployees.count} employees`,
            count: createdEmployees.count
        };
    } catch (error: any) {
        console.error("Seed employees error:", error);
        return { error: error.message || "Failed to seed employees" };
    }
}
