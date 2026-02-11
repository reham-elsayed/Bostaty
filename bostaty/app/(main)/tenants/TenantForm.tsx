// app/components/tenant/create-tenant-form.tsx
"use client"

import { DynamicForm } from "@/components/DynamicFormField/DynamicFormField"
import { getTenantFormConfig } from "@/config/tenant-form-config"
import { CreateTenantFormData, createTenantSchema } from "@/lib/dtos/create-tenant-form.dto"
import { useRouter } from "next/navigation"

export function CreateTenantForm() {
    const router = useRouter()

    const handleCreateTenant = async (data: CreateTenantFormData) => {
        const response = await fetch("/tenant/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Failed to create tenant")
        }

        router.push(`/workspace`)
        return { message: "Workspace created successfully" }
    }

    return (
        <div className="w-full max-w-lg mx-auto p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Create New Workspace
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Start by naming your new workspace correctly
                </p>
            </div>

            <DynamicForm
                schema={createTenantSchema}
                fields={getTenantFormConfig()}
                onSubmit={handleCreateTenant}
                buttonText="Create Workspace"
                className="space-y-6"
            />
        </div>
    )
}

export default CreateTenantForm