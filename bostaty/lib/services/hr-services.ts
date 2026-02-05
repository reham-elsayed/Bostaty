import { getAuth } from "../auth/getTenantId";
import prisma from "../prisma";
import { TenantService } from "./tenant-service";

export class hrServices {
    static async getEmployees() {
        const { tenantId, userId } = await getAuth();
        const role = await TenantService.getMemberRole(tenantId, userId)
        const permissions = await TenantService.getMemberPermissions(tenantId, userId)
        // If the user isn't an Admin/Owner and doesn't have the specific salary permission
        const canSeeSalary = role === 'ADMIN' || role === 'OWNER' || permissions.includes('hr.employees.view_salary');

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
                salary: canSeeSalary,
            }
        });


        if (!canSeeSalary) {
            return employees.map(({ salary, ...rest }) => ({
                ...rest,
                salary: null,
            }));
        }

        return employees;
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
}