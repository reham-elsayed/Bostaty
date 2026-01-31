import { headers } from "next/headers";
import { TenantService } from "../services/tenant-service";
import TenantProvider from "../../providers/TenantProvider";

export async function TenantWrapper({ children }: { children: React.ReactNode }) {
    const h = await headers();
    const rawTenantId = h.get("x-tenant-id");

    let tenantData = null;
    if (rawTenantId) {
        tenantData = await TenantService.getTenantMetaData(rawTenantId);
    }

    const tenantContextValue = {
        tenantId: rawTenantId,
        settings: tenantData?.settings || {},
        enabledModules: tenantData?.enabledModules || [],
    };



    return (
        <TenantProvider initialValue= { tenantContextValue } >
        { children }
        </TenantProvider>
    );
}