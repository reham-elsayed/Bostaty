'use client'

import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField";
import { updateTenantSettings } from "@/app/dashboard/actions";
import { appearanceSchema, fields } from "@/config/settings/AppearanceSettings";
import { useTenant } from "@/providers/TenantContext";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";


export function AppearanceSettings() {
    const [open, setOpen] = useState(false)
    const { tenantId } = useTenant()
    console.log(tenantId, "tenantId from form")
    async function handleUpdateTheme(data: any) {
        return await updateTenantSettings(data);
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    Update Theme
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <DynamicForm
                    schema={appearanceSchema}
                    fields={fields}
                    onSubmit={handleUpdateTheme}
                    buttonText="Update Theme"
                />                    </DialogContent>
        </Dialog>

    );
}