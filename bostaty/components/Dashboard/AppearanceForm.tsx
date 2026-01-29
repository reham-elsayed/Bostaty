import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";
import { z } from "zod";
import { updateTenantSettings } from "@/app/dashboard/actions";

const appearanceSchema = z.object({
    companyName: z.string().min(2, "Name too short"),
    primaryColor: z.string().regex(/^#/, "Must be a hex color"),
});

const fields = [
    { name: "companyName", label: "Company Name", type: "text", placeholder: "Acme Corp" },
    { name: "primaryColor", label: "Brand Color", type: "color" },
];

export function AppearanceSettings({ tenantId }: { tenantId: string }) {
    return (
        <DynamicForm
            schema={appearanceSchema}
            fields={fields}
            onSubmit={async (data) => {
                await updateTenantSettings(tenantId, data);
            }}
            buttonText="Update Theme"
        />
    );
}