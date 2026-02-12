import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  category: z.enum([
    "Service Quality",
    "Billing",
    "Product",
    "Delivery",
    "Staff",
    "Facility",
    "Safety",
    "Other",
  ]),
  priority: z.enum(["Low", "Medium", "High"]),
});

export const UpdateComplaintStatusSchema = z.object({
  status: z.enum(["Pending", "In Progress", "Resolved", "Rejected"]),
});

export const AddAdminNotesSchema = z.object({
  adminNotes: z.string().min(1, "Notes required").max(1000, "Notes too long"),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type ComplaintFormData = z.infer<typeof ComplaintSchema>;
export type UpdateComplaintStatusData = z.infer<typeof UpdateComplaintStatusSchema>;
export type AddAdminNotesData = z.infer<typeof AddAdminNotesSchema>;
