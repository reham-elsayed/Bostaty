"use server";

import { TenantService } from "@/lib/services/tenant-service";
import { inviteMemberSchema, InviteMemberDTO } from "@/lib/dtos/invitation.dto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email-handler/invitation-service";
import { InvitationService } from "../services/invitation-services";

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
        const result = await InvitationService.createInvite(tenantId, inviterId, validated.data);

        // Fetch tenant and inviter details for the email
        const tenant = await TenantService.getUserTenant(tenantId);
        const inviter = await prisma.user.findUnique({ where: { id: inviterId } });

        if (!tenant || !inviter) {
            throw new Error("Failed to fetch invitation context");
        }

        // Send email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteLink = `${baseUrl}/accept-invitation?token=${result.rawToken}`;

        try {
            await sendInvitationEmail({
                recipientEmail: validated.data.email,
                inviterName: inviter.name || inviter.email,
                tenantName: tenant.name,
                inviteLink: inviteLink,
            });
        } catch (emailError) {
            console.error("Failed to send invitation email:", emailError);
            // Optionally, handle email failure separately if you want to keep the DB record
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return {
            error: error.message || "Failed to send invitation",
        };
    }
}
