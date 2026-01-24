'use client'

import { useEffect } from 'react'
import { completePendingInvitationAction } from "@/app/accept-invitation/actions"
import { useRouter } from 'next/navigation'

/**
 * An invisible component that checks for pending invitations 
 * and processes them after the user has logged in.
 */
export function PendingInvitationHandler() {
    const router = useRouter()

    useEffect(() => {
        const performHandshake = async () => {
            try {
                const result = await completePendingInvitationAction()
                if (result.success) {
                    console.log("Handshake successful:", result.message)
                    // Refresh the current route to show the newly joined tenant
                    router.refresh()
                }
            } catch (error) {
                console.error("Handshake failed:", error)
            }
        }
        performHandshake()
    }, [router])

    // This component renders nothing
    return null
}

