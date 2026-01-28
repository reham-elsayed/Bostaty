import { TenantService } from "@/lib/services/tenant-service";
type getTenantDataProps = {
    tenantId: string;
    id: string;
}
export async function getTenantData(tenantId: string, id: string) {
    const tenant = await TenantService.getTenantContext(tenantId, id);
    return tenant;
}