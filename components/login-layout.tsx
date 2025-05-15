import type { ReactNode } from "react"
import Link from "next/link"
import { SmileIcon as ToothIcon } from "lucide-react"

interface LoginLayoutProps {
  children: ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="container mx-auto py-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-black text-white p-1.5 rounded-md">
            <ToothIcon className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-black">DentalScheduler</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">{children}</main>

      <footer className="py-6 text-center text-gray-500 border-t border-gray-200">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} DentalScheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
