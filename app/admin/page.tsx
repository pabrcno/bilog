"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, User } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { Section } from "@/components/section"
import { AppointmentList } from "@/components/appointment-list"
import { TimeSlotList } from "@/components/time-slot-list"
import { AddTimeSlotForm } from "@/components/add-time-slot-form"
import { showSuccess, showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"

export default function AdminPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
  const [userName, setUserName] = useState("Dr. Sarah Wilson")

  // tRPC queries and mutations
  const { data: currentUser } = trpc.auth.getCurrentUser.useQuery()
  const { data: appointments, isLoading: isLoadingAppointments } = trpc.appointment.getDentistAppointments.useQuery()
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = trpc.timeSlot.getTimeSlotsForDate.useQuery({
    date: date || new Date(),
  })

  const deleteTimeSlotMutation = trpc.timeSlot.deleteTimeSlot.useMutation({
    onSuccess: () => {
      showSuccess("Time slot deleted successfully")
      // Refetch time slots
      utils.timeSlot.getTimeSlotsForDate.invalidate({ date: date || new Date() })
    },
    onError: (error) => {
      showError(error.message || "Failed to delete time slot")
    },
  })

  const cancelAppointmentMutation = trpc.appointment.cancelAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment cancelled successfully")
      // Refetch appointments
      utils.appointment.getDentistAppointments.invalidate()
    },
    onError: (error) => {
      showError(error.message || "Failed to cancel appointment")
    },
  })

  const utils = trpc.useUtils()

  // Update user name when current user data is available
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name)
    }
  }, [currentUser])

  // Filter appointments for the selected date
  const filteredAppointments =
    appointments?.filter(
      (appointment) =>
        date &&
        new Date(appointment.startTime).getDate() === date.getDate() &&
        new Date(appointment.startTime).getMonth() === date.getMonth() &&
        new Date(appointment.startTime).getFullYear() === date.getFullYear(),
    ) || []

  // Handle time slot form success
  const handleTimeSlotSuccess = () => {
    setIsAddSlotOpen(false)
    showSuccess("Time slot added successfully")
    // Refetch time slots
    utils.timeSlot.getTimeSlotsForDate.invalidate({ date: date || new Date() })
  }

  // Delete a time slot
  const handleDeleteTimeSlot = async (id: number) => {
    deleteTimeSlotMutation.mutate({ id })
  }

  // Handle appointment cancellation
  const handleCancelAppointment = async (id: number) => {
    cancelAppointmentMutation.mutate({ appointmentId: id })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <PageLayout userName={userName} userRole="admin">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-6">
          <CalendarSidebar date={date} setDate={setDate} />

          <Section title="Quick Actions">
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => setIsAddSlotOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Available Time Slot
              </Button>
              <Link href="/admin/patients">
                <Button className="w-full justify-start" variant="outline">
                  <User className="mr-2 h-4 w-4" /> Manage Patients
                </Button>
              </Link>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{date ? formatDate(date) : "Select a date"}</h2>
          </div>

          <Tabs defaultValue="appointments" className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <TabsList className="p-1 bg-gray-100 rounded-t-lg border-b border-gray-200">
              <TabsTrigger
                value="appointments"
                className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Appointments
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Availability
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="appointments">
                <AppointmentList
                  appointments={filteredAppointments}
                  isLoading={isLoadingAppointments}
                  isAdmin={true}
                  onCancel={handleCancelAppointment}
                  emptyTitle="No appointments for this day"
                  emptyDescription="Select another day or add available time slots."
                />
              </TabsContent>

              <TabsContent value="availability">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsAddSlotOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Time Slot
                  </Button>
                </div>

                <TimeSlotList
                  timeSlots={timeSlots || []}
                  isLoading={isLoadingTimeSlots}
                  isAdmin={true}
                  onDelete={handleDeleteTimeSlot}
                  emptyTitle="No available time slots"
                  emptyDescription="Add time slots to allow patients to book appointments."
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Available Time Slot</DialogTitle>
            <DialogDescription>Create a new time slot for patient appointments.</DialogDescription>
          </DialogHeader>

          <AddTimeSlotForm onSuccess={handleTimeSlotSuccess} onCancel={() => setIsAddSlotOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
