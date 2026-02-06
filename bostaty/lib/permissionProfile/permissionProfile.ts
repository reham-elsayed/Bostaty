import prisma from "../prisma";
import { PermissionService } from "../services/permissions-service";

export async function getPermissionProfile() {
    const membership = await PermissionService.getPermissions()

    const role = membership?.role;
    const rawPermissions = (membership?.metadata as any)?.permissions || [];

    // This helper returns a function that doesn't need 'await'
    return {
        // The "Logic" is encapsulated here
        can: (permission: string) => {
            if (role === 'OWNER' || role === 'ADMIN') return true;
            return rawPermissions.includes(permission);
        },
        role
    };
}