import { getAuth } from "../auth/getTenantId";
import prisma from "../prisma";

export class PermissionService {
    static async can(userId: string, tenantId: string, requiredPermission: string): Promise<boolean> {
        const membership = await prisma.tenantMember.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
            select: { role: true, metadata: true }
        });

        if (!membership) return false;


        if (membership.role === 'OWNER' || membership.role === 'ADMIN') {
            return true;
        }


        const metadata = membership.metadata as Record<string, any>;
        const permissions = Array.isArray(metadata.permissions) ? metadata.permissions : [];

        return permissions.includes(requiredPermission);
    }

    static async getPermissions() {
        const { userId, tenantId } = await getAuth();
        const membership = await prisma.tenantMember.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
            select: { role: true, metadata: true }
        });
        return membership
    }
}