import { InvitationList } from "@/components/invitation-list";
import { TenantList } from "@/components/tenant-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoSetupButton } from "@/components/workspace/auto-setup-button";
import { createClientfactory } from "@/lib/supabase/factory";
import { LayoutDashboard, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { InvitationSkeleton, TenantSkeleton } from "@/components/workspace/workspace-skeletons";
import { TenantService } from "@/lib/services/tenant-service";

import { PendingInvitationHandler } from "./pending-invitation-handler";

export async function WorkspaceContent() {
    const supabase = await createClientfactory()
    const { data } = await supabase.auth.getUser()
    const isOwner = data.user ? await TenantService.isOwner(data.user.id) : false;

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4 space-y-12">
            <PendingInvitationHandler />
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Workspaces</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Welcome back, {data.user?.user_metadata?.name || 'User'}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Manage your workspaces, accept invitations, or create a new team environment effectively.
                </p>
            </div>
            <div className="grid gap-8">
                <Suspense fallback={<InvitationSkeleton />}>
                    {data.user?.email && <InvitationList userEmail={data.user?.email} />}
                </Suspense>

                <Suspense fallback={<TenantSkeleton />}>
                    {data.user?.id && <TenantList userId={data.user?.id} />}
                </Suspense>
            </div>
            {isOwner}
            {/* The Refactored Onboarding Trigger */}
            {!isOwner && (
                <section className="mt-8 border-t pt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <Card className="border-dashed border-2 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto rounded-full bg-primary/10 p-3 mb-2 w-fit">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Need a new workspace?</CardTitle>
                            <CardDescription className="text-base max-w-md mx-auto">
                                Get started quickly with your organization's domain or set up a custom workspace manually.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 pb-8">
                            <AutoSetupButton />
                            <span className="text-muted-foreground text-sm font-medium">or</span>
                            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                                <Link href="/tenants">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create manually
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    )
}
