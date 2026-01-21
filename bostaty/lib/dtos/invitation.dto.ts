import { z } from "zod";
import { TenantRole } from "../../types/Roles";


export const inviteMemberSchema = z.object({
    email: z.email("Invalid email address"),
    role: z.enum(TenantRole, {
        error: "Please select a valid role" ,
    }),
});

export type InviteMemberDTO = z.infer<typeof inviteMemberSchema>;
