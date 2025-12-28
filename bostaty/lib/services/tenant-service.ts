import prisma from "@/lib/prisma"
import { TenantRole } from "@prisma/client"

export class TenantService {

    // List of domains that should NEVER become automatic tenants
    private static PUBLIC_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

    static async handleUserOnboarding(userId: string, email: string) {
        const domain = email.split('@')[1];

        // 1. Skip auto-creation for public emails
        if (this.PUBLIC_DOMAINS.includes(domain.toLowerCase())) {
            return { type: 'PERSONAL_FLOW' as const, message: 'User must name their own workspace' };
        }

        // 2. Generate the @slug from the domain
        const domainName = domain.split('.')[0]; // "tesla.com" -> "tesla"
        const slug = `@${domainName}`;

        return await prisma.$transaction(async (tx) => {
            // 3. Check if this agency tenant already exists
            let tenant = await tx.tenant.findUnique({
                where: { slug }
            });

            if (tenant) {
                // 4. SIGN INTO EXISTING: Add user to existing tenant as MEMBER
                // Check if already a member first to avoid duplicates
                await tx.tenantMember.upsert({
                    where: {
                        tenantId_userId: { userId, tenantId: tenant.id }
                    },
                    update: {}, // Do nothing if already exists
                    create: {
                        tenantId: tenant.id,
                        userId: userId,
                        role: TenantRole.MEMBER, // New employees are members, not owners
                    }
                });
                return { type: 'JOINED_EXISTING' as const, tenant };
            } else {
                // 5. CREATE NEW: This is the first person from this agency
                tenant = await tx.tenant.create({
                    data: {
                        name: domainName.charAt(0).toUpperCase() + domainName.slice(1),
                        slug: slug,
                        subdomain: domainName,
                        settings: { theme: "light" },
                    },
                });

                await tx.tenantMember.create({
                    data: {
                        tenantId: tenant.id,
                        userId: userId,
                        role: TenantRole.OWNER,
                    },
                });
                return { type: 'CREATED_NEW' as const, tenant };
            }
        });
    }


    // Create tenant with owner
    static async createTenant(data: {
        name: string
        slug: string
        subdomain: string
        userId: string
    }) {
        const slug = `@${data.slug}`;
        return await prisma.$transaction(async (tx) => {
            // 1. Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: data.name,
                    slug: slug,
                    subdomain: data.subdomain,
                    settings: { theme: "light" }, // Default settings
                },
            })

            // 2. Add creator as owner
            await tx.tenantMember.create({
                data: {
                    tenantId: tenant.id,
                    userId: data.userId,
                    role: TenantRole.OWNER,
                },
            })

            return tenant
        })
    }

    // Get user's tenants
    static async getUserTenants(userId: string) {
        return await prisma.tenant.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    where: { userId },
                    select: { role: true },
                },
            },
        })
    }

    // Invite member
    static async inviteMember(
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

        // Create invitation
        const token = crypto.randomUUID()
        return await prisma.tenantInvitation.create({
            data: {
                email: data.email,
                token,
                role: data.role,
                tenantId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        })
    }
}