"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { UserPermissionsSchema } from "@/lib/dtos/permissions.dto";
import { getPermissionsFormConfig } from "@/config/permissions-form-config";
import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";
import { getMemberPermissionsAction, updateMemberPermissionsAction } from "@/app/(main)/dashboard/hr/actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface UpdatePermissionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeName: string;
    email: string;
    enabledModules: string[];
}

export function UpdatePermissionsDialog({
    open,
    onOpenChange,
    employeeName,
    email,
    enabledModules
}: UpdatePermissionsDialogProps) {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchPermissions();
        }
    }, [open, email]);

    async function fetchPermissions() {
        setIsLoading(true);
        try {
            const result = await getMemberPermissionsAction(email);
            if (result.success) {
                setPermissions(result.permissions || []);
            } else {
                toast.error(result.error || "Failed to fetch permissions");
            }
        } catch {
            toast.error("An unexpected error occurred while fetching permissions.");
        } finally {
            setIsLoading(false);
        }
    }

    const fields = getPermissionsFormConfig(enabledModules).map(field => {
        if (field.name === "email") {
            return { ...field, defaultValue: email, disabled: true };
        }
        if (field.name === "permissions") {
            return { ...field, defaultValue: permissions };
        }
        return field;
    });

    async function handleUpdatePermissions(data: z.infer<typeof UserPermissionsSchema>) {
        // Ensure email is included even if field is disabled
        const submissionData = { ...data, email };
        const result = await updateMemberPermissionsAction(submissionData);

        if (result.success) {
            toast.success(result.message);
            onOpenChange(false);
        } else {
            toast.error(result.error);
        }
        return result;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Manage Permissions: {employeeName}</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading permissions...</p>
                    </div>
                ) : (
                    <DynamicForm
                        key={`${email}-${permissions.join(',')}`} // Force re-render when permissions are fetched
                        schema={UserPermissionsSchema}
                        fields={fields}
                        onSubmit={handleUpdatePermissions}
                        buttonText="Update Permissions"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto px-1"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
