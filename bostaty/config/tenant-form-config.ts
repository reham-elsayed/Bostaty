import { FormFieldConfig } from "@/types/form";

export const getTenantFormConfig = (): FormFieldConfig[] => [
    {
        name: "name",
        label: "Workspace Name",
        type: "text",
        placeholder: "Acme Inc.",
    },
    {
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "acme-inc",
        description: "Used in URLs: /acme-inc/settings",
    },
    {
        name: "subdomain",
        label: "Subdomain",
        type: "text",
        placeholder: "acme",
        suffix: ".yourapp.com",
    },
];
