import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, protectedProcedure, adminProcedure, patientProcedure } from "../trpc"
import { db } from "@/db"
import { appointments, timeSlots } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export const appointmentRouter = router({
  // Book an appointment
  bookAppointment: patientProcedure.input(z.object({ timeSlotId: z.number() })).mutation(async ({ ctx, input }) => {
    try {
      // Use a transaction to ensure both operations succeed or fail together
      await db.transaction(async (tx) => {
        // Check if time slot exists and is available
        const timeSlot = await tx.query.timeSlots.findFirst({
          where: and(eq(timeSlots.id, input.timeSlotId), eq(timeSlots.isAvailable, true)),
        })

        if (!timeSlot) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Time slot not available" })
        }

        // Create appointment and mark time slot as unavailable in parallel
        await Promise.all([
          tx.insert(appointments).values({
            timeSlotId: input.timeSlotId,
            patientId: ctx.user.id,
            status: "pending",
          }),
          tx.update(timeSlots).set({ isAvailable: false }).where(eq(timeSlots.id, input.timeSlotId)),
        ])
      })

      return { success: true }
    } catch (error) {
      console.error("Error booking appointment:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to book appointment",
        cause: error,
      })
    }
  }),

  // Cancel an appointment
  cancelAppointment: protectedProcedure
    .input(z.object({ appointmentId: z.number(), timeSlotId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Use a transaction to ensure both updates succeed or fail together
        await db.transaction(async (tx) => {
          // Update appointment status and mark time slot as available in parallel
          await Promise.all([
            tx.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, input.appointmentId)),
            tx.update(timeSlots).set({ isAvailable: true }).where(eq(timeSlots.id, input.timeSlotId)),
          ])
        })

        return { success: true }
      } catch (error) {
        console.error("Error cancelling appointment:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel appointment",
          cause: error,
        })
      }
    }),

  // Get patient appointments
  getPatientAppointments: patientProcedure.query(async ({ ctx }) => {
    try {
      // Only fetch appointments that have a valid timeSlot and dentist using SQL join conditions
      const patientAppointments = await db.query.appointments.findMany({
        where: eq(appointments.patientId, ctx.user.id),
        with: {
          timeSlot: {
            with: {
              dentist: true,
            },
          },
          patient: true,
        },
        orderBy: (appointments, { desc }) => [desc(appointments.createdAt)],
      })

      // Return the full appointment objects (with patient, timeSlot, and dentist info)
      return patientAppointments
    } catch (error) {
      console.error("Error getting patient appointments:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get patient appointments",
        cause: error,
      })
    }
  }),

  // Get dentist appointments
  getDentistAppointments: adminProcedure.query(async ({ ctx }) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // First, get all appointments with status "confirmed"
      const dentistAppointments = await db.query.appointments.findMany({
        where: eq(appointments.status, "confirmed"),
        with: {
          timeSlot: {
            with: {
              dentist: true,
            },
          },
          patient: true,
        },
        orderBy: (appointments, { asc }) => [asc(appointments.createdAt)],
      })

      // Filter to only those where the timeSlot belongs to this dentist and is in the future
      return dentistAppointments
    } catch (error) {
      console.error("Error getting dentist appointments:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get dentist appointments",
        cause: error,
      })
    }
  }),

  // Confirm an appointment
  confirmAppointment: adminProcedure
    .input(z.object({ appointmentId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        // Check if appointment exists and is not cancelled
        const appointment = await db.query.appointments.findFirst({
          where: eq(appointments.id, input.appointmentId),
        })
        if (!appointment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found" })
        }
        if (appointment.status === "cancelled") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot confirm a cancelled appointment" })
        }
        // Update status to confirmed
        await db.update(appointments)
          .set({ status: "confirmed" })
          .where(eq(appointments.id, input.appointmentId))
        return { success: true }
      } catch (error) {
        console.error("Error confirming appointment:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm appointment",
          cause: error,
        })
      }
    }),
})
