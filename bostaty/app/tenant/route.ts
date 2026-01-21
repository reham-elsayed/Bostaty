// app/api/tenants/route.ts
import { NextRequest, NextResponse } from "next/server"
import { TenantService } from "@/lib/services/tenant-service"
import { createClient } from "@/lib/supabase/server"


export async function GET() {
    try {

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const tenants = await TenantService.getUserTenants(user.id)
        return NextResponse.json(tenants)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch tenants" },
            { status: 500 }
        )
    }
}