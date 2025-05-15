"use client"

import type React from "react"

import type { Dispatch, SetStateAction } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface CalendarSidebarProps {
  date: Date | undefined
  setDate: Dispatch<SetStateAction<Date | undefined>>
  children?: React.ReactNode
}

export function CalendarSidebar({ date, setDate, children }: CalendarSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4 flex justify-center items-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border border-gray-200"
            classNames={{
              day_selected: "bg-gray-900 text-white hover:bg-gray-800",
              day_today: "bg-gray-100 text-gray-900",
            }}
          />
        </CardContent>
      </Card>

      {children}
    </div>
  )
}
