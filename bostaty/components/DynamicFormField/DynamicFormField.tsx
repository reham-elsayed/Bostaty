"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { FormFieldConfig } from "@/types/form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import MultipleSelector, { Option } from "../ui/multi-select";

interface DynamicFormProps {
    schema: z.ZodObject<any>;
    fields: FormFieldConfig[];
    onSubmit: (data: any) => Promise<any>;
    buttonText?: string;
    className?: string;
}

export function DynamicForm({ schema, fields, onSubmit, buttonText = "Submit", className }: DynamicFormProps) {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.defaultValue ?? (
                field.type === "checkbox" ? false :
                    field.type === "multi-select" ? [] :
                        ""
            ),
        }), {} as any),
    });

    const handleFormSubmit = async (data: any) => {
        console.log(data)
        try {
            toast.promise(onSubmit(data), {
                loading: "Saving...",
                success: (data: any) => {
                    if (data?.error) throw new Error(data.error);
                    form.reset();
                    return data?.message || "Changes saved successfully";
                },
                error: (err) => err.message || "An unexpected error occurred",
            });

        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className={cn("space-y-4", className)}>
                    {fields.map((field) => (
                        <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                                <FormItem className={`${field.type === "checkbox" ? "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" : ""} ${["textarea", "multi-select"].includes(field.type) ? "md:col-span-2" : ""}`}>
                                    {field.type !== "checkbox" && <FormLabel className="text-sm font-medium">{field.label}</FormLabel>}
                                    <FormControl>
                                        {(() => {
                                            switch (field.type) {
                                                case "text":
                                                case "email":
                                                    return (
                                                        <div className="flex items-center">
                                                            <Input
                                                                type={field.inputType || (field.type === "email" ? "email" : "text")}
                                                                placeholder={field.placeholder}
                                                                {...formField}
                                                                value={(formField.value as string) ?? ""}
                                                                className={field.suffix ? "rounded-r-none" : ""}
                                                            />
                                                            {field.suffix && (
                                                                <span className="border border-l-0 px-3 py-2 bg-gray-50 text-gray-500 rounded-r-md text-sm">
                                                                    {field.suffix}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                case "textarea":
                                                    return <Textarea
                                                        placeholder={field.placeholder}
                                                        {...formField}
                                                        value={(formField.value as string) ?? ""}
                                                    />;
                                                case "select":
                                                    return (
                                                        <Select onValueChange={formField.onChange} defaultValue={formField.value as string}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={field.placeholder || "Select option"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {field.options?.map(opt => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    );
                                                case "multi-select":
                                                    return (
                                                        <MultipleSelector
                                                            onChange={(options) => formField.onChange(options.map(o => o.value))}
                                                            value={field.options?.filter(opt =>
                                                                (formField.value as string[] || [])?.includes(opt.value)
                                                            ) || []}
                                                            commandProps={{
                                                                label: field.label
                                                            }}
                                                            options={field.options}
                                                            placeholder={field.placeholder}
                                                            disabled={form.formState.isSubmitting}
                                                            emptyIndicator={<p className='text-center text-sm'>No results found</p>}
                                                            className='w-full'
                                                        />
                                                    );
                                                case "checkbox":
                                                    return (
                                                        <>
                                                            <Checkbox
                                                                checked={formField.value as boolean}
                                                                onCheckedChange={formField.onChange}
                                                            />
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel className="text-sm font-medium">
                                                                    {field.label}
                                                                </FormLabel>
                                                            </div>
                                                        </>
                                                    );
                                                case "color":
                                                    return (
                                                        <div className="flex gap-3 items-center">
                                                            <Input
                                                                type="color"
                                                                {...formField}
                                                                value={(formField.value as string) ?? ""}
                                                                className="h-10 w-20 p-1 cursor-pointer"
                                                            />
                                                            <span className="text-sm font-mono text-muted-foreground uppercase">{formField.value as string}</span>
                                                        </div>
                                                    );
                                                case "number":
                                                    return <Input
                                                        type="number"
                                                        placeholder={field.placeholder}
                                                        {...formField}
                                                        value={(formField.value as string) ?? ""}
                                                        onChange={(e) => {
                                                            const val = e.target.valueAsNumber;
                                                            formField.onChange(isNaN(val) ? undefined : val);
                                                        }}
                                                    />;
                                                default:
                                                    return null;
                                            }
                                        })()}
                                    </FormControl>
                                    {field.description && <FormDescription>{field.description}</FormDescription>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full md:w-auto font-medium"
                >
                    {form.formState.isSubmitting ? "Saving..." : buttonText}
                </Button>
            </form>
        </Form>
    );
}
