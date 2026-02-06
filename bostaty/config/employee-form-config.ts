import { FormFieldConfig } from "@/types/form";
import { MODULE_PERMISSIONS } from "./permissions";

export function getEmployeeFormConfig(can: (permission: string) => boolean): FormFieldConfig[] {
    const fields: FormFieldConfig[] = [
        { name: "firstName", label: "First Name", type: "text", placeholder: "John" },
        { name: "lastName", label: "Last Name", type: "text", placeholder: "Doe" },
        { name: "email", label: "Email", type: "email", placeholder: "john.doe@company.com" },
        { name: "position", label: "Position", type: "text", placeholder: "Senior Developer" },
        { name: "department", label: "Department", type: "text", placeholder: "Engineering" },
        {
            name: "salary",
            label: "Annual Salary",
            type: "number",
            requiredPermission: "hr.payroll.manage" // Logic is now data-driven
        }, {
            name: "bonusStructure",
            label: "Bonus Tier",
            type: "select",
            options: [
                { label: "Standard", value: "standard" },
                { label: "Performance", value: "performance" },
                { label: "Executive", value: "executive" }
            ],
            requiredPermission: "hr.payroll.manage"
        }
    ];

    const filteredFields = fields.filter(field => {
        if (field.requiredPermission) {
            return can(field.requiredPermission)
        }
        return true
    })

    return filteredFields;
}