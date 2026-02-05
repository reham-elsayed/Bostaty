"use client";

import { useState } from "react";
import { getEmployeeFormConfig } from "@/config/employee-form-config";
import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";
import { EmployeeDto, employeeSchema } from "@/lib/dtos/employee.dto";
import { createEmployeeAction } from "@/app/dashboard/actions";
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
    const { permissions } = useTenant();
    const canManageSalary = permissions.includes('hr.employees.manage_salary');
    const [open, setOpen] = useState(false);
    const fields = getEmployeeFormConfig(canManageSalary);

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <DynamicForm
                    schema={employeeSchema}
                    fields={fields}
                    onSubmit={handleCreateEmployee}
                    buttonText="Create Employee"
                />
            </DialogContent>
        </Dialog>
    );
}