import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const updateSession = async (request: NextRequest) => {
    // Create an unmodified response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();
    const url = request.nextUrl.clone();
    // AUTH PROTECTION LOGIC
    // 1. If NOT logged in, protect /dashboard
    if (!user && url.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. If LOGGED in and hitting / or /login, send to /dashboard
    if (user && (url.pathname === "/" || url.pathname === "/login")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
};
