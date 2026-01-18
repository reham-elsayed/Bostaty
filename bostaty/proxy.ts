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
    const user = data?.user;

    const isIgnoredPath = ["/invites", "/accept-invitation", "/onboarding"].some(
      path => request.nextUrl.pathname.startsWith(path)
    );

    // 1. If on an ignored path, just return the session-updated response immediately.
    // This stops the middleware from trying to find a tenant where one might not exist yet.
    if (isIgnoredPath) {
      return response;
    }

    if (user) {
      const userId = user.id;
      const result = await mintAppToken(userId);

      // 2. If user is logged in but has no tenant membership
      if (!result) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      // 3. User has a tenant -> Inject Headers
      const newHeaders = new Headers(request.headers);
      newHeaders.set('x-tenant-id', result.tenantId);
      newHeaders.set('x-app-token', result.token);

      const finalResponse = NextResponse.next({
        request: { headers: newHeaders },
      });

      // 4. Sync Cookies (including Supabase session cookies)
      finalResponse.cookies.set(TENANT_CACHE_COOKIE, JSON.stringify({
        userId,
        tenantId: result.tenantId,
        token: result.token
      }), {
        maxAge: 3600, path: "/", httpOnly: true, sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      // Sync all cookies from the updateSession response
      response.cookies.getAll().forEach((c) => finalResponse.cookies.set(c.name, c.value, c));

      return finalResponse;
    }

    // 5. No user logged in? Let the page/auth-guard handle it.
    return response;
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.next({ request: { headers: request.headers } });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};