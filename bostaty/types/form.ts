import { HTMLInputTypeAttribute } from "react";

export interface FormFieldConfig {
    name: string; // Must match the key in your Zod schema
    label: string;
    description?: string;
    placeholder?: string;
    type: "text" | "select" | "checkbox" | "textarea" | "color" | "email" | "multi-select" | "number";
    inputType?: HTMLInputTypeAttribute; // for text, password, email, etc.
    options?: { label: string; value: string }[]; // For selects
    defaultValue?: any;
    suffix?: React.ReactNode;
    requiredPermission?: string;
}