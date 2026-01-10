// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InvitationService } from '@/lib/services/invitation-services'

export async function GET(req: Request) {
    const url = new URL(req.url)

    const error = url.searchParams.get('error')
    const errorCode = url.searchParams.get('error_code')

    if (errorCode === 'otp_expired') {
        return NextResponse.redirect(new URL('/invite-expired', req.url))
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    const invite = await InvitationService.findActiveInvitationByEmail(user.email!)

    if (invite) {
        return NextResponse.redirect(
            new URL(`/accept-invitation?token=${invite.token}`, req.url)
        )
    }
    const tokenRes = await fetch(new URL('/token', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            supabase_access_token: (await supabase.auth.getSession()).data.session?.access_token,
        }),
    })

    if (!tokenRes.ok) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.redirect(new URL('/dashboard', req.url))
}
