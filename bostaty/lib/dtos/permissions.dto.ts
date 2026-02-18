import z from "zod";

export const UserPermissionsSchema = z.object({
    email: z.email(),
    permissions: z.array(z.string()),
});

export type UserPermissionsDto = z.infer<typeof UserPermissionsSchema>;