"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormFieldConfig } from "@/types/form";

interface DynamicFormProps {
    schema: z.ZodObject<any>;
    fields: FormFieldConfig[];
    onSubmit: (data: any) => Promise<void>;
    buttonText?: string;
}

export function DynamicForm({ schema, fields, onSubmit, buttonText = "Submit" }: DynamicFormProps) {
    const methods = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.defaultValue || "",
        }), {} as any),
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{field.label}</label>

                        {/* The "Factory" Switch */}
                        {field.type === "text" && (
                            <input
                                type={field.inputType || "text"}
                                {...methods.register(field.name)}
                                className="border p-2 rounded"
                                placeholder={field.placeholder}
                            />
                        )}

                        {field.type === "select" && (
                            <select {...methods.register(field.name)} className="border p-2 rounded">
                                {field.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                        {field.type === "color" && (
                            <input type="color" {...methods.register(field.name)} className="h-10 w-20" />
                        )}

                        {/* Error Message */}
                        {methods.formState.errors[field.name] && (
                            <span className="text-red-500 text-xs">
                                {methods.formState.errors[field.name]?.message as string}
                            </span>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={methods.formState.isSubmitting}
                    className="bg-primary text-white p-2 rounded disabled:opacity-50"
                >
                    {methods.formState.isSubmitting ? "Processing..." : buttonText}
                </button>
            </form>
        </FormProvider>
    );
}