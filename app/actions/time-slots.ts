"use server"

import { db } from "@/db"
import { timeSlots } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { requireAdmin, getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Create a new time slot
export async function createTimeSlot(formData: FormData) {
  try {
    await requireAdmin()
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const startTime = new Date(formData.get("startTime") as string)
    const duration = Number.parseInt(formData.get("duration") as string)

    // Calculate end time based on duration
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    await db.insert(timeSlots).values({
      dentistId: user.id,
      startTime,
      endTime,
      duration,
      isAvailable: true,
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error creating time slot:", error)
    return { error: "Failed to create time slot" }
  }
}

// Get time slots for a specific date
export async function getTimeSlotsForDate(date: Date) {
  try {
    // Create start and end of the selected date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
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

    return slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      dentistName: slot.dentist.name,
      dentistId: slot.dentistId,
    }))
  } catch (error) {
    console.error("Error getting time slots:", error)
    return []
  }
}

// Delete a time slot
export async function deleteTimeSlot(id: number) {
  try {
    await requireAdmin()

    await db.delete(timeSlots).where(eq(timeSlots.id, id))

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting time slot:", error)
    return { error: "Failed to delete time slot" }
  }
}

// Get all time slots for the current dentist
export async function getDentistTimeSlots() {
  try {
    await requireAdmin()
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    const slots = await db.query.timeSlots.findMany({
      where: eq(timeSlots.dentistId, user.id),
      orderBy: (timeSlots, { desc }) => [desc(timeSlots.startTime)],
    })

    return slots
  } catch (error) {
    console.error("Error getting dentist time slots:", error)
    return []
  }
}
