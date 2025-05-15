"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarSidebar } from "@/components/ui/calendar-sidebar"
import { showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"
import { DialogFooter } from "@/components/ui/dialog"

// Define the form schema with Zod
const timeSlotSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  duration: z.string({
    required_error: "Please select a duration",
  }),
})

// Infer the type from the schema
type TimeSlotFormValues = z.infer<typeof timeSlotSchema>

interface AddTimeSlotFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddTimeSlotForm({ onSuccess, onCancel }: AddTimeSlotFormProps) {
  // Initialize React Hook Form
  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<TimeSlotFormValues>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      date: new Date(),
      time: "09:00",
      duration: "30",
    },
  })

  const createTimeSlotMutation = trpc.timeSlot.createTimeSlot.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      showError(error.message || "Failed to add time slot")
    },
  })

  const onSubmit = (values: TimeSlotFormValues) => {
    try {
      // Create a date object with the selected date and time
      const [hours, minutes] = values.time.split(":").map(Number)
      const startTime = new Date(values.date)
      startTime.setHours(hours, minutes, 0, 0)

      createTimeSlotMutation.mutate({
        startTime: startTime.toISOString(),
        duration: Number(values.duration),
      })
    } catch (error) {
      console.error("Error adding time slot:", error)
      showError("Failed to add time slot")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <CalendarSidebar date={watch("date") as Date} setDate={(date: unknown) => { if (date instanceof Date) setValue("date", date) }} />
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <Select value={watch("time")} onValueChange={(val: string) => setValue("time", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="09:30">9:30 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
              <SelectItem value="10:30">10:30 AM</SelectItem>
              <SelectItem value="11:00">11:00 AM</SelectItem>
              <SelectItem value="11:30">11:30 AM</SelectItem>
              <SelectItem value="13:00">1:00 PM</SelectItem>
              <SelectItem value="13:30">1:30 PM</SelectItem>
              <SelectItem value="14:00">2:00 PM</SelectItem>
              <SelectItem value="14:30">2:30 PM</SelectItem>
              <SelectItem value="15:00">3:00 PM</SelectItem>
              <SelectItem value="15:30">3:30 PM</SelectItem>
              <SelectItem value="16:00">4:00 PM</SelectItem>
              <SelectItem value="16:30">4:30 PM</SelectItem>
            </SelectContent>
          </Select>
          {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <Select value={watch("duration")} onValueChange={(val: string) => setValue("duration", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
          {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createTimeSlotMutation.isPending}>
          {createTimeSlotMutation.isPending ? "Adding..." : "Add Time Slot"}
        </Button>
      </DialogFooter>
    </form>
  )
}
