import { redirect } from "next/navigation";
import AcceptInvitationForm from "@/components/AcceptInvitationForm/AcceptInvitationForm";
import { InvitationService } from "@/lib/services/invitation-services";
import { Suspense } from "react";


async function InvitationContent({ 
    searchParamsPromise 
}: { 
    searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
    const searchParams = await searchParamsPromise;
    const token = typeof searchParams.token === 'string' ? searchParams.token : undefined;

    if (!token) {
        redirect("/404");
    }

    // 1. Verify token
    const invitation = await InvitationService.getInvitationMetadata(token);

    if (!invitation) {
        redirect("/invalid-token");
    }

    // 2. Render the invitation UI
    return (
        <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl shadow-sm bg-card text-card-foreground text-center space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">You&apos;ve been invited!</h1>
                <p className="text-muted-foreground">
                    You&apos;ve been invited to join <span className="font-semibold text-foreground">{invitation.tenant.name}</span>
                </p>
            </div>

            <div className="pt-4 border-t">
                <AcceptInvitationForm token={token} />
            </div>

            <p className="text-xs text-muted-foreground">
                By clicking accept, you agree to join this workspace and its policies.
            </p>
        </div>
    );
}

export default function AcceptInvitationPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading invitation...</div>}>
            <InvitationContent searchParamsPromise={searchParams} />
        </Suspense>
    );
}
