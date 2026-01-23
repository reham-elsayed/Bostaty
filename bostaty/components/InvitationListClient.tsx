"use client";

import { acceptInviteAction } from "@/app/workspace/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useState } from "react";

export interface Invitation {
    id: string;
    email: string;
    token: string;
    tenant: {
        id: string;
        name: string;
        slug: string;
    };
    inviter: {
        name: string | null;
        email: string;
        id?: string
    } | null;
}

interface InvitationListClientProps {
    userEmail: string;
    invites: Invitation[];
}

export function InvitationListClient({ userEmail, invites }: InvitationListClientProps) {
    const [isAccepting, setIsAccepting] = useState<string | null>(null);

    const handleAccept = async (invite: Invitation): Promise<void> => {
        setIsAccepting(invite.token);
        try {
            await acceptInviteAction(invite.id, invite.email);
        } finally {
            setIsAccepting(null);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invites.map((invite) => (
                <Card key={invite.id} className="border-indigo-100 dark:border-indigo-900 border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">{invite.tenant.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                            <Mail className="h-3 w-3" />
                            Invited by {invite.inviter?.name || invite.inviter?.email}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button
                            className="w-full text-sm"
                            size="sm"
                            onClick={() => handleAccept(invite)}
                            disabled={!!isAccepting}
                        >
                            {isAccepting === invite.token ? "Accepting..." : "Accept Invitation"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
