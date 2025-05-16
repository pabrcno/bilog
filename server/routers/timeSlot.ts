import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, adminProcedure, publicProcedure } from "../trpc"
import { db } from "@/db"
import { timeSlots } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"


export const timeSlotRouter = router({
  // Create a new time slot
  createTimeSlot: adminProcedure
    .input(
      z.object({
        startTime: z.string().datetime(),
        duration: z.number().min(5).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const startTime = new Date(input.startTime)

        // Calculate end time based on duration
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + input.duration)

        // Check for collision: another slot for this dentist that overlaps
        const overlappingSlot = await db.query.timeSlots.findFirst({
          where: and(
            // Same dentist
            eq(timeSlots.dentistId, ctx.user.id),
            // Overlap condition: (startA < endB) && (endA > startB)
            gte(timeSlots.endTime, startTime),
            lte(timeSlots.startTime, endTime)
          ),
        })

        if (overlappingSlot) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A time slot already exists that overlaps with the selected time.",
          })
        }

        await db.insert(timeSlots).values({
          dentistId: ctx.user.id,
          startTime,
          endTime,
          duration: input.duration,
          isAvailable: true,
        })

        return { success: true }
      } catch (error) {
        console.error("Error creating time slot:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create time slot",
          cause: error,
        })
      }
    }),

  // Get time slots for a specific date
  getTimeSlotsForDate: publicProcedure.input(z.object({ date: z.date() })).query(async ({ input }) => {
    try {
      // Create start and end of the selected date
      const startOfDay = new Date(input.date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(input.date)
      endOfDay.setHours(23, 59, 59, 999)

      const slots = await db.query.timeSlots.findMany({
        where: and(
          gte(timeSlots.startTime, startOfDay),
          lte(timeSlots.startTime, endOfDay),
          eq(timeSlots.isAvailable, true),
        ),
        with: {
          dentist: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: (timeSlots, { asc }) => [asc(timeSlots.startTime)],
      })

      return slots
    } catch (error) {
      console.error("Error getting time slots:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get time slots",
        cause: error,
      })
    }
  }),

  // Delete a time slot
  deleteTimeSlot: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    try {
      await db.delete(timeSlots).where(eq(timeSlots.id, input.id))

     
      return { success: true }
    } catch (error) {
      console.error("Error deleting time slot:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete time slot",
        cause: error,
      })
    }
  }),

  // Get all time slots for the current dentist
  getDentistTimeSlots: adminProcedure.query(async ({ ctx }) => {
    try {
      const slots = await db.query.timeSlots.findMany({
        where: eq(timeSlots.dentistId, ctx.user.id),
        orderBy: (timeSlots, { desc }) => [desc(timeSlots.startTime)],
      })

      return slots
    } catch (error) {
      console.error("Error getting dentist time slots:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get dentist time slots",
        cause: error,
      })
    }
  }),
})
