"use client";

import { useEffect, useState } from "react";
import { inviteMemberSchema, InviteMemberDTO } from "@/lib/dtos/invitation.dto";
import { inviteMemberAction } from "@/lib/actions/tenant-actions";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/TenantContext";
import { getInviteFormConfig } from "@/config/invite-form-config";
import { FormFieldConfig } from "@/types/form";
import { DynamicForm } from "../DynamicFormField/DynamicFormField";

interface InviteMemberModalProps {
    tenantId: string;
    inviterId: string;
}

export function InviteMemberModal({ tenantId, inviterId }: InviteMemberModalProps) {
    const [open, setOpen] = useState(false);
    const { enabledModules } = useTenant()



    const formFields = getInviteFormConfig(enabledModules)


    async function onSubmit(data: InviteMemberDTO) {

        const result = await inviteMemberAction(tenantId, inviterId, data);
        if (result?.error) {
            throw new Error(result.error);
        }
        return result
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Send Invite
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <DynamicForm onSubmit={onSubmit} schema={inviteMemberSchema} fields={formFields} buttonText="send invite" />
            </DialogContent>
        </Dialog>
    );
}
