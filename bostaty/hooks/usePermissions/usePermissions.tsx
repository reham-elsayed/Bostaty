import { useTenant } from "@/providers/TenantContext";

export default function usePermission(permission: string) {

    const { role, permissions } = useTenant();

    return {
        isOwner: role === "OWNER",
        isAdmin: role === "ADMIN",
        isMember: role === "MEMBER",
        hasPermission: (permission: string) => permissions.includes(permission),
    }

}