import prisma from "@/lib/prisma"
import { TenantData, TenantRole } from "@/types/Roles";
import { Prisma } from "@/lib/generated/prisma";

/**
 * Service to handle tenant-related operations including onboarding, 
 * creation, and retrieval of tenant data and context.
 */
export class TenantService {

    // List of domains that should NEVER become automatic tenants
    private static PUBLIC_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

    /**
     * Handles the initial onboarding logic for a user based on their email.
     * For professional domains, it automatically creates or joins a tenant based on the domain.
     * For public domains, it redirects to a personal workspace flow.
     * 
     * @param userId - The ID of the user being onboarded.
     * @param email - The email address of the user.
     * @returns An object indicating the onboarding flow type and tenant data if applicable.
     */
    static async handleUserOnboarding(userId: string, email: string) {
        const domain = email.split('@')[1];

        // 1. Skip auto-creation for public emails
        if (this.PUBLIC_DOMAINS.includes(domain.toLowerCase())) {
            return { type: 'PERSONAL_FLOW' as const, message: 'User must name their own workspace' };
        }

        // 2. Check if they already own a tenant
        if (await this.isOwner(userId)) {
            throw new Error("You already own a tenant");
        }

        // 3. Generate the @slug from the domain
        const domainName = domain.split('.')[0];
        const slug = `@${domainName}`;

        return await prisma.$transaction(async (tx) => {
            // 4. Check if this agency tenant already exists
            let tenant = await tx.tenant.findUnique({
                where: { slug }
            });

            if (tenant) {
                // 5. JOIN EXISTING: Add user to existing tenant as MEMBER
                await tx.tenantMember.upsert({
                    where: {
                        tenantId_userId: { userId, tenantId: tenant.id }
                    },
                    update: {}, // Do nothing if already exists
                    create: {
                        tenantId: tenant.id,
                        userId: userId,
                        role: TenantRole.MEMBER,
                    }
                });
                return { type: 'JOINED_EXISTING' as const, tenant };
            } else {
                // 6. CREATE NEW: This is the first person from this agency
                const tenantData = {
                    name: domainName.charAt(0).toUpperCase() + domainName.slice(1),
                    slug: slug,
                    subdomain: domainName,
                    settings: { theme: "light" },
                    userId: userId,
                    role: TenantRole.OWNER,
                }
                tenant = await TenantService.setUpNewTenant(tx, tenantData)
                return { type: 'CREATED_NEW' as const, tenant };
            }
        });
    }

    /**
     * Explicitly creates a new tenant for a user.
     * 
     * @param data - The tenant details including name, slug, subdomain, and the creator's userId.
     * @returns The newly created tenant.
     */
    static async createTenant(data: {
        name: string
        slug: string
        subdomain: string
        userId: string
    }) {
        const slug = `@${data.slug}`;

        return await prisma.$transaction(async (tx) => {
            // 1. Check if they already own a tenant
            if (await TenantService.isOwner(data.userId)) {
                throw new Error("You already own a tenant");
            }

            const tenantData: TenantData = {
                name: data.name,
                slug: slug,
                subdomain: data.subdomain,
                userId: data.userId,
                role: TenantRole.OWNER,
                settings: { theme: "light" },
            }

            // 2. Setup tenant and owner
            return await TenantService.setUpNewTenant(tx, tenantData)
        })
    }

    /**
     * Retrieves a tenant by its unique ID.
     * 
     * @param tenantId - The UUID of the tenant.
     * @returns The tenant object or null if not found.
     */
    static async getTenantById(tenantId: string) {
        return await prisma.tenant.findUnique({
            where: { id: tenantId }
        });
    }

    /**
     * Retrieves all tenants that a specific user is a member of.
     * Includes the user's role within each tenant.
     * 
     * @param userId - The ID of the user.
     * @returns A list of tenants with membership info.
     */
    static async getUserTenants(userId: string) {
        return await prisma.tenant.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    where: {
                        userId,
                    },
                    select: {
                        role: true,
                    },
                },
            },
        })
    }

    /**
     * Retrieves the tenant context for a specific user and tenant.
     * This is typically used for dashboard views where we need both 
     * the tenant data and the user's permissions.
     * 
     * @param tenantId - The ID of the tenant.
     * @param userId - The ID of the user.
     * @returns The tenant object with the specific user's membership details.
     */
    static async getTenantContext(tenantId: string, userId: string) {
        return await prisma.tenant.findFirst({
            where: {
                id: tenantId,
                members: {
                    some: { userId: userId }
                }
            },
            include: {
                members: {
                    where: { userId: userId },
                    select: {
                        role: true,
                        createdAt: true
                    }
                }
            }
        });
    }

    /**
     * Internal helper to set up a new tenant and its initial owner within a transaction.
     * 
     * @param tx - The Prisma transaction client.
     * @param data - The combined tenant and owner data.
     * @returns The created tenant.
     */
    static async setUpNewTenant(tx: Prisma.TransactionClient, data: TenantData) {
        const tenant = await tx.tenant.create({
            data: {
                name: data.name,
                slug: data.slug,
                subdomain: data.subdomain,
                settings: data.settings || { theme: "light" },
            },
        });

        await tx.tenantMember.create({
            data: {
                tenantId: tenant.id,
                userId: data.userId,
                role: data.role,
            },
        });
        return tenant
    }

    /**
     * Checks if a user is an OWNER of any tenant.
     * 
     * @param userId - The ID of the user.
     * @returns True if the user owns a tenant.
     */
    static async isOwner(userId: string) {
        const ownership = await prisma.tenantMember.findFirst({
            where: { userId, role: TenantRole.OWNER }
        });
        return !!ownership;
    }

    /**
     * Checks if a specific tenant has an OWNER assigned.
     * 
     * @param tenantId - The ID of the tenant.
     * @returns True if the tenant has an owner.
     */
    static async hasOwner(tenantId: string) {
        const owner = await prisma.tenantMember.findFirst({
            where: { tenantId, role: TenantRole.OWNER }
        });
        return !!owner;
    }

    /**
     * Retrieves public metadata for a tenant, such as settings and enabled modules.
     * 
     * @param tenantId - The ID of the tenant.
     * @returns Metadata including settings and enabled modules.
     */
    static async getTenantMetaData(tenantId: string) {
        if (!tenantId) return null;
        return await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                settings: true,
                enabledModules: true,
            }
        });
    }

    /**
     * Updates the settings for a tenant.
     * 
     * @param tenantId - The ID of the tenant.
     * @param settings - The new settings object.
     * @returns The updated tenant.
     */
    static async updateTenantSettings(tenantId: string, settings: any) {
        return await prisma.tenant.update({
            where: { id: tenantId },
            data: { settings },
        });
    }

    /**
     * Updates the enabled modules for a tenant.
     * 
     * @param tenantId - The ID of the tenant.
     * @param enabledModules - The new list of enabled modules.
     * @returns The updated tenant.
     */
    static async updateTenantModules(tenantId: string, enabledModules: string[]) {
        return await prisma.tenant.update({
            where: { id: tenantId },
            data: { enabledModules },
        });
    }

    /**
     * Retrieves the specific role of a user within a tenant.
     * 
     * @param tenantId - The ID of the tenant.
     * @param userId - The ID of the user.
     * @returns The user's role or null if they are not a member.
     */
    static async getMemberRole(tenantId: string, userId: string) {
        const membership = await prisma.tenantMember.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            select: { role: true }
        });
        return membership?.role || null;
    }

    /**
     * Retrieves the permissions for a member within a tenant.
     * Permissions are stored in the metadata field of the TenantMember.
     * 
     * @param tenantId - The ID of the tenant.
     * @param userId - The ID of the user.
     * @returns A list of permissions or an empty array if none found.
     */
    static async getMemberPermissions(tenantId: string, userId: string): Promise<string[]> {
        const membership = await prisma.tenantMember.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            select: { metadata: true }
        });

        if (!membership || !membership.metadata) {
            return [];
        }

        const metadata = membership.metadata as Record<string, any>;
        return Array.isArray(metadata.permissions) ? metadata.permissions : [];
    }
}
