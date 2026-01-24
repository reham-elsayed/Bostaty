import { WorkspaceContent } from "@/components/workspace/workspace-content";
import { Suspense } from "react";

export default function WorkspacesPage() {
    return (
        <Suspense fallback={<div className="container max-w-5xl mx-auto py-12 px-4 space-y-12">
            <div className="space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-10 w-64 bg-muted rounded" />
                <div className="h-6 w-96 bg-muted rounded" />
            </div>
        </div>}>
            <WorkspaceContent />
        </Suspense>
    )
}

