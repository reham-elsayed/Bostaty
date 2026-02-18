import { StatCard } from "@/components/Dashboard/HrDashboard/StatCard";
import { HrServices } from "@/lib/services/hr-services";
import { UserCheck } from "lucide-react";
export async function ActiveMembers() {

    const employees = await HrServices.getEmployees();
    return (
        <div>
            <StatCard label="Active Members" value={employees.length.toString()} icon={UserCheck} colorClass="bg-blue-500/10 text-blue-500" />
        </div>
    );
}