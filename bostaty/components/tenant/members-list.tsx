"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Member {
    id: string
    user_id: string
    role: string
    profile: {
        email: string
        full_name?: string
    }
}

interface MembersListProps {
    tenantId: string
}

export function MembersList({ tenantId }: MembersListProps) {
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchMembers() {
            // Note: This assumes you have a way to fetch members joined with profiles
            // For now, we'll mock or try to fetch from an API route if it exists
            // Or use direct supabase query if RLS allows
            
            // Temporary mock for display until API is ready
            // In a real app, fetch from /api/tenants/${tenantId}/members
            setLoading(false)
        }
        fetchMembers()
    }, [tenantId, supabase])

    if (loading) {
        return <div className="text-sm text-gray-500">Loading members...</div>
    }

    // Returning Empty state to prevent errors if no data
    if (members.length === 0) {
         return <div className="text-sm text-gray-500">No members found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map((member) => (
                    <TableRow key={member.id}>
                        <TableCell className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{member.profile.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{member.profile.full_name || 'User'}</span>
                                <span className="text-xs text-gray-500">{member.profile.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                                {member.role}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-gray-500">Active</span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
