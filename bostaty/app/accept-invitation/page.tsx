import AcceptInvitationForm from "@/components/AcceptInvitationForm/AcceptInvitationForm"
import { InvitationService } from "@/lib/services/invitation-services"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function AcceptInvitationPage({
    searchParams,
}: {
    searchParams: { token?: string }
}) {
    const token = (await searchParams).token

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p className="text-destructive font-semibold">Invalid or missing invitation token.</p>
            </div>
        )
    }

    const invite = await InvitationService.getInvitationMetadata(token)

    if (!invite) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-xl font-bold mb-2">Invitation Not Found</h1>
                <p className="text-muted-foreground mb-4">This invitation has expired or is invalid.</p>
                <Link href="/" className="text-primary hover:underline">Go to Home</Link>
            </div>
        )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="max-w-md w-full p-8 border rounded-xl shadow-sm bg-card">
                <h1 className="text-2xl font-bold mb-4">Accept Invitation</h1>
                <p className="mb-6 text-muted-foreground text-lg">
                    You've been invited to join <strong>{invite.tenant.name}</strong>
                    {invite.inviter?.name || invite.inviter?.email ? <> by <strong>{invite.inviter.name || invite.inviter.email}</strong></> : ""}.
                </p>

                {user ? (
                    user.email === invite.email ? (
                        <AcceptInvitationForm token={token} />
                    ) : (
                        <div className="space-y-4">
                            <p className="text-destructive font-medium">
                                This invitation was sent to <strong>{invite.email}</strong>, but you are logged in as <strong>{user.email}</strong>.
                            </p>
                            <p className="text-sm text-balance">Please log out and log in with the account matching the invitation email to continue.</p>
                        </div>
                    )
                ) : (
                    <div className="space-y-6">
                        <p className="text-muted-foreground">You need an account to join this workspace.</p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={`/login?email=${encodeURIComponent(invite.email)}&next=${encodeURIComponent(`/accept-invitation?token=${token}`)}`}
                                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium transition-all"
                            >
                                Create Account
                            </Link>
                            <Link
                                href={`/login?next=${encodeURIComponent(`/accept-invitation?token=${token}`)}`}
                                className="w-full py-2.5 px-4 border rounded-lg hover:bg-accent font-medium transition-all"
                            >
                                Log In
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}