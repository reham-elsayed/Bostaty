"use client";

import { Button } from "@/components/ui/button";
import { seedEmployeesAction } from "@/app/(main)/dashboard/actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { Sprout } from "lucide-react";

export function SeedEmployeesButton() {
    const [isPending, startTransition] = useTransition();

    const handleSeed = () => {
        startTransition(async () => {
            try {
                const result = await seedEmployeesAction();

                if (result.error) {
                    toast.error(result.error);
                    return;
                }

                if (result.success) {
                    toast.success(result.message);
                }
            } catch {
                toast.error("Something went wrong. Please try again.");
            }
        });
    };

    return (
        <Button
            size="sm"
            variant="outline"
            className="gap-2 bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400"
            onClick={handleSeed}
            disabled={isPending}
        >
            <Sprout className="w-4 h-4" />
            {isPending ? "Seeding..." : "Seed Employees"}
        </Button>
    );
}
