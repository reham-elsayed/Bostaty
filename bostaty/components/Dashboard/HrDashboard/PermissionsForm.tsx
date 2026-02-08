
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { getPermissionsFormConfig } from "@/config/permissions-form-config";
import { UserPermissionsSchema } from "@/lib/dtos/permissions.dto";
import { useTenant } from "@/providers/TenantContext";
import { createEmployeeAction } from "@/app/dashboard/hr/actions";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";

export function PermissionsForm() {
    const { enabledModules } = useTenant()
    const [open, setOpen] = useState(false);

    const fields = getPermissionsFormConfig(enabledModules)

    const handleCreateEmployee = async (data: any) => {
        const result = await createEmployeeAction(data);
        if (result?.success) {
            setOpen(false);
        }
        return result;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <DynamicForm
                    schema={UserPermissionsSchema}
                    fields={fields}
                    onSubmit={handleCreateEmployee}
                    buttonText="Create Employee"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh]  px-1"
                />
            </DialogContent>
        </Dialog>
    )
}