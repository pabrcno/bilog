"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, SmileIcon as ToothIcon } from "lucide-react"

interface PageHeaderProps {
  userName: string
  onLogout: () => void
  isLoggingOut?: boolean
}

export function PageHeader({ userName, onLogout, isLoggingOut = false }: PageHeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-md">
              <ToothIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-black">DentalScheduler</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userName}</span>
            <Button
              variant="ghost"
              size="icon"
              title="Logout"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
