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

    // 1. Verify token exists in DB (Safe for public eyes)
    // The token in the URL is raw; the DB has it hashed. We MUST use the service to look it up.
    const invitation = await acceptInvitationAction(token)

    console.log("Invitation lookup:", { token, found: !!invitation });


    if (!invitation) redirect("/invalid-token");




    // 3. Check if user is logged in
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();

    // If NOT logged in, show a "Login to Join" view
    // if (!user) {
    //     return (
    //         <div className="p-8 text-center">
    //             <h1>You've been invited to join {invitation.tenant.name}</h1>
    //             <p>Please sign in to accept your invitation.</p>
    //             <a href={`/login?next=/accept-invitation?token=${token}`} className="btn">
    //                 Sign In to Join
    //             </a>
    //         </div>
    //     );
    // }

    // If LOGGED in, show the "Accept" button (calls a Server Action)
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="p-8 text-center">
                <h1>Join </h1>
                <AcceptInvitationForm token={token} />
            </div>
        </Suspense>
    );
}