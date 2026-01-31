'use client'

import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";
import { updateTenantSettings } from "@/app/dashboard/actions";
import { appearanceSchema, fields } from "@/config/settings/AppearanceSettings";
import { useTenant } from "@/providers/TenantProvider";


export function AppearanceSettings() {
    const { tenantId } = useTenant()
    console.log(tenantId, "tenantId from form")
    async function handleUpdateTheme(data: any) {
        return await updateTenantSettings(tenantId as string, data);
    }
    return (
        <DynamicForm
            schema={appearanceSchema}
            fields={fields}
            onSubmit={handleUpdateTheme}
            buttonText="Update Theme"
        />
    );
}