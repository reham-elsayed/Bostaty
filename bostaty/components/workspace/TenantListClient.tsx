"use client";

import { getSelectedTenant } from "@/app/(main)/workspace/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Building2 } from "lucide-react";
import { Tenant } from "@/types/TenantTypes";
import { useState } from "react";


interface TenantListClientProps {
    tenants: Tenant[];
}

export function TenantListClient({ tenants }: TenantListClientProps) {
    const [isSelecting, setIsSelecting] = useState<string | null>(null);

    async function handleTenantSelection(tenant: Tenant) {
        setIsSelecting(tenant.id);
        try {
            await getSelectedTenant(tenant);
        } finally {
            setIsSelecting(null);
        }
    }

    return (
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
                        <Button
                            onClick={() => handleTenantSelection(tenant)}
                            className="w-full group-hover:bg-primary/90"
                            variant="secondary"
                            disabled={!!isSelecting}
                        >
                            {isSelecting === tenant.id ? "Launching..." : "Launch Workspace"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
