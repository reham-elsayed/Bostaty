import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AcceptInvitationForm from "@/components/AcceptInvitationForm/AcceptInvitationForm";
import { createClient } from "@/lib/supabase/client";
import { InvitationService } from "@/lib/services/invitation-services";
import { Suspense } from "react";
import { acceptInvitationAction } from "./actions";

export default async function AcceptInvitationPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const token = (await searchParams).token;
    console.log(token);
    if (!token) redirect("/404");

    // 1. Verify token and set cookie
    const result = await InvitationService.getInvitationMetadata(token);


    if (!result) {
        redirect("/invalid-token");
    }

    const invitation = result;

    // 2. Render the invitation UI
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading invitation...</div>}>
            <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl shadow-sm bg-card text-card-foreground text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">You've been invited!</h1>
                    <p className="text-muted-foreground">
                        You've been invited to join <span className="font-semibold text-foreground">{invitation.tenant.name}</span>
                    </p>
                </div>

                <div className="pt-4 border-t">
                    <AcceptInvitationForm token={token} />
                </div>

                <p className="text-xs text-muted-foreground">
                    By clicking accept, you agree to join this workspace and its policies.
                </p>
            </div>
        </Suspense>
    );
}
