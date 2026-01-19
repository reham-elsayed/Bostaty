
'use server'

import { InvitationService } from "@/lib/services/invitation-services"
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

export async function acceptInviteAction(inviteId: string, userEmail: string) {
    const supabase = await createClient();

    // 1. Get user from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user) {
        return { error: "User not found" }
    }
    try {
        await InvitationService.acceptInviteById(inviteId, userEmail, user?.id as string)
        revalidatePath('/workspaces') // Refresh the list
        return { success: true }
    } catch (err) {
        return { error: err.message }
    }
}