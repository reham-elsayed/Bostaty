import { headers } from "next/headers"
import { createClient } from "../supabase/server"

export async function getAuth() {
    const h = await headers()
    const tenantId = h.get("x-tenant-id")
    if (!tenantId) {
        throw new Error("Tenant ID not found")
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not found")
    }
    return { tenantId, userId: user.id }
}