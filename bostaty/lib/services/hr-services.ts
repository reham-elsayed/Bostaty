import { getAuth } from "../auth/getTenantId";
import prisma from "../prisma";
import { TenantService } from "./tenant-service";

export class HrServices {
    static async getEmployees() {
        const { tenantId, userId } = await getAuth();
        const role = await TenantService.getMemberRole(tenantId, userId)
        const permissions = await TenantService.getMemberPermissions(tenantId, userId)

        // If the user isn't an Admin/Owner and doesn't have the specific salary permission
        const canSeeSalary = role === 'ADMIN' || role === 'OWNER' || permissions.includes('hr.employees.view_salary');

        // Fetch all tenant members to check which employees are also members
        const members = await prisma.tenantMember.findMany({
            where: { tenantId },
            include: { user: { select: { email: true } } }
        });
        const memberEmails = new Set(members.map(m => m.user.email));

        const employees = await prisma.employee.findMany({
            where: { tenantId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                tenantId: true,
                status: true,
                salary: canSeeSalary,
            }
        });

        const mappedEmployees = employees.map(employee => ({
            ...employee,
            isMember: memberEmails.has(employee.email),
            salary: canSeeSalary ? employee.salary : null
        }));

        return mappedEmployees;
    }

    static async createEmployee(data: any, tenantId: string) {
        return await prisma.employee.create({
            data: {
                ...data,
                tenantId,
                status: "ACTIVE",
            },
        });
    }


    static async deleteEmployee(employeeId: string, tenantId: string) {
        // 1. Get employee to find email
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId, tenantId },
        });

        if (!employee) {
            throw new Error("Employee not found");
        }

        const email = employee.email;

        // 2. Delete Employee Record
        await prisma.employee.delete({
            where: { id: employeeId },
        });

        // 3. Find User by Email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { memberships: true }, // Include memberships to check for other tenants
        });

        if (user) {
            // 4. Delete TenantMember for THIS tenant
            // Note: This might have cascaded if relation was set up, but let's be explicit
            const memberToDelete = user.memberships.find(m => m.tenantId === tenantId);
            if (memberToDelete) {
                await prisma.tenantMember.delete({
                    where: { id: memberToDelete.id },
                });
            }

            // 5. Check dependencies for User Deletion
            // Re-fetch user memberships or use the filtered list if we trust cache/state
            // Better to re-check count or filter valid memberships
            const remainingMemberships = user.memberships.filter(m => m.tenantId !== tenantId);

            // Conditions to delete User:
            // a. No other memberships
            // b. Not super admin (safety)
            if (remainingMemberships.length === 0 && !user.isSuperAdmin) {
                // Check if they own any tenants (via Tenant relation, maybe not loaded)
                // Assuming memberships cover ownership (OWNER role is a membership)

                await prisma.user.delete({
                    where: { id: user.id },
                });
            }
        }

        return { success: true };
    }
}