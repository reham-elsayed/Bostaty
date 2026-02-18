'use server'

import { InvitationService } from '@/lib/services/invitation-services'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function acceptInvitationAction(token: string) {
    // const supabase = await createClient()
    // const { data: { user }, error } = await supabase.auth.getUser()

    const cookieStore = await cookies()
    let invitation = null
    try {
        invitation = await InvitationService.getInvitationMetadata(token);
        if (invitation) {
            // Set the pending token in a cookie for possible handshake later
            cookieStore.set("pending_invite_token", token, { path: "/", maxAge: 3600 });
        } else {
            return { error: "Invalid or expired invitation" }
        }

        // Check if user is already logged in
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // They are logged in! We can actually accept it right now.
            try {
                await InvitationService.acceptInvite(token, user.id)
                cookieStore.delete("pending_invite_token")
                // Success! Redirect them to their new workspace
                redirect('/workspace')
            } catch (acceptError: unknown) {
                // If they are already a member, just send them to workspace
                if (acceptError instanceof Error && acceptError.message?.includes("already a member")) {
                    redirect('/workspace')
                }
                throw acceptError
            }
        }

        // Guest user: just return the invitation metadata so the page can render
        return { success: true, invitation, requiresLogin: true }
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error; // Allow Next.js redirects to work
        return {
            error: (error instanceof Error ? error.message : String(error)) || "Failed to accept invitation"
        }
    }
}


export async function completePendingInvitationAction() {
    const cookieStore = await cookies()
    const token = cookieStore.get("pending_invite_token")?.value

    if (!token) return { success: false, message: "No pending invitation" }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "User not logged in" }

    try {
        await InvitationService.acceptInvite(token, user.id)

        // Clear the cookie after successful acceptance
        cookieStore.delete("pending_invite_token")

        return { success: true, message: "Invitation accepted successfully" }
    } catch (error: unknown) {
        console.error("Error completing pending invitation:", error)
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Optionally clear the cookie if the token is invalid/expired anyway
        if (errorMessage === 'Invalid or expired invitation') {
            cookieStore.delete("pending_invite_token")
        }
        return { success: false, error: errorMessage }
    }
}
