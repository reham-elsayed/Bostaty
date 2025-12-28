// app/(tenantSlug)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TenantSwitcher } from "@/components/tenant/TenantSwitcher/TenantSwitcher"
import { MembersList } from "@/components/tenant/members-list"
import { SettingsDialog } from "@/components/tenant/settings-dialog"
import { InviteMemberDialog } from "@/components/tenant/invite-member-dialog"
import {
    Users,
    Settings,
    Calendar,
    FileText,
    BarChart3,
    Shield,
    PlusCircle,
    Globe
} from "lucide-react"
import { cookies } from "next/headers"

// Dynamic route segment - tells Next.js this page depends on the tenantSlug

interface DashboardPageProps {
    params: {
        tenantSlug: string
    }
}

export default async function TenantDashboardPage({ params }: { params: Promise<DashboardPageProps['params']> }) {
    const { tenantSlug } = await params
    const cookieStore = await cookies();

    // 2. Convert to string
    const cookieString = cookieStore.toString();


    // 1. Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Get tenant details and verify membership
    const tenantResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/tenant/${tenantSlug}`,
        {
            headers: {
                Cookie: cookieString
            },
            cache: 'no-store' // Don't cache tenant data
        }
    )

    if (!tenantResponse.ok) {
        redirect('/tenants') // Tenant not found or no access
    }

    const tenant = await tenantResponse.json()

    // 3. Get tenant stats (you'd create this API route)
    const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/tenant/${tenant.id}/stats`,
        {
            headers: {
                Cookie: cookieString
            },
            next: { revalidate: 60 } // Revalidate every 60 seconds
        }
    )

    const stats = statsResponse.ok ? await statsResponse.json() : {
        totalMembers: 0,
        activeProjects: 0,
        storageUsed: '0 MB',
        recentActivity: []
    }

    // 4. Get user's role in this tenant
    const roleResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/tenant/${tenant.id}/members/${user.id}`,
        {
            headers: {
                Cookie: cookieString
            }
        }
    )

    const userRole = roleResponse.ok ? (await roleResponse.json()).role : 'MEMBER'
    const isAdmin = ['OWNER', 'ADMIN'].includes(userRole)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{tenant.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Globe className="h-3 w-3" />
                                    <span>{tenant.subdomain}.{process.env.NEXT_PUBLIC_APP_DOMAIN}</span>
                                    <Badge variant={tenant.plan === 'pro' ? 'default' : 'secondary'}>
                                        {tenant.plan.toUpperCase()} PLAN
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <TenantSwitcher />
                            <SettingsDialog tenant={tenant} userRole={userRole} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Welcome & Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome back, {user.email?.split('@')[0]}! 👋
                    </h2>
                    <p className="text-gray-600">
                        You&apos;re managing <span className="font-semibold">{tenant.name}</span> as{' '}
                        <Badge variant={userRole === 'OWNER' ? 'default' : 'secondary'}>
                            {userRole}
                        </Badge>
                    </p>

                    {isAdmin && (
                        <div className="flex gap-3 mt-6">
                            <InviteMemberDialog tenant={tenant} />
                            <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Project
                            </Button>
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                Configure Workspace
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMembers}</div>
                            <p className="text-xs text-gray-500">+2 from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <FileText className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeProjects}</div>
                            <p className="text-xs text-gray-500">3 in progress</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.storageUsed}</div>
                            <p className="text-xs text-gray-500">of 10 GB used</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                            <Calendar className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-gray-500">Next: Team meeting tomorrow</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Members & Activity */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Team Members Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Team Members</CardTitle>
                                        <CardDescription>
                                            Manage who has access to this workspace
                                        </CardDescription>
                                    </div>
                                    {isAdmin && <InviteMemberDialog tenant={tenant} />}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <MembersList tenantId={tenant.id} />
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    What&apos;s happening in your workspace
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.recentActivity?.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recentActivity.map((activity: any, index: number) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                                <div>
                                                    <p className="text-sm">{activity.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(activity.timestamp).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No recent activity. Get started by inviting team members!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Quick Access & Permissions */}
                    <div className="space-y-8">
                        {/* Quick Access */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Access</CardTitle>
                                <CardDescription>Shortcuts to common actions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Create Document
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule Meeting
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Analytics
                                </Button>
                                {isAdmin && (
                                    <Button variant="outline" className="w-full justify-start">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Manage Permissions
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Your Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Permissions</CardTitle>
                                <CardDescription>What you can do in this workspace</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {userRole === 'OWNER' && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Manage billing</span>
                                                <Badge variant="default">Yes</Badge>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Delete workspace</span>
                                                <Badge variant="default">Yes</Badge>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Invite members</span>
                                        <Badge variant={isAdmin ? 'default' : 'secondary'}>
                                            {isAdmin ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Create projects</span>
                                        <Badge variant="default">Yes</Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Access all files</span>
                                        <Badge variant="default">Yes</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Workspace Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Workspace Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium">Plan</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500">{tenant.plan.toUpperCase()}</p>
                                        {isAdmin && (
                                            <Button variant="link" size="sm" className="h-auto p-0">
                                                Upgrade
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium">Workspace URL</p>
                                    <p className="text-sm text-gray-500">
                                        {tenant.subdomain}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}