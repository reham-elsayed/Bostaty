// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/auth/getTenantContext";
import { cookies } from "next/headers";
import { Suspense } from "react";
import HeadersWrapper from "@/components/HeadersWrapper/HeadersWrapper";

export default async function TenantDashboardPage() {



    // Simplified UI for now as requested
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HeadersWrapper>
                <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                    <p>Welcome to tenant: <span className="font-mono bg-muted p-1 rounded"></span></p>
                    <div className="mt-8 p-4 border rounded-lg bg-card">
                        <p className="text-muted-foreground italic">
                            UI is currently in simple mode. Full dashboard features can be restored once routing is confirmed.
                        </p>
                    </div>
                </div>
            </HeadersWrapper>
        </Suspense>
    );
}