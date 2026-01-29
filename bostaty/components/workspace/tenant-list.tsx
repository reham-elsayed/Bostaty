import { TenantService } from "@/lib/services/tenant-service";
import { TenantListClient } from "./TenantListClient";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface TenantListProps {
    userId: string;
}

export async function TenantList({ userId }: TenantListProps) {
    const tenants = await TenantService.getUserTenants(userId);

    if (!tenants || tenants.length === 0) {
        return (
            <div className="space-y-4 mb-8">
                <h3 className="text-lg font-medium">Your Workspaces</h3>
                <Card className="border-dashed py-8">
                    <CardHeader className="text-center">
                        <div className="mx-auto rounded-full bg-muted p-3 mb-2 w-fit">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg">No workspaces found</CardTitle>
                        <CardDescription>
                            You are not a member of any workspaces yet. Create one to get started!
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Your Workspaces</h3>
            <TenantListClient userId={userId} tenants={tenants as any} />
        </div>
    );
}
