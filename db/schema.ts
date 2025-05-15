import { pgTable, serial, varchar, timestamp, boolean, integer, text } from "drizzle-orm/pg-core"
import { relations, InferModel } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

// Database Schemas

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("patient"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  dentistId: integer("dentist_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  timeSlotId: integer("time_slot_id")
    .notNull()
    .references(() => timeSlots.id, { onDelete: "cascade" }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  timeSlots: many(timeSlots),
  appointments: many(appointments),
}))

export const timeSlotsRelations = relations(timeSlots, ({ one, many }) => ({
  dentist: one(users, {
    fields: [timeSlots.dentistId],
    references: [users.id],
  }),
  appointments: many(appointments),
}))

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  timeSlot: one(timeSlots, {
    fields: [appointments.timeSlotId],
    references: [timeSlots.id],
  }),
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
  }),
}))

// Database Types

// Base types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type TimeSlot = typeof timeSlots.$inferSelect
export type NewTimeSlot = typeof timeSlots.$inferInsert

export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
// Types with relations
export type TimeSlotWithRelations = TimeSlot & {
  dentist: User
  appointments?: Appointment[]
}

export type AppointmentWithRelations = Appointment & {
  timeSlot: TimeSlot & {
    dentist: User
  }
  patient: User
}

// View types (for API responses)
export type UserView = Pick<User, "id" | "name" | "email">

export type TimeSlotView = Pick<TimeSlot, "id" | "startTime" | "endTime" | "duration"> & {
  dentist: Pick<User, "id" | "name">
}

export type AppointmentView = Pick<Appointment, "id" | "status"> & {
  timeSlot: TimeSlotView
  patient?: Pick<User, "name" | "email">
}

// Form Validation Schemas

// Base user schema without password confirmation
export const baseUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "patient"]),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

// Register schema with password confirmation
export const registerSchema = baseUserSchema
  .extend({
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "patient"]),
})

// Form Types
export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>

// Time slot form schema
export const timeSlotFormSchema = z.object({
  startTime: z.string().datetime(),
  duration: z.number().min(5).max(120),
})

export type TimeSlotFormValues = z.infer<typeof timeSlotFormSchema>

// Appointment form schema
export const appointmentFormSchema = z.object({
  timeSlotId: z.number(),
  notes: z.string().optional(),
})

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema> 