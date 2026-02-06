import { HrServices } from "@/lib/services/hr-services";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { EmployeeForm } from "../EmployeeForm";

export async function EmployeeList() {
    const employees = await HrServices.getEmployees();

    // Check if any employee has salary data (to determine if salary column should be shown)
    const hasSalaryData = employees.some(employee => employee.salary !== null);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Directory</h1>
                <EmployeeForm />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Employee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Role</TableHead> {/* Placeholder for potential future field, keeping layout balanced */}
                                <TableHead>Email</TableHead>
                                {hasSalaryData && <TableHead className="text-right">Salary</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={hasSalaryData ? 5 : 4} className="h-24 text-center">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>{getInitials(employee.firstName, employee.lastName)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {employee.firstName} {employee.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground md:hidden">
                                                        {employee.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                className="capitalize"
                                            >
                                                {employee.status.toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">-</TableCell> {/* Placeholder */}
                                        <TableCell className="text-muted-foreground hidden md:table-cell">
                                            {employee.email}
                                        </TableCell>
                                        {hasSalaryData && (
                                            <TableCell className="text-right font-medium">
                                                {employee.salary !== null ? `$${employee.salary.toLocaleString()}` : '-'}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}