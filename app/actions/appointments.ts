"use server"

import { db } from "@/db"
import { appointments, timeSlots, type AppointmentView } from "@/db/schema"
import { eq, and, gte, asc } from "drizzle-orm"
import { getCurrentUser, requirePatient, requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Book an appointment
export async function bookAppointment(timeSlotId: number) {
  try {
    await requirePatient()
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Check if time slot exists and is available
    const timeSlot = await db.query.timeSlots.findFirst({
      where: and(eq(timeSlots.id, timeSlotId), eq(timeSlots.isAvailable, true)),
    })

    if (!timeSlot) {
      return { error: "Time slot not available" }
    }

    // Create appointment
    await db.insert(appointments).values({
      timeSlotId,
      patientId: user.id,
      status: "confirmed",
    })

    // Mark time slot as unavailable
    await db.update(timeSlots).set({ isAvailable: false }).where(eq(timeSlots.id, timeSlotId))

    revalidatePath("/patient")
    return { success: true }
  } catch (error) {
    console.error("Error booking appointment:", error)
    return { error: "Failed to book appointment" }
  }
}

// Cancel an appointment
export async function cancelAppointment(appointmentId: number) {
  try {
    const session = await getCurrentUser()

    if (!session) {
      return { error: "Unauthorized" }
    }

    // Get the appointment
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        timeSlot: true,
      },
    })

    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Check if user is authorized to cancel this appointment
    if (session.role === "patient" && appointment.patientId !== session.id) {
      return { error: "Unauthorized" }
    }

    // Update appointment status
    await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, appointmentId))

    // Make the time slot available again
    await db.update(timeSlots).set({ isAvailable: true }).where(eq(timeSlots.id, appointment.timeSlot.id))

    revalidatePath("/patient")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return { error: "Failed to cancel appointment" }
  }
}

// Get patient appointments
export async function getPatientAppointments(): Promise<AppointmentView[]> {
  try {
    await requirePatient()
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    const patientAppointments = await db.query.appointments.findMany({
      where: eq(appointments.patientId, user.id),
      with: {
        timeSlot: {
          with: {
            dentist: true,
          },
        },
      },
      orderBy: (appointments, { desc }) => [desc(appointments.createdAt)],
    })

    return patientAppointments.map((appointment) => ({
      id: appointment.id,
      status: appointment.status,
      timeSlot: {
        id: appointment.timeSlot.id,
        startTime: appointment.timeSlot.startTime,
        endTime: appointment.timeSlot.endTime,
        duration: appointment.timeSlot.duration,
        dentist: {
          id: appointment.timeSlot.dentist.id,
          name: appointment.timeSlot.dentist.name,
        },
      },
    }))
  } catch (error) {
    console.error("Error getting patient appointments:", error)
    return []
  }
}

// Get dentist appointments
export async function getDentistAppointments(): Promise<AppointmentView[]> {
  try {
    await requireAdmin()
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dentistAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.status, "confirmed"),
        // Only appointments for this dentist
        eq(timeSlots.dentistId, user.id),
        // Only future appointments
        gte(timeSlots.startTime, today)
      ),
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

    return dentistAppointments.map((appointment) => ({
      id: appointment.id,
      status: appointment.status,
      timeSlot: {
        id: appointment.timeSlot.id,
        startTime: appointment.timeSlot.startTime,
        endTime: appointment.timeSlot.endTime,
        duration: appointment.timeSlot.duration,
        dentist: {
          id: appointment.timeSlot.dentist.id,
          name: appointment.timeSlot.dentist.name,
        },
      },
      patient: {
        name: appointment.patient.name,
        email: appointment.patient.email,
      },
    }))
  } catch (error) {
    console.error("Error getting dentist appointments:", error)
    return []
  }
}
