'use server'

import prisma from '@/lib/prisma'
import { InvitationService } from '@/lib/services/invitation-services'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function acceptInvitationAction(token: string) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
        // Redirect to signup, preserving the invitation token in the URL
        const loginUrl = `/login?next=${encodeURIComponent(`/accept-invitation?token=${token}`)}`

        redirect(loginUrl)
    }

    let success = false
    try {
        await InvitationService.acceptInvite(token, user.id)
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