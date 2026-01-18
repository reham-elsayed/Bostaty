import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Or your service layer
import AcceptInvitationForm from "@/components/AcceptInvitationForm/AcceptInvitationForm";
import { createClient } from "@/lib/supabase/client";

export default async function AcceptInvitationPage({
    searchParams,
}: {
    searchParams: { token?: string };
}) {
    const token = (await searchParams).token;

    if (!token) redirect("/404");

    // 1. Verify token exists in DB (Safe for public eyes)
    const invitation = await prisma.tenantInvitation.findUnique({
        where: { token },
        include: { tenant: true }
    });

    if (!invitation) redirect("/invalid-token");

    // 2. Save token to Cookie (The "Memo" for later)
    (await cookies()).set("pending_invite_token", token, { path: "/", maxAge: 3600 });

    // 3. Check if user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If NOT logged in, show a "Login to Join" view
    if (!user) {
        return (
            <div className="p-8 text-center">
                <h1>You've been invited to join {invitation.tenant.name}</h1>
                <p>Please sign in to accept your invitation.</p>
                <a href={`/login?next=/accept-invitation?token=${token}`} className="btn">
                    Sign In to Join
                </a>
            </div>
        );
    }

    // If LOGGED in, show the "Accept" button (calls a Server Action)
    return (
        <div className="p-8 text-center">
            <h1>Join {invitation.tenant.name}</h1>
            <p>Logged in as {user.email}</p>
            <AcceptInvitationForm token={token} />
        </div>
    );
}