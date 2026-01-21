import { NextRequest, NextResponse } from "next/server";

// app/api/tenants/[id]/stats/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Implementation for dashboard stats
    return NextResponse.json({
        totalMembers: 12,
        activeProjects: 5,
        storageUsed: '2.4 GB',
        recentActivity: [
            {
                description: "Sarah invited John to the workspace",
                timestamp: new Date(Date.now() - 3600000)
            },
            // ... more activity
        ]
    })
}