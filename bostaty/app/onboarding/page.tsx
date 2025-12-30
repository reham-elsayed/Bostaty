// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { TenantService } from "@/lib/services/tenant-service";

async function OnboardingLogic() {
  const supabase = await createClient();

  // 1. Get user from Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // 2. Run the onboarding service
  const result = await TenantService.handleUserOnboarding(user.id, user.email!);

  // 3. Handle the result
  if (result.type === 'PERSONAL_FLOW') {
    // If they are a Gmail user, they need to manually name their tenant
    redirect("/tenants");
  }

  // If it's a business email, the tenant was created/found
  // result.tenant is now guaranteed to exist here
  redirect(`/dashboard`);
}

export default async function OnboardingPage() {

  await OnboardingLogic()
  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-accent/50 text-sm p-4 rounded-lg text-foreground flex gap-3 items-center border">
          <InfoIcon size="20" className="text-blue-500" />
          <p>Setting up your workspace. Please wait a moment...</p>
        </div>

        {/* We use Suspense to show a loading state while the DB logic runs */}
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Initializing your agency profile...</p>
          </div>
        }>

        </Suspense>
      </div>
    </div>
  );
}