import { NextRequest, NextResponse } from "next/server"
import { TenantService } from "@/lib/services/tenant-service"
import { createClient } from "@/lib/supabase/server"



export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    try {

        const body = await request.json()

        const tenant = await TenantService.createTenant({
            ...body,
            userId: user.id,
        })

        return NextResponse.json(tenant)
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create tenant";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
