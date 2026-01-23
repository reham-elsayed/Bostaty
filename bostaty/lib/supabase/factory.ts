import { createClient as createBrowserClient } from "./client";
import { createClient as createServerClient } from "./server";

export async function createClientfactory() {
    if (typeof window === "undefined") {
        return await createServerClient()
    }
    else {
        return createBrowserClient()
    }
}
