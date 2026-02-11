"use client";

import { useTenant } from "@/providers/TenantContext";
import { updateTenantModules } from "@/app/(main)/dashboard/actions";
import { DynamicForm } from "../DynamicFormField/DynamicFormField";
import { z } from "zod";
import { FormFieldConfig } from "@/types/form";

const modulesSchema = z.object({
    HR: z.boolean(),
    ECOMMERCE: z.boolean(),
    CRM: z.boolean(),
});

export function PlanSettingsForm() {
    const { tenantId, enabledModules } = useTenant();

    const fields: FormFieldConfig[] = [
        {
            name: "HR",
            label: "HR & Employee Management",
            type: "checkbox",
            defaultValue: enabledModules.includes("HR"),
        },
        {
            name: "ECOMMERCE",
            label: "E-commerce & Store Front",
            type: "checkbox",
            defaultValue: enabledModules.includes("ECOMMERCE"),
        },
        {
            name: "CRM",
            label: "CRM & Customer Management",
            type: "checkbox",
            defaultValue: enabledModules.includes("CRM"),
        },
    ];

    const handleSubmit = async (data: any) => {
        if (!tenantId) return { error: "No tenant context" };

        const newModules = Object.entries(data)
            .filter(([_, enabled]) => enabled)
            .map(([name]) => name);

        // Always include CORE if it's missing (though it shouldn't be in the form)
        if (!newModules.includes("CORE")) {
            newModules.push("CORE");
        }

        return updateTenantModules(newModules);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Available Modules</h3>
                <p className="text-sm text-muted-foreground">
                    Enable or disable features for your organization. Changes take effect immediately.
                </p>
            </div>

            <div className="max-w-xl">
                <DynamicForm
                    schema={modulesSchema}
                    fields={fields}
                    onSubmit={handleSubmit}
                    buttonText="Update Plan"
                />
            </div>
        </div>
    );
}
