import { getAuth } from "@/lib/auth/getTenantId";
import { PermissionService } from "@/lib/services/permissions-service";

export async function canEmployeeDo(permission: string) {
    const { userId, tenantId } = await getAuth();
    return await PermissionService.can(userId, tenantId, permission);
}