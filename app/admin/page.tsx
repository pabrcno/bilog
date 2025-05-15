"use client"

import { useState } from "react"
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
import { Plus } from "lucide-react"
import { PageLayout } from "@/components/ui/page-layout"
import { CalendarSidebar } from "@/components/ui/calendar-sidebar"
import { Section } from "@/components/ui/section"
import { AppointmentList } from "@/components/ui/appointment-list"
import { TimeSlotList } from "@/components/ui/time-slot-list"
import { AddTimeSlotForm } from "@/components/add-time-slot-form"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { DateHeader } from "@/components/ui/date-header"
import { useUser, useAppointments, useTimeSlots, useDateFormat } from "@/hooks"

export default function AdminPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("all")
  
  // Custom hooks
  const { userName } = useUser()
  const { formatDate } = useDateFormat()

  const { 
    confirmAction, 
    allAppointments, 
    pendingAppointments, 
    confirmedAppointments, 
    isLoadingAppointments,
    handleRequestCancelAppointment,
    handleRequestConfirmAppointment,
    handleRequestRejectAppointment,
    executeAppointmentAction,
    setConfirmAction,
    getDialogText,
    cancelPending,
    confirmPending,
    rejectPending
  } = useAppointments({ isAdmin: true, date })

  const {
    timeSlots,
    isLoadingTimeSlots,
    isAddSlotOpen,
    setIsAddSlotOpen,
    handleCreateTimeSlot,
    handleDeleteTimeSlot,
    isCreating
  } = useTimeSlots({ date, isAdmin: true })

  // Get dialog text based on action type
  const dialogText = getDialogText()

  return (
    <PageLayout userName={userName} userRole="admin">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-6">
            <CalendarSidebar date={date} setDate={setDate} />

            <Section title="Quick Actions" variant="sidebar">
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                  variant="outline" 
                  onClick={() => setIsAddSlotOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Available Time Slot
                </Button>
              </div>
            </Section>
            
            <Section title="Appointment Counts" variant="sidebar">
              <div className="space-y-3 text-sm">
                <StatusIndicator label="All Today" status="all" count={allAppointments.length} />
                <StatusIndicator label="Pending" status="pending" count={pendingAppointments.length} />
                <StatusIndicator label="Confirmed" status="confirmed" count={confirmedAppointments.length} />
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <DateHeader 
              date={date} 
              formatDate={formatDate}
              actions={
                <Button onClick={() => setIsAddSlotOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Time Slot
                </Button>
              }
            />

            <Tabs 
              defaultValue="all" 
              onValueChange={setActiveTab} 
              value={activeTab}
            >
              <TabsList>
                <TabsTrigger value="all" color="blue">
                  All ({allAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="pending" color="amber">
                  Pending ({pendingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" color="green">
                  Confirmed ({confirmedAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="availability" color="purple">
                  Availability
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="all">
                  <Section 
                    title="All Appointments" 
                    description="View and manage all appointments for the selected date"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={allAppointments}
                      isLoading={isLoadingAppointments}
                      isAdmin={true}
                      onCancel={handleRequestCancelAppointment}
                      onConfirm={handleRequestConfirmAppointment}
                      onReject={handleRequestRejectAppointment}
                      emptyTitle="No appointments for this day"
                      emptyDescription="There are no appointments scheduled for this day."
                    />
                  </Section>
                </TabsContent>
              
                <TabsContent value="pending">
                  <Section 
                    title="Pending Appointments" 
                    description="Appointments awaiting confirmation"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={pendingAppointments}
                      isLoading={isLoadingAppointments}
                      isAdmin={true}
                      onCancel={handleRequestCancelAppointment}
                      onConfirm={handleRequestConfirmAppointment}
                      onReject={handleRequestRejectAppointment}
                      emptyTitle="No pending appointments for this day"
                      emptyDescription="All appointments have been processed or there are no pending bookings."
                    />
                  </Section>
                </TabsContent>
                
                <TabsContent value="confirmed">
                  <Section 
                    title="Confirmed Appointments" 
                    description="Appointments that have been confirmed"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={confirmedAppointments}
                      isLoading={isLoadingAppointments}
                      isAdmin={true}
                      onCancel={handleRequestCancelAppointment}
                      emptyTitle="No confirmed appointments for this day"
                      emptyDescription="No confirmed appointments scheduled for this day."
                    />
                  </Section>
                </TabsContent>

                <TabsContent value="availability">
                  <Section 
                    title="Available Time Slots" 
                    description="Manage available time slots for appointments"
                    variant="transparent"
                  >
                    <div className="mb-4">
                      <Button 
                        onClick={() => setIsAddSlotOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Time Slot
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
                  </Section>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add Time Slot Dialog */}
      <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Available Time Slot</DialogTitle>
            <DialogDescription>Create a new time slot for patient appointments.</DialogDescription>
          </DialogHeader>

          <AddTimeSlotForm 
            onSubmit={handleCreateTimeSlot} 
            onCancel={() => setIsAddSlotOpen(false)} 
            isPending={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogText.title}</DialogTitle>
            <DialogDescription>{dialogText.description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {dialogText.cancelButton}
            </Button>
            <Button
              variant={confirmAction?.type === "confirm" ? "default" : "destructive"}
              onClick={executeAppointmentAction}
              disabled={cancelPending || confirmPending || rejectPending}
              className="ml-2 sm:ml-0"
            >
              {dialogText.actionButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
