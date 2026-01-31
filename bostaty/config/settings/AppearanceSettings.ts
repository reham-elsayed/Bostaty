import { FormFieldConfig } from "@/types/form";
import z from "zod";
import { THEME_REGISTRY } from "../themes";

export const appearanceSchema = z.object({
    companyName: z.string().min(2, "Name too short"),
    theme: z.enum(THEME_REGISTRY.map((theme) => theme.id) as [string, ...string[]]),
    currency: z.enum(["USD", "EGP", "EUR"]),
    timezone: z.enum(["Africa/Cairo", "UTC"]),
});

export const fields: FormFieldConfig[] = [
    { name: "companyName", label: "Company Display Name", type: "text", placeholder: "Acme Corp" },
    { name: "theme", label: "Brand theme", type: "select", options: THEME_REGISTRY.map((theme) => ({ label: theme.label, value: theme.id })) },
    {
        name: "currency", label: "Default Currency", type: "select", options: [
            { label: "USD ($)", value: "USD" },
            { label: "EGP (LE)", value: "EGP" },
            { label: "EUR (€)", value: "EUR" }
        ]
    },
    {
        name: "timezone", label: "Business Timezone", type: "select", options: [
            { label: "Cairo (GMT+2)", value: "Africa/Cairo" },
            { label: "UTC", value: "UTC" }
        ]
    },
];
