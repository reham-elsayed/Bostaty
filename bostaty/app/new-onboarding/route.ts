// app/auth/callback/route.ts (or your protected landing page)
import { createClient } from "@/lib/supabase/server";
import { TenantService } from "@/lib/services/tenant-service";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const supabase = await createClient();

    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // 2. Run your auto-tenant logic
        const result = await TenantService.handleUserOnboarding(user.id, user.email!);

        // 3. Decide where to send them based on the result
        if (result.type === 'PERSONAL_FLOW') {
            redirect('/onboarding/setup-name'); // Gmail users choose a name
        } else {
            redirect(`/dashboard`); // Agency users go to their dashboard
        }
    }
}