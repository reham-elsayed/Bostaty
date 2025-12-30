// app/components/tenant/tenant-switcher.tsx
"use client"

import { useEffect, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface Tenant {
    id: string
    name: string
    slug: string
    subdomain: string
    members: { role: string }[]
}

export function TenantSwitcher() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchTenants()
    }, [])

    const fetchTenants = async () => {
        try {
            const response = await fetch("/tenant")
            if (response.ok) {
                const data = await response.json()
                setTenants(data)
                // Set first tenant as current, or get from localStorage
                const savedTenantId = localStorage.getItem("currentTenantId")
                const tenant = data.find((t: Tenant) => t.id === savedTenantId) || data[0]
                setCurrentTenant(tenant)
            }
        } catch (error) {
            console.error("Failed to fetch tenants:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const switchTenant = (tenant: Tenant) => {
        setCurrentTenant(tenant)
        localStorage.setItem("currentTenantId", tenant.id)

        // Set cookies for middleware to read
        document.cookie = `x-tenant-id=${tenant.id}; path=/; max-age=31536000; SameSite=Lax`;
        document.cookie = `x-tenant-slug=${tenant.slug}; path=/; max-age=31536000; SameSite=Lax`;

        // For subdomains, we need to redirect to the full URL
        const hostname = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        // If we are on localhost/IP, we might want to just stay on /dashboard and use cookies
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
            window.location.href = "/dashboard";
            return;
        }

        // Otherwise, use subdomain-based redirection
        const newUrl = `${protocol}//${tenant.subdomain}.${hostname.replace(/^(.*?)\./, '')}${port ? `:${port}` : ''}/dashboard`;
        window.location.href = newUrl;
    }

    if (isLoading) return <Button variant="ghost" disabled>Loading...</Button>

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between">
                    {currentTenant?.name || "Select Workspace"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                {tenants.map((tenant) => (
                    <DropdownMenuItem
                        key={tenant.id}
                        onClick={() => switchTenant(tenant)}
                        className="cursor-pointer"
                    >
                        <div className="flex flex-col">
                            <span>{tenant.name}</span>
                            <span className="text-xs text-gray-500">
                                {tenant.members[0]?.role.toLowerCase()}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                    onClick={() => router.push("/create-tenant")}
                    className="cursor-pointer border-t pt-2"
                >
                    + Create New Workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}