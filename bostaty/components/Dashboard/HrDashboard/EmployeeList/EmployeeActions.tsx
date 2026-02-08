"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, ShieldCheck, MailPlus, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UpdatePermissionsDialog } from "../UpdatePermissionsDialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteEmployeeAction } from "@/app/dashboard/hr/actions";
import { toast } from "sonner";

interface EmployeeActionsProps {
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        isMember: boolean;
    };
    enabledModules: string[];
}

export function EmployeeActions({ employee, enabledModules }: EmployeeActionsProps) {
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleInvite = () => {
        toast.info(`Invitation feature for ${employee.email} coming soon!`);
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteEmployeeAction(employee.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Employee deleted successfully");
                setIsDeleteAlertOpen(false);
            }
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {employee.isMember ? (
                        <DropdownMenuItem
                            onClick={() => setIsPermissionsOpen(true)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            <span>Manage Permissions</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={handleInvite}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <MailPlus className="h-4 w-4 text-emerald-500" />
                            <span>Invite to Application</span>
                        </DropdownMenuItem>
                    )
                    }

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => toast.info("Edit employee details coming soon")}
                        className="cursor-pointer"
                    >
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsDeleteAlertOpen(true)}
                        className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Employee</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <UpdatePermissionsDialog
                open={isPermissionsOpen}
                onOpenChange={setIsPermissionsOpen}
                employeeName={`${employee.firstName} ${employee.lastName}`}
                email={employee.email}
                enabledModules={enabledModules}
            />

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            <span className="font-medium text-foreground"> {employee.firstName} {employee.lastName}</span>
                            's employee record.
                            {employee.isMember && (
                                <span className="block mt-2 text-destructive font-medium">
                                    This will also remove their access to the application.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete Employee"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
