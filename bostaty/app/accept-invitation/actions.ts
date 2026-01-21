'use server'

import prisma from '@/lib/prisma'
import { InvitationService } from '@/lib/services/invitation-services'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function acceptInvitationAction(token: string) {
    // const supabase = await createClient()
    // const { data: { user }, error } = await supabase.auth.getUser()

    // if (!user) {
    //     // Redirect to signup, preserving the invitation token in the URL
    //     const loginUrl = `/login?next=${encodeURIComponent(`/accept-invitation?token=${token}`)}`

    //     redirect(loginUrl)
    // }

    let success = false
    try {
        const invitation = await InvitationService.getInvitationMetadata(token);
        if (invitation) {
            // Save token to Cookie (The "Memo" for later)
            (await cookies()).set("pending_invite_token", token, { path: "/", maxAge: 3600 });
        }

        success = true
    } catch (error: any) {
        return {
            error: error.message || "Failed to accept invitation"
        }
    }

    if (success) {
        // After success, redirect to the dashboard or the workspace
        redirect('/dashboard')
    }
}