import { FormFieldConfig } from "@/types/form";

export function getEmployeeFormConfig(canManageSalary: boolean): FormFieldConfig[] {
    const fields: FormFieldConfig[] = [
        { name: "firstName", label: "First Name", type: "text", placeholder: "John" },
        { name: "lastName", label: "Last Name", type: "text", placeholder: "Doe" },
        { name: "email", label: "Email", type: "email", placeholder: "john.doe@company.com" },
        { name: "position", label: "Position", type: "text", placeholder: "Senior Developer" },
        { name: "department", label: "Department", type: "text", placeholder: "Engineering" },
    ];

    // Only add the salary field if the user is authorized
    if (canManageSalary) {
        fields.push({
            name: "salary",
            label: "Annual Salary",
            type: "number",
            placeholder: "e.g. 75000"
        });
    }

    return fields;
}