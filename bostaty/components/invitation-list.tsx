"use client";

import { acceptInviteAction } from "@/app/workspace/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, Mail } from "lucide-react";
import { useState } from "react";
// We'll define a type that matches the service return type
// Since we don't have the exact inferred type easily available in a client component without some work, 
// we will define the shape we expect.

interface Invitation {
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
    };
}

interface InvitationListProps {
    invites: any[]; // Using any[] temporarily to avoid strict Prisma type issues in client component, or I could use Partial<Invitation>
}

export function InvitationList({ invites }: InvitationListProps) {
    const [isAccepting, setIsAccepting] = useState<string | null>(null);

    const handleAccept = async (invite: Invitation) => {
        setIsAccepting(invite.token);

        acceptInviteAction(invite.id, invite.email)
    };

    if (!invites || invites.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Pending Invitations</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {invites.map((invite) => (
                    <Card key={invite.id} className="border-indigo-100 dark:border-indigo-900 border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">{invite.tenant.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs">
                                <Mail className="h-3 w-3" />
                                Invited by {invite.inviter.name || invite.inviter.email}
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
        </div>
    );
}
