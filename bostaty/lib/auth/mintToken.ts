import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function mintAppToken(userId: string) {
    // Resolve tenant
    const { data: ut, error: utError } = await supabaseAdmin
        .from("tenant_members")
        .select('"tenantId"')
        .eq('"userId"', userId)
        .limit(1)
        .maybeSingle();

    if (utError) {
        console.error("tenant_members lookup failed", utError);
        return null;
    }
    if (!ut) {
        return null
    }
    const { data: userResp } =
        await supabaseAdmin.auth.admin.getUserById(userId);

    const tokenVersion =
        (userResp?.user?.user_metadata?.token_version as number) ?? 0;

    const now = Math.floor(Date.now() / 1000);

    const token = jwt.sign(
        {
            sub: userId,
            tenant_id: ut?.tenantId,
            token_version: tokenVersion,
            iat: now,
        },
        process.env.JWT_SIGNING_SECRET!,
        { expiresIn: 15 * 60 }
    );
    console.log({
        token,
        tenantId: ut?.tenantId,
    }, "----------------token----------------")
    return {
        token,
        tenantId: ut?.tenantId,
    };
}