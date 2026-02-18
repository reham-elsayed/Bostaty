import { StatCard } from "@/components/Dashboard/HrDashboard/StatCard";
import { HrServices } from "@/lib/services/hr-services";
import { Users } from "lucide-react";
export async function TotalEmpoluee() {

    const employees = await HrServices.getEmployees();
    return (
        <div>
            <StatCard label="Total Employees" value={employees.length.toString()} icon={Users} colorClass="bg-blue-500/10 text-blue-500" />
        </div>
    );
}