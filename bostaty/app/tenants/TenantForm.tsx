// app/components/tenant/create-tenant-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"

const createTenantSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    subdomain: z.string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Invalid subdomain format"),
})

type CreateTenantFormData = z.infer<typeof createTenantSchema>

export function CreateTenantForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors } } = useForm<CreateTenantFormData>({
        resolver: zodResolver(createTenantSchema),
    })

    const onSubmit = async (data: CreateTenantFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/tenant/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create tenant")
            }

            const tenant = await response.json()
            // Redirect to the new tenant's dashboard
            router.push(`/${tenant.slug}/dashboard`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create New Workspace</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Workspace Name</label>
                        <Input
                            {...register("name")}
                            placeholder="Acme Inc."
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Slug</label>
                        <Input
                            {...register("slug")}
                            placeholder="acme-inc"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Used in URLs: /acme-inc/settings
                        </p>
                        {errors.slug && (
                            <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Subdomain</label>
                        <div className="flex items-center">
                            <Input
                                {...register("subdomain")}
                                placeholder="acme"
                                className="rounded-r-none"
                            />
                            <span className="border border-l-0 px-3 py-2 bg-gray-50 text-gray-500">
                                .yourapp.com
                            </span>
                        </div>
                        {errors.subdomain && (
                            <p className="text-sm text-red-500 mt-1">{errors.subdomain.message}</p>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Creating..." : "Create Workspace"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default CreateTenantForm