import { updateSession } from "@/lib/supabase/proxy";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function proxy(request: NextRequest) {
  // 1️⃣ Let Supabase do its work first
  const response = await updateSession(request);

  // 2️⃣ Read your custom app token
  const appToken = request.cookies.get("app_access_token")?.value;
  if (!appToken) return response;

  try {
    // 3️⃣ Verify & decode
    const decoded = jwt.verify(
      appToken,
      process.env.JWT_SIGNING_SECRET!
    ) as {
      tenant_id?: string;
      sub?: string;
      token_version?: number;
    };

    // 4️⃣ Inject headers for downstream consumers
    if (decoded?.tenant_id) {
      response.headers.set("x-tenant-id", decoded.tenant_id);
    }

    if (decoded?.sub) {
      response.headers.set("x-user-id", decoded.sub);
    }

    if (decoded?.token_version !== undefined) {
      response.headers.set(
        "x-token-version",
        String(decoded.token_version)
      );
    }
  } catch {
    // Invalid or expired token → ignore silently
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
