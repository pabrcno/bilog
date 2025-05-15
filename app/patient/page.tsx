"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageLayout } from "@/components/page-layout"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { Section } from "@/components/section"
import { AppointmentList } from "@/components/appointment-list"
import { TimeSlotList } from "@/components/time-slot-list"
import { BookingConfirmationForm } from "@/components/booking-confirmation-form"
import { showSuccess, showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"
import { TimeSlot, User } from "@/db/schema"

export default function PatientDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot & { dentist: User } | null>(null)
  const [cancelConfirmation, setCancelConfirmation] = useState<{ appointmentId: number; timeSlotId: number } | null>(null)
  const [userName, setUserName] = useState("John Smith")

  // tRPC queries and mutations
  const { data: currentUser } = trpc.auth.getCurrentUser.useQuery()
  const { data: appointments, isLoading: isLoadingAppointments } = trpc.appointment.getPatientAppointments.useQuery()
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = trpc.timeSlot.getTimeSlotsForDate.useQuery({
    date: date || new Date(),
  })

  const cancelAppointmentMutation = trpc.appointment.cancelAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment cancelled successfully")
      setCancelConfirmation(null)
      // Refetch appointments
      utils.appointment.getPatientAppointments.invalidate()
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

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  // Handle booking success
  const handleBookingSuccess = () => {
    showSuccess("Appointment booked successfully")
    setIsBookingOpen(false)
    // Refetch appointments and time slots
    utils.appointment.getPatientAppointments.invalidate()
    utils.timeSlot.getTimeSlotsForDate.invalidate({ date: date || new Date() })
  }

  // Handle time slot selection
  const handleSelectTimeSlot = (slot: any) => {
    setSelectedSlot(slot)
    setIsBookingOpen(true)
  }

  const handleCancelAppointment = (appointmentId: number, timeSlotId: number) => {
    console.log("Cancelling appointment", appointmentId)
    cancelAppointmentMutation.mutate({ appointmentId, timeSlotId })
  }

  return (
    <PageLayout userName={userName} userRole="patient">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <CalendarSidebar date={date} setDate={setDate} />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{date ? formatDate(date) : "Select a date"}</h2>
          </div>

          <Tabs defaultValue="book" className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <TabsList className="p-1 bg-gray-100 rounded-t-lg border-b border-gray-200">
              <TabsTrigger value="book" className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Book Appointment
              </TabsTrigger>
              <TabsTrigger
                value="my-appointments"
                className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                My Appointments
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="book">
                <Section
                  title="Available Time Slots"
                  description="Select an available time slot to book your appointment"
                >
                  <TimeSlotList
                    timeSlots={timeSlots || []}
                    isLoading={isLoadingTimeSlots}
                    onSelect={handleSelectTimeSlot}
                    emptyTitle="No available time slots"
                    emptyDescription="Please select another day to see available appointments."
                  />
                </Section>
              </TabsContent>

              <TabsContent value="my-appointments">
                <Section title="My Appointments" description="View and manage your upcoming dental appointments">
                  <AppointmentList
                    appointments={appointments ?? []}
                    isLoading={isLoadingAppointments}
                    onCancel={(appointmentId, timeSlotId) => setCancelConfirmation({ appointmentId, timeSlotId })}
                    emptyTitle="No appointments"
                    emptyDescription="You don't have any upcoming appointments."
                  />
                </Section>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>Please confirm your appointment details.</DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <BookingConfirmationForm
              timeSlot={selectedSlot}
              onSuccess={handleBookingSuccess}
              onCancel={() => setIsBookingOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmation !== null} onOpenChange={() => setCancelConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelConfirmation(null)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelConfirmation !== null && handleCancelAppointment(cancelConfirmation.appointmentId, cancelConfirmation.timeSlotId)}
              disabled={cancelAppointmentMutation.isPending}
            >
              {cancelAppointmentMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
