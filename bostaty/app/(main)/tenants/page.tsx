// app/tenants/page.tsx
import { Suspense } from 'react';
import { CreateTenantForm } from './TenantForm';

export default function TenantsPage() {
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-4">Tenants</h1>
            <Suspense fallback={<p>Loading...</p>}>
                <CreateTenantForm />
            </Suspense>
        </main>
    );
}