import z from "zod"

export const createTenantSchema = z.object({
    name: z
        .string().min(3, "Name must be at least 3 characters"),
    slug: z.string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    subdomain: z.string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Invalid subdomain format"),
})

export type CreateTenantFormData = z.infer<typeof createTenantSchema>
