export const MODULE_PERMISSIONS = {
    HR: [
        // Employee Management
        { key: "hr.employees.view", label: "View Employees", description: "Can see the employee directory" },
        { key: "hr.employees.manage", label: "Manage Employees", description: "Can create and edit employee records" },
        { key: "hr.employees.delete", label: "Delete Employees", description: "Can permanently remove employee records" },

        // Payroll & Financials
        { key: "hr.payroll.view", label: "View Salary", description: "Can see sensitive compensation data" },
        { key: "hr.payroll.manage", label: "Manage Payroll", description: "Can edit salaries and bonuses" },

        // Time & Attendance
        { key: "hr.leave.view", label: "View Leave", description: "Can see the team leave calendar" },
        { key: "hr.leave.approve", label: "Approve Leave", description: "Can approve or reject time-off requests" },
    ],

    ECOMMERCE: [
        { key: "ecommerce.products.manage", label: "Manage Products" },
        { key: "ecommerce.orders.view", label: "View Orders" },
    ],
    CRM: [
        { key: "crm.leads.manage", label: "Manage Leads" },
    ]
} as const;