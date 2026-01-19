import { InvitationList } from "@/components/invitation-list";
import { TenantList } from "@/components/tenant-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoSetupButton } from "@/components/workspace/auto-setup-button";
import { InvitationService } from "@/lib/services/invitation-services";
import { TenantService } from "@/lib/services/tenant-service";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, PlusCircle, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function WorkspacesPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()

    const invites = await InvitationService.getUserInvitations(data.user?.email as string);
    const tenants = await TenantService.getUserTenants(data.user?.id as string);

    return (

        <div className="container max-w-5xl mx-auto py-12 px-4 space-y-12">

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Workspaces</span>
                </div>
                <Suspense>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Welcome back, {data.user?.user_metadata?.name || 'User'}
                    </h1>
                </Suspense>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Manage your workspaces, accept invitations, or create a new team environment effectively.
                </p>
            </div>
            <Suspense>
                <div className="grid gap-8">
                    {invites.length > 0 && (
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-semibold">Pending Invitations</h2>
                            </div>
                            <InvitationList invites={invites} />
                        </section>
                    )}

                    {tenants.length > 0 && (
                        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <TenantList tenants={tenants} />
                        </section>
                    )}
                </div>
            </Suspense>
            {/* The Refactored Onboarding Trigger */}
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
                            <Link href="/tenant">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create manually
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>

    )
}
