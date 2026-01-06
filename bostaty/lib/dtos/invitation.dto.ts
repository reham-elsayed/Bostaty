import { z } from "zod";
import { TenantRole } from "@prisma/client";

export const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(TenantRole, {
        errorMap: () => ({ message: "Please select a valid role" }),
    }),
});

export type InviteMemberDTO = z.infer<typeof inviteMemberSchema>;
