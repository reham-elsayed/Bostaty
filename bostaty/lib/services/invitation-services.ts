// domain/invitations/invitation.service.ts
import prisma from '@/lib/prisma'
import crypto from 'node:crypto'
import { TenantRole } from '@prisma/client'

export class InvitationService {
    static async createInvite(
        tenantId: string,
        inviterId: string,
        data: { email: string; role: TenantRole }
    ) {
        // Check inviter permissions
        const inviter = await prisma.tenantMember.findFirst({
            where: {
                tenantId,
                userId: inviterId,
                role: { in: [TenantRole.OWNER, TenantRole.ADMIN] },
            },
        })

        if (!inviter) {
            throw new Error("You don't have permission to invite members")
        }

        await prisma.tenantInvitation.deleteMany({
            where: {
                tenantId,
                email: data.email,
                acceptedAt: null,
                expiresAt: { gt: new Date() },
            },
        })

        const existingMember = await prisma.tenantMember.findFirst({
            where: {
                tenantId,
                user: { email: data.email },
            },
        })


        if (existingMember) {
            throw new Error("User is already a member of this tenant")
        }

        // Create invitation
        const rawToken = crypto.randomBytes(32).toString("hex")
        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex")

        const invitation = await prisma.tenantInvitation.create({
            data: {
                email: data.email,
                token: tokenHash,
                role: data.role,
                tenantId,
                inviterId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        })

        return { invitation, rawToken }
    }


    static async acceptInvite(rawToken: string, userId: string) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

        return prisma.$transaction(async (tx) => {
            const invite = await tx.tenantInvitation.findFirst({
                where: {
                    token: tokenHash,
                    acceptedAt: null,
                    expiresAt: { gt: new Date() },
                },
            })

            if (!invite) {
                throw new Error('Invalid or expired invitation')
            }

            // Verify the user email matches the invitation email
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { email: true }
            })

            if (!user || user.email !== invite.email) {
                throw new Error('This invitation was sent to a different email address. Please log in with the correct account.')
            }

            await tx.tenantMember.create({
                data: {
                    tenantId: invite.tenantId,
                    userId,
                    role: invite.role,
                },
            })

            console.log(`Updating invitation ${invite.id} for token hash ${tokenHash.substring(0, 10)}...`)

            const updated = await tx.tenantInvitation.update({
                where: { token: tokenHash },
                data: { acceptedAt: new Date() },
            })

            console.log(`Invitation updated successfully. acceptedAt: ${updated.acceptedAt}`)

            return updated
        })
    }

    static async getInvitationMetadata(rawToken: string) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

        return await prisma.tenantInvitation.findUnique({
            where: { token: tokenHash },
            include: {
                tenant: { select: { name: true } },
                inviter: { select: { name: true, email: true } }
            }
        })
    }


    /**
  * Find the most recent valid (non-expired, non-accepted) invitation for an email.
  * Used during auth callback to resume invitation flow.
  */
    static async findActiveInvitationByEmail(email: string) {
        const invitation = await prisma.tenantInvitation.findFirst({
            where: {
                email,
                acceptedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        })

        if (!invitation) {
            return null
        }

        return invitation
    }

    static async getUserInvitations(email: string) {
        return await prisma.tenantInvitation.findMany({
            where: {
                email,
                acceptedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        })
    }

}
