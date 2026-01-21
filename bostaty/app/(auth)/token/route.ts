// app/(auth)/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET!;
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_SIGNING_SECRET) {
  throw new Error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SIGNING_SECRET');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Handler supports three flows:
 * 1) credentials: { email, password } - verify sign-in via Supabase admin (recommended client sign-in + server verify)
 * 2) supabase_access_token: { accessToken } - verify an existing Supabase access token by fetching the user via admin.getUserById
 * 3) direct: { userId, tenantId } - used in onboarding immediately after tenant creation (server-to-server)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    let userId: string | undefined;
    let tenantId: string | undefined;
    let tokenVersion: number | undefined;

    // Flow A: credentials (email/password) - preferred: let client sign-in and send supabase_access_token,
    // but we support credentials here by calling the admin verify endpoint (note: admin API doesn't support signInWithPassword).
    // So if credentials are provided, we return an instruction to use client-side sign-in for security.
    if (body.email || body.password) {
      // SECURITY: avoid performing password sign-in using anon key on server.
      return NextResponse.json({
        error:
          'Do not send credentials to this endpoint. Sign in from the client and call this endpoint with supabase_access_token or userId.',
      }, { status: 400 });
    }

    // Flow B: client sends a Supabase access token (preferred when client handles sign-in)
    if (body.supabase_access_token) {
      const supabaseAccessToken = body.supabase_access_token as string;

      // Use the service role to look up the session's user by verifying the token via admin.getUserById is not direct.
      // Instead, decode token (untrusted), extract sub (user id) and then fetch user to confirm.
      // Note: decoding without verification is OK if we immediately verify existence via admin API.
      const decoded: any = jwt.decode(supabaseAccessToken);
      if (!decoded || !decoded.sub) {
        return NextResponse.json({ error: 'Invalid supabase_access_token' }, { status: 400 });
      }
      userId = decoded.sub as string;
      console.log(userId);
      // Verify user exists and fetch metadata
      const { data: adminUserResp, error: adminErr } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (adminErr || !adminUserResp?.user) {
        console.error('admin.getUserById error', adminErr);
        return NextResponse.json({ error: 'Invalid Supabase session or user not found' }, { status: 401 });
      }
      const adminUser = adminUserResp.user;

      // Optionally validate token iat/exp against admin data or store session state in DB for further checks.
      // Resolve tenantId from metadata or from user_tenants table
      tenantId = adminUser.user_metadata?.tenant_id as string | undefined;
      tokenVersion = (adminUser.user_metadata?.token_version as number) ?? undefined;

      if (!tenantId) {
        const { data: ut, error: utErr } = await supabaseAdmin
          .from('tenant_members')
          .select('tenantId')
          .eq('userId', userId)
          .limit(1)
          .single();

        if (utErr && utErr.code !== 'PGRST116') {
          // PGRST116 or similar means no rows — handle gracefully
          console.error('tenant_members lookup error', utErr);
        }
        tenantId = ut?.tenantId;
      }
    }

    // Flow C: server-to-server onboarding or direct reissue (trusted request)
    // e.g., an internal call supplies userId and tenantId after creating tenant
    if (body.userId && body.tenantId) {
      userId = body.userId;
      tenantId = body.tenantId;
      console.log(tenantId,
        "tenantId"
      )
      // fetch token version if available
      const { data: adminUserResp, error: adminErr } = await supabaseAdmin.auth.admin.getUserById(userId as string);
      if (adminErr || !adminUserResp?.user) {
        console.error('admin.getUserById error', adminErr);
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      }
      tokenVersion = (adminUserResp.user.user_metadata?.token_version as number) ?? undefined;
    }

    // At this point we must have a userId
    if (!userId) return NextResponse.json({ error: 'userId not provided or could not be resolved' }, { status: 400 });

    // If tenantId still not found, attempt DB lookup one last time
    if (!tenantId) {
      const { data: ut2, error: utErr2 } = await supabaseAdmin
        .from('tenant_members')
        .select('tenantId')
        .eq('userId', userId)
        .limit(1)
        .single();

      if (utErr2) {
        console.error('tenant_members lookup error (final)', utErr2);
      }
      tenantId = ut2?.tenantId;
      console.log(tenantId, "tenantid after lookup")
    }

    if (!tenantId) return NextResponse.json({ error: 'Tenant not assigned' }, { status: 403 });

    // Fallback token_version default
    const tokenVersionFinal = typeof tokenVersion === 'number' ? tokenVersion : 0;

    // Mint custom app token
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userId,
      tenant_id: tenantId,
      token_version: tokenVersionFinal,
      iat: now,
    };

    const accessToken = jwt.sign(payload, JWT_SIGNING_SECRET, {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    });

    const response = NextResponse.json({
      accessToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      user: { id: userId },
      tenantId,
      token_version: tokenVersionFinal,
    });

    response.cookies.set('app_access_token', accessToken, {
      httpOnly: true,
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    console.log("D: Final tenantId being signed:", tenantId);
    return response;
  } catch (err) {
    console.error('token handler error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
