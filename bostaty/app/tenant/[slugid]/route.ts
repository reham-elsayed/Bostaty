// app/api/tenants/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slugid: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const slugid = (await params).slugid
        // Get tenant by slug OR ID and verify user is a member
        const tenant = await prisma.tenant.findFirst({
            where: {
                OR: [

                    { id: slugid }
                ],
                members: {
                    some: { userId: user.id }
                }
            },
            include: {
                members: {
                    where: { userId: user.id },
                    select: { role: true }
                }
            }
        })

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
        }

        return NextResponse.json({
            ...tenant,
            userRole: tenant.members[0]?.role
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch tenant" },
            { status: 500 }
        )
    }
}