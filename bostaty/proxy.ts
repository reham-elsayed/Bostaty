import { updateSession } from "@/lib/supabase/proxy";
import { NextRequest, NextResponse } from "next/server";
import { mintAppToken } from "./lib/auth/mintToken";
import { createClient } from "./lib/supabase/server";
import { cookies } from "next/headers";
const TENANT_CACHE_COOKIE = "app_access_token"
export async function proxy(request: NextRequest) {
  try {
    const response = await updateSession(request);
    if (response.headers.get("location")) return response;

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    const isIgnoredPath = ["/invites", "/accept-invitation", "/onboarding", "/workspace", "/invalid-token", "/tenants", "/tenant/create"].some(
      path => request.nextUrl.pathname.startsWith(path)
    );

    if (isIgnoredPath) {
      console.log(`Proxy: Ignored path ${request.nextUrl.pathname}, passing through.`);
      return response;
    }

    if (user) {
      const userId = user.id;
      let result;
      if (request.cookies.get(TENANT_CACHE_COOKIE)) {
        result = await mintAppToken(userId, request.cookies.get(TENANT_CACHE_COOKIE)?.value);
      } else {
        result = await mintAppToken(userId);
      }

      console.log("result", result)
      if (!result) {
        console.log(`Proxy: User ${userId} has no tenant token, redirecting to /workspace from ${request.nextUrl.pathname}`);
        return NextResponse.redirect(new URL("/workspace", request.url));
      }
      const newHeaders = new Headers(request.headers);
      newHeaders.set('x-tenant-id', result.tenantId);
      newHeaders.set('x-app-token', result.token);

      const finalResponse = NextResponse.next({
        request: { headers: newHeaders },
      });

      finalResponse.cookies.set(TENANT_CACHE_COOKIE, result.token, {
        maxAge: 3600,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      response.cookies.getAll().forEach((c) => finalResponse.cookies.set(c.name, c.value, c));

      return finalResponse;
    }

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