import { InvitationService } from "@/lib/services/invitation-services";
import { InvitationListClient } from "./InvitationListClient";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Mail } from "lucide-react";

interface InvitationListProps {
    userEmail: string;
}

export async function InvitationList({ userEmail }: InvitationListProps) {
    const invites = await InvitationService.getUserInvitations(userEmail);

    if (!invites || invites.length === 0) {
        return (
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Pending Invitations</h2>
                </div>
                <Card className="border-dashed py-8">
                    <CardHeader className="text-center">
                        <div className="mx-auto rounded-full bg-muted p-3 mb-2 w-fit">
                            <Mail className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg">No pending invitations</CardTitle>
                        <CardDescription>
                            When you are invited to a workspace, it will appear here.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Pending Invitations</h3>
            <InvitationListClient userEmail={userEmail} invites={invites as any} />
        </div>
    );
}
