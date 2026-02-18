
'use server'

import { InvitationService } from "@/lib/services/invitation-services"
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { Tenant } from "@/types/TenantTypes";


export async function acceptInviteAction(inviteId: string, userEmail: string) {
    const supabase = await createClient();

    // 1. Get user from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return { error: error?.message || "User not found" }
    }
    try {
        await InvitationService.acceptInviteById(inviteId, userEmail, user?.id as string)
        revalidatePath('/workspaces') // Refresh the list
        return { success: true }
    } catch (err) {
        return { error: err instanceof Error ? err.message : "An unknown error occurred" }
    }
}
export async function getSelectedTenant(tenant: Tenant) {
    console.log("getSelectedTenant started for tenant:", tenant.id);
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser()
    console.log("User found:", data.user?.id);

    try {
        // TODO: This fetch might be failing if base URL is missing or if cookies are not propagated.
        // Ideally we should move the token logic to a shared library function.
        const headerList = await headers();
        const cookieHeader = headerList.get('cookie') || '';

        const response = await fetch(`https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader
            },
            body: JSON.stringify({
                tenantId: tenant.id,
                userId: data.user?.id
            })
        })

        console.log("Token endpoint response status:", response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error("Token endpoint failed:", text);
            throw new Error("Failed to get token: " + text);
        }

        // IMPORTANT: Fetching from a server action does NOT automatically set cookies in the browser.
        // We need to extract the cookie from the response and set it using `cookies()`.
        const responseData = await response.json();
        const accessToken = responseData.accessToken;
        const expiresIn = responseData.expiresIn || 15 * 60;

        if (accessToken) {
            console.log("Setting app_access_token cookie with extraction");
            const cookieStore = await cookies();
            cookieStore.set('app_access_token', accessToken, {
                httpOnly: true,
                path: '/',
                maxAge: expiresIn,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });
        } else {
            console.warn("No access token returned from token endpoint");
        }

        revalidatePath('/workspace')

    } catch (err) {
        console.error("Error in getSelectedTenant:", err);
        return { error: err instanceof Error ? err.message : "An unknown error occurred" }
    }

    // Redirect must be outside try-catch
    redirect('/dashboard')
}