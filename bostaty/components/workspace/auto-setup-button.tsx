"use client";

import { Button } from "@/components/ui/button";
import { createAutoTenant } from "@/lib/actions/tenant-actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function AutoSetupButton() {
    const [isPending, startTransition] = useTransition();

    const handleAutoSetup = () => {
        startTransition(async () => {
            try {
                const result = await createAutoTenant();

                if (result.error) {
                    toast.error(result.error);
                    return;
                }

                if (result.success) {
                    toast.success("Workspace created successfully!");
                    // The server action calls revalidatePath, 
                    // and if not redirecting there, we might want to refresh manually or just wait.
                    // The server action revalidates /workspace, so the list should update.
                }
            } catch (error) {
                toast.error("Something went wrong. Please try again.");
            }
        });
    };

    return (
        <Button
            size="lg"
            className="w-full sm:w-auto font-medium shadow-lg hover:shadow-primary/20 transition-all"
            onClick={handleAutoSetup}
            disabled={isPending}
        >
            {isPending ? "Setting up..." : "Use my work email to auto-setup"}
        </Button>
    );
}
