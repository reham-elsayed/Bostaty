// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InvitationService } from '@/lib/services/invitation-services'
import { TenantService } from '@/lib/services/tenant-service'

export async function GET(req: Request) {
    const url = new URL(req.url)

    const error = url.searchParams.get('error')
    const errorCode = url.searchParams.get('error_code')

    if (errorCode === 'otp_expired') {
        return NextResponse.redirect(new URL('/invite-expired', req.url))
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()


    const invite = url.searchParams.get('token')
    console.log(invite, "invite info")
    if (invite) {
        return NextResponse.redirect(
            new URL(`/accept-invitation?token=${invite}`, req.url)
        )
    }

    return NextResponse.redirect(new URL('/dashboard', req.url))
}
