"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    members?: { role: string }[];
}

interface TenantListProps {
    tenants: any[];
}

export function TenantList({ tenants }: TenantListProps) {
    if (!tenants || tenants.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Your Workspaces</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenants.map((tenant) => (
                    <Card key={tenant.id} className="group relative overflow-hidden transition-all hover:shadow-md border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <span>{tenant.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Role: <span className="font-medium text-foreground capitalize">{tenant.members?.[0]?.role?.toLowerCase() || 'Member'}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {tenant.subdomain}.bostaty.com
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full group-hover:bg-primary/90" variant="secondary">
                                <Link href={`/dashboard/${tenant.id}`}>
                                    Launch Workspace <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
