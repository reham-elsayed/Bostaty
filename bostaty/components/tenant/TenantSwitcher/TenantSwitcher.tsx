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
        // For subdomain approach:
        // window.location.href = `https://${tenant.subdomain}.yourapp.com/dashboard`
        // For path approach:
        router.push(`/${tenant.slug}/dashboard`)
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