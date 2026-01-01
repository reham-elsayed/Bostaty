import { updateSession } from "@/lib/supabase/proxy";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { mintAppToken } from "./lib/auth/mintToken";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./lib/supabase/server";

export async function proxy(request: NextRequest) {
  try {
    // 1. Supabase Session Check
    const response = await updateSession(request);

    // 2. Cookie Extraction

    const supabase = await createClient()
    const { data, error } = await supabase.auth.getSession()
    if (data.session) {
      const supabaseToken = data.session.access_token;
      console.log(supabaseToken)
      if (!supabaseToken) {
        console.log("DEBUG: No Supabase token found in cookies.");
        return response;
      }

      // 3. JWT Decoding
      let decoded: any;
      try {
        // Note: jwt.decode does not verify the signature. 
        // If you need security here, use jwt.verify(token, secret)
        decoded = jwt.decode(supabaseToken);

        if (!decoded || !decoded.sub) {
          console.error("DEBUG: Token decoded but 'sub' (User ID) is missing.", decoded);
          return response;
        }
      } catch (jwtError) {
        console.error("DEBUG: JWT Decode failed:", jwtError);
        return response;
      }

      // 4. Token Minting & Tenant Lookup
      try {
        const result = await mintAppToken(decoded.sub);

        if (!result) {
          console.warn(`DEBUG: mintAppToken returned null for user ${decoded.sub}`);
          return response;
        }

        const { tenantId, token } = result;

        // 5. Header Injection
        const newHeaders = new Headers(request.headers);
        newHeaders.set('x-tenant-id', tenantId);
        newHeaders.set('x-app-token', token);

        // Return the next response with modified headers
        return NextResponse.next({
          request: {
            headers: newHeaders,
          },
        });

      } catch (mintError) {
        console.error("DEBUG: mintAppToken threw an error:", mintError);
        return response;
      }

    }
  } catch (globalError) {
    // Catch-all for updateSession or unexpected logic failures
    console.error("DEBUG: Global Proxy Error:", globalError);

    // Fallback to basic next() to prevent the whole site from crashing
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};