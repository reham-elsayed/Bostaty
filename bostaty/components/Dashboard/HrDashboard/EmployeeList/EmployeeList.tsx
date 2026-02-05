import { hrServices } from "@/lib/services/hr-services";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export async function EmployeeList() {
    const employees = await hrServices.getEmployees();

    // Check if any employee has salary data (to determine if salary column should be shown)
    const hasSalaryData = employees.some(employee => employee.salary !== null);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Employee List</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>Email</TableHead>
                            {hasSalaryData && <TableHead className="text-right">Salary</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={hasSalaryData ? 4 : 3} className="text-center text-muted-foreground">
                                    No employees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.firstName}</TableCell>
                                    <TableCell>{employee.lastName}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    {hasSalaryData && (
                                        <TableCell className="text-right">
                                            {employee.salary !== null ? `$${employee.salary.toLocaleString()}` : '-'}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}