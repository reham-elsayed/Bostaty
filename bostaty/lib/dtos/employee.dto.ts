import z from "zod";

export const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    position: z.string().min(1, "Position is required"),
    department: z.string().min(1, "Department is required"),
    salary: z.number().positive("Salary must be positive").optional(),
});

export type EmployeeDto = z.infer<typeof employeeSchema>;