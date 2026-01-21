export type TenantState = {
    error?: string;
    tenant?: {
        id: string;
        slug: string;
        // other fields as needed
    } | null;
}