import { updateSession } from "@/lib/supabase/proxy";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { mintAppToken } from "./lib/auth/mintToken";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./lib/supabase/server";
import { InvitationService } from "./lib/services/invitation-services";
const TENANT_CACHE_COOKIE = "app_tenant_cache"
export async function proxy(request: NextRequest) {
  try {
    const response = await updateSession(request);
    if (response.headers.get("location")) return response;

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
      const userId = data.user.id;

      // --- 1. INDEPENDENT INVITATION CHECK ---
      // We check for tokens regardless of whether they already have a tenant
      const inviteToken = request.nextUrl.searchParams.get("token");
      const cookieToken = request.cookies.get("pending_invite_token")?.value;
      const activeInviteToken = (inviteToken && inviteToken !== "null") ? inviteToken : cookieToken;

      if (activeInviteToken && activeInviteToken !== "null") {
        // If they are on the accept page, let them through
        if (request.nextUrl.pathname.startsWith(`/accept-invitation?token=${activeInviteToken}`)) {
          const inviteRes = NextResponse.next();
          inviteRes.cookies.set("pending_invite_token", activeInviteToken, { maxAge: 3600, path: "/" });
          return inviteRes;
        }
        // Otherwise, if we have a token, FORCE them to the acceptance flow
        // const acceptUrl = new URL("/accept-invitation", request.url);
        // acceptUrl.searchParams.set("token", activeInviteToken);
        // const inviteRes = NextResponse.redirect(acceptUrl);
        // inviteRes.cookies.set("pending_invite_token", activeInviteToken, { maxAge: 3600, path: "/" });
        // return inviteRes;
      }

      // --- 2. TENANT CONTEXT RESOLUTION ---
      const cachedData = request.cookies.get(TENANT_CACHE_COOKIE)?.value;
      let tenantId: string | null = null;
      let appToken: string | null = null;

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.userId === userId) {
          tenantId = parsed.tenantId;
          appToken = parsed.token;
        }
      }

      // --- 3. FALLBACK TO DB (Default Tenant) ---
      if (!tenantId || !appToken) {
        const result = await mintAppToken(userId);

        if (!result) {
          // Truly no memberships and no invites? Go to onboarding.
          if (!request.nextUrl.pathname.startsWith("/onboarding")) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
          }
          return response;
        }
        tenantId = result.tenantId;
        appToken = result.token;
      }

      // --- 4. HEADER INJECTION ---
      const newHeaders = new Headers(request.headers);
      newHeaders.set('x-tenant-id', tenantId!);
      newHeaders.set('x-app-token', appToken!);

      const finalResponse = NextResponse.next({
        request: { headers: newHeaders },
      });

      // --- 5. SYNC COOKIES ---
      if (!cachedData) {
        finalResponse.cookies.set(TENANT_CACHE_COOKIE, JSON.stringify({ userId, tenantId, token: appToken }), {
          maxAge: 3600, path: "/", httpOnly: true, sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }

      response.cookies.getAll().forEach((c) => finalResponse.cookies.set(c.name, c.value, c));
      return finalResponse;
    }
    return response;
  } catch (error) {
    return NextResponse.next({ request: { headers: request.headers } });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};