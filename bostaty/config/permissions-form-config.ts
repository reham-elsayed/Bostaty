import { getPermissionFields } from "@/lib/permissions/permissionsArray";
import { FormFieldConfig } from "@/types/form";

export function getPermissionsFormConfig(enabledModules: string[]): FormFieldConfig[] {
    const fields: FormFieldConfig[] = [
        { name: "email", label: "Email", type: "email", placeholder: "colleague@company.com" },

    ];

    const permissionsFields = getPermissionFields(enabledModules)
    if (permissionsFields.length > 0) {
        fields.push(...permissionsFields);
    }
    console.log(fields)
    return fields;
}