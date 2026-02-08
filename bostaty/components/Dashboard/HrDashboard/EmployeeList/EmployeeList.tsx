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
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeForm } from "../EmployeeForm";
import { EmployeeActions } from "./EmployeeActions";
import { TenantService } from "@/lib/services/tenant-service";
import { getAuth } from "@/lib/auth/getTenantId";

export async function EmployeeList() {
    const employees = await HrServices.getEmployees();

    // Get tenant info for the dialog
    const { tenantId, userId } = await getAuth()
    const tenant = await TenantService.getTenantContext(tenantId, userId);
    const enabledModules = tenant?.enabledModules || [];

    // Check if any employee has salary data
    const hasSalaryData = employees.some(employee => employee.salary !== null);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Employee Directory</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your organization's members and their access.</p>
                </div>
                <EmployeeForm />
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="py-4 px-6 w-[300px]">Employee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                {hasSalaryData && <TableHead className="text-right">Salary</TableHead>}
                                <TableHead className="w-[80px] text-right px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={hasSalaryData ? 6 : 5} className="h-32 text-center text-muted-foreground">
                                        No employees found in the directory.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
                                    <TableRow key={employee.id} className="group hover:bg-muted/20 transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border shadow-sm">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                        {getInitials(employee.firstName, employee.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {employee.firstName} {employee.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground md:hidden mt-0.5">
                                                        {employee.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                className={`capitalize px-2 py-0 h-5 text-[10px] font-bold ${employee.status === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                                                    : ''
                                                    }`}
                                            >
                                                {employee.status.toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-foreground">Employee</span>
                                                {employee.isMember && (
                                                    <span className="text-[10px] text-blue-500 font-medium uppercase tracking-wider">App User</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                            {employee.email}
                                        </TableCell>
                                        {hasSalaryData && (
                                            <TableCell className="text-right font-mono text-sm">
                                                {employee.salary !== null ? `$${employee.salary.toLocaleString()}` : '-'}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right px-6">
                                            <EmployeeActions
                                                employee={employee}
                                                enabledModules={enabledModules}
                                            />
                                        </TableCell>
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