import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, adminProcedure, publicProcedure } from "../trpc"
import { db } from "@/db"
import { timeSlots } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Define specialties for dentists (in a real app, this would be in the database)
const DENTIST_SPECIALTIES: Record<number, string> = {
  1: "General Dentist",
  2: "Orthodontist",
  3: "Pediatric Dentist",
  4: "Periodontist",
  5: "Endodontist",
}

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

        await db.insert(timeSlots).values({
          dentistId: ctx.user.id,
          startTime,
          endTime,
          duration: input.duration,
          isAvailable: true,
        })

        revalidatePath("/admin")
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
          dentist: true,
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

      revalidatePath("/admin")
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
