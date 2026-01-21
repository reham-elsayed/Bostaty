import { getTenantContext } from "@/lib/auth/getTenantContext";
import { redirect } from "next/navigation";

export default async function HeadersWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { tenantId } = await getTenantContext();

    if (!tenantId) {
        redirect("/tenants");
    }

    return <>{children}</>;
}
