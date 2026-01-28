import { TenantWrapper as TenantContext } from "@/components/tenant/TenantContext";
import { redirect } from "next/navigation";

export default async function HeadersWrapper({
    children,
}: {
    children: React.ReactNode;
}) {



    return <>{children}</>;
}
