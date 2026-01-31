"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormFieldConfig } from "@/types/form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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

interface DynamicFormProps {
    schema: z.ZodObject<any>;
    fields: FormFieldConfig[];
    onSubmit: (data: any) => Promise<any>;
    buttonText?: string;
}

export function DynamicForm({ schema, fields, onSubmit, buttonText = "Submit" }: DynamicFormProps) {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.defaultValue ?? (field.type === "checkbox" ? false : ""),
        }), {} as any),
    });

    const handleFormSubmit = async (data: any) => {
        console.log(data)
        try {
            toast.promise(onSubmit(data), {
                loading: "Saving...",
                success: (data: any) => {
                    if (data?.error) throw new Error(data.error);
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
                {fields.map((field) => (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.type === "checkbox" ? "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" : ""}>
                                {field.type !== "checkbox" && <FormLabel className="text-sm font-medium">{field.label}</FormLabel>}
                                <FormControl>
                                    {(() => {
                                        switch (field.type) {
                                            case "text":
                                                return <Input
                                                    type={field.inputType || "text"}
                                                    placeholder={field.placeholder}
                                                    {...formField}
                                                    value={(formField.value as string) ?? ""}
                                                />;
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
                                            default:
                                                return null;
                                        }
                                    })()}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}

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
