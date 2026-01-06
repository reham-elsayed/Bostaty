"use server";

import { TenantService } from "@/lib/services/tenant-service";
import { inviteMemberSchema, InviteMemberDTO } from "@/lib/dtos/invitation.dto";
import { revalidatePath } from "next/cache";

export async function inviteMemberAction(
    tenantId: string,
    inviterId: string,
    data: InviteMemberDTO
) {
    // Validate input
    const validated = inviteMemberSchema.safeParse(data);
    if (!validated.success) {
        return {
            error: validated.error.issues[0].message,
        };
    }

    try {
        await TenantService.inviteMember(tenantId, inviterId, validated.data);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return {
            error: error.message || "Failed to send invitation",
        };
    }
}
