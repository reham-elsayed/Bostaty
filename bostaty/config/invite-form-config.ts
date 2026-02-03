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

    // 2. Permission field with dynamic options
    const permissionOptions = enabledModules.flatMap((mod) => {
        const moduleKey = mod as keyof typeof MODULE_PERMISSIONS;
        return MODULE_PERMISSIONS[moduleKey]?.map(p => ({
            label: `${mod}: ${p.label}`,
            value: p.key
        })) || [];
    });
    console.log(permissionOptions);
    if (permissionOptions.length > 0) {
        fields.push({
            name: "permissions",
            label: "Granular Permissions",
            type: "multi-select",
            options: permissionOptions
        });
    }
    console.log(fields);
    return fields;
}