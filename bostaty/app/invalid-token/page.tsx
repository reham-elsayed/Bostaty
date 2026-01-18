import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InvalidTokenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Invalid or Expired Invitation</h1>
            <p className="text-muted-foreground max-w-md">
                The invitation token you used is invalid, expired, or has already been used.
                Please ask the workspace owner to send you a new invitation.
            </p>
            <Button asChild variant="outline">
                <Link href="/">Go to Home</Link>
            </Button>
        </div>
    );
}
