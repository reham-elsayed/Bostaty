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


      const result = await mintAppToken(userId);
      const isIgnoredPath = ["/onboarding", "/invites", "/accept-invitation"].some(
        path => request.nextUrl.pathname.startsWith(path)
      );


      if (!result && !isIgnoredPath) {
        // Truly no memberships and no invites? Go to onboarding.
        if (!request.nextUrl.pathname.startsWith("/onboarding")) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        return response;
      }


      // --- 4. HEADER INJECTION ---
      const newHeaders = new Headers(request.headers);
      newHeaders.set('x-tenant-id', result?.tenantId!);
      newHeaders.set('x-app-token', result?.token!);

      const finalResponse = NextResponse.next({
        request: { headers: newHeaders },
      });

      // --- 5. SYNC COOKIES ---
      if (result) {
        finalResponse.cookies.set(TENANT_CACHE_COOKIE, JSON.stringify({ userId, tenantId: result.tenantId, token: result.token }), {
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