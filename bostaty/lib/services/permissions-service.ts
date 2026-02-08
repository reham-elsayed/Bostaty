import { getAuth } from "../auth/getTenantId";
import { UserPermissionsSchema } from "../dtos/permissions.dto";
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

    static async getMemberPermissions(email: string) {
        const { tenantId } = await getAuth();
        const member = await prisma.tenantMember.findFirst({
            where: {
                tenantId,
                user: {
                    email: email
                }
            },
            select: {
                metadata: true
            }
        });

        if (!member) return null;

        const metadata = member.metadata as Record<string, any>;
        return Array.isArray(metadata.permissions) ? metadata.permissions : [];
    }

    static async updatePermissions(data: any) {
        const { userId: currentUserId, tenantId } = await getAuth();
        const validated = UserPermissionsSchema.safeParse(data);

        if (!validated.success) {
            return { error: validated.error.issues[0].message };
        }

        const member = await prisma.tenantMember.findFirst({
            where: {
                tenantId,
                user: {
                    email: validated.data.email
                }
            }
        });

        if (!member) {
            return { error: "Member not found" };
        }

        const updatedMember = await prisma.tenantMember.update({
            where: {
                id: member.id
            },
            data: {
                metadata: {
                    ...(member.metadata as object),
                    permissions: validated.data.permissions
                }
            }
        });

        return updatedMember;
    }

}
