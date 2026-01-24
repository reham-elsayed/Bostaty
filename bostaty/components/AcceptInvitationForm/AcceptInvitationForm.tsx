'use client'

import { acceptInvitationAction } from "@/app/accept-invitation/actions"
import { useTransition, useState } from "react"

export default function AcceptInvitationForm({ token }: { token: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleAction = () => {
        setError(null)
        startTransition(async () => {
            const result = await acceptInvitationAction(token)
            if (result?.error) {
                setError(result.error)
            } else if (result?.requiresLogin) {
                // If the user isn't logged in, send them to login
                // After login, they land on /workspace where the handshake completes it
                window.location.href = `/login?next=${encodeURIComponent('/workspace')}`
            }
        })
    }


    return (
        <form action={handleAction}>
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}
            <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium transition-all disabled:opacity-50"
            >
                {isPending ? "Joining workspace..." : "Accept Invitation"}
            </button>
        </form>
    )
}