import { getPermissionFields, permissionsArray } from "@/lib/permissions/permissionsArray";
import { MODULE_PERMISSIONS } from "./permissions";
import { FormFieldConfig } from "@/types/form";

export function getInviteFormConfig(enabledModules: string[]): FormFieldConfig[] {
    // 1.  core fields
    const fields: FormFieldConfig[] = [
        { name: "email", label: "Email", type: "email", placeholder: "colleague@company.com" },
        {
            name: "role",
            label: "Role",
            type: "select",
            options: [
                { label: "Admin", value: "ADMIN" },
                { label: "Member", value: "MEMBER" }
            ]
        },
    ];

    const permissionsFields = getPermissionFields(enabledModules)
    if (permissionsFields.length > 0) {
        fields.push(...permissionsFields);
    }
    return fields;
}