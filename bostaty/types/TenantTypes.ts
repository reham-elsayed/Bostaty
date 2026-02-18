export interface Tenant {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    members?: { role: string }[];
}

export type TenantState = {
    error?: string;
    tenant?: Tenant | null;
}
