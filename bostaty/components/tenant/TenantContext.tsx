import { headers } from "next/headers";
import { TenantService } from "../../lib/services/tenant-service";
import TenantProvider from "@/providers/TenantProvider"; // Import the client provider

export async function TenantContext({ children }: { children: React.ReactNode }) {
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

    const primaryColor = (tenantContextValue.settings as any)?.theme?.primaryColor || '#000';

    return (
        <TenantProvider initialValue={tenantContextValue}>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                  --primary-color: ${primaryColor};
                }
              `}
            }
            />
            {children}
        </TenantProvider>
    );
}
