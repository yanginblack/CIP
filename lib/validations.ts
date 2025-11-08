import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Appointment schemas
export const nameSearchSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(80, "Last name too long"),
});

export type NameSearchInput = z.infer<typeof nameSearchSchema>;

export const createAppointmentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(80, "Last name too long"),
  startUtc: z.string().datetime().transform((val) => new Date(val)),
  staff: z.string().trim().min(1, "Staff name is required").max(80, "Staff name too long"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().trim().min(1, "First name is required").max(80, "First name too long").optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(80, "Last name too long").optional(),
  startUtc: z.string().datetime().transform((val) => new Date(val)).optional(),
  staff: z.string().trim().min(1, "Staff name is required").max(80, "Staff name too long").optional(),
  notes: z.string().max(500, "Notes too long").optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

// Admin appointment query schema
export const adminAppointmentQuerySchema = z.object({
  q: z.string().optional(),
  staff: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type AdminAppointmentQuery = z.infer<typeof adminAppointmentQuerySchema>;
