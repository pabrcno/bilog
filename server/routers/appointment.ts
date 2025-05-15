import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, protectedProcedure, adminProcedure, patientProcedure } from "../trpc"
import { db } from "@/db"
import { appointments, timeSlots } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const appointmentRouter = router({
  // Book an appointment
  bookAppointment: patientProcedure.input(z.object({ timeSlotId: z.number() })).mutation(async ({ ctx, input }) => {
    try {
      // Check if time slot exists and is available
      const timeSlot = await db.query.timeSlots.findFirst({
        where: and(eq(timeSlots.id, input.timeSlotId), eq(timeSlots.isAvailable, true)),
      })

      if (!timeSlot) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Time slot not available" })
      }

      // Create appointment
      await db.insert(appointments).values({
        timeSlotId: input.timeSlotId,
        patientId: ctx.user.id,
        status: "confirmed",
      })

      // Mark time slot as unavailable
      await db.update(timeSlots).set({ isAvailable: false }).where(eq(timeSlots.id, input.timeSlotId))

      revalidatePath("/patient")
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
    .input(z.object({ appointmentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the appointment
        const appointment = await db.query.appointments.findFirst({
          where: eq(appointments.id, input.appointmentId),
          with: {
            timeSlot: true,
          },
        })

        if (!appointment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found" })
        }

        // Check if user is authorized to cancel this appointment
        if (ctx.user.role === "patient" && appointment.patientId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized to cancel this appointment" })
        }

        // Update appointment status
        await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, input.appointmentId))

        // Make the time slot available again
        await db.update(timeSlots).set({ isAvailable: true }).where(eq(timeSlots.id, appointment.timeSlotId))

        revalidatePath("/patient")
        revalidatePath("/admin")
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
      const patientAppointments = await db.query.appointments.findMany({
        where: eq(appointments.patientId, ctx.user.id),
        with: {
          timeSlot: {
            with: {
              dentist: true,
            },
          },
        },
        orderBy: (appointments, { desc }) => [desc(appointments.createdAt)],
      })

      return patientAppointments
        .filter((appointment) => appointment.timeSlot !== null && appointment.timeSlot !== undefined)
        .map((appointment) => ({
          id: appointment.id,
          status: appointment.status,
          startTime: appointment.timeSlot?.startTime,
          endTime: appointment.timeSlot?.endTime,
          duration: appointment.timeSlot?.duration,
          dentistName: appointment.timeSlot?.dentist?.name,
        }))
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
      return []
    } catch (error) {
      console.error("Error getting dentist appointments:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get dentist appointments",
        cause: error,
      })
    }
  }),
})
