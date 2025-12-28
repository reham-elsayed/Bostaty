import { NextRequest, NextResponse } from "next/server"
import { TenantService } from "@/lib/services/tenant-service"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"



export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }
    try {

        const body = await request.json()

        const tenant = await TenantService.createTenant({
            ...body,
            userId: user.id,
        })

        return NextResponse.json(tenant)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to create tenant" },
            { status: 500 }
        )
    }
}
