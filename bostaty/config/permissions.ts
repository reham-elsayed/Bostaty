export const MODULE_PERMISSIONS = {
    HR: [
        { key: "hr.employees.view", label: "View Employees" },
        { key: "hr.employees.edit", label: "Edit Employees" },
        { key: "hr.schedule.manage", label: "Manage Schedule" },
    ],
    ECOMMERCE: [
        { key: "ecommerce.products.manage", label: "Manage Products" },
        { key: "ecommerce.orders.view", label: "View Orders" },
    ],
    CRM: [
        { key: "crm.leads.manage", label: "Manage Leads" },
    ]
} as const;

