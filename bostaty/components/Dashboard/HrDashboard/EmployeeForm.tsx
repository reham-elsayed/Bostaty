"use client";

import { useState } from "react";
import { getEmployeeFormConfig } from "@/config/employee-form-config";
import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";
import { EmployeeDto, employeeSchema } from "@/lib/dtos/employee.dto";
import { createEmployeeAction } from "@/app/(main)/dashboard/hr/actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTenant } from "@/providers/TenantContext";


export function EmployeeForm() {
    const { permissions, role } = useTenant();
    const [open, setOpen] = useState(false);

    const can = (permission: string) => {
        if (role === 'OWNER' || role === 'ADMIN') return true;
        return permissions?.includes(permission) ?? false;
    };

    const fields = getEmployeeFormConfig(can);

    async function handleCreateEmployee(data: EmployeeDto) {
        const result = await createEmployeeAction(data);
        if (result?.error) {
            toast.error(result.error);
            return;
        }

        toast.success("Employee created successfully");
        setOpen(false);
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
                    schema={employeeSchema}
                    fields={fields}
                    onSubmit={handleCreateEmployee}
                    buttonText="Create Employee"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto px-1"
                />
            </DialogContent>
        </Dialog>
    );
}