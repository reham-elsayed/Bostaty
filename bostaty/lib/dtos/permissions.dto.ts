import z from "zod";

export const UserPermissionsSchema = z.object({
    email: z.email(),
    permissions: z.array(z.string()),
})