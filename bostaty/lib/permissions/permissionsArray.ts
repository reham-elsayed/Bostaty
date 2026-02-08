import { MODULE_PERMISSIONS } from "@/config/permissions";
import { FormFieldConfig } from "@/types/form";

export function permissionsArray(enabledModules: string[]) {
    const permissionOptions = enabledModules.flatMap((mod) => {
        const moduleKey = mod as keyof typeof MODULE_PERMISSIONS;
        return MODULE_PERMISSIONS[moduleKey]?.map(p => ({
            label: `${mod}: ${p.label}`,
            value: p.key
        })) || [];
    });
    return permissionOptions;
}

export function getPermissionFields(enabledModules: string[]) {
    const fields: FormFieldConfig[] = [];
    const permissionOptions = permissionsArray(enabledModules)
    if (permissionOptions.length > 0) {
        fields.push({
            name: "permissions",
            label: "Granular Permissions",
            type: "multi-select",
            options: permissionOptions
        });
    }
    return fields;
}