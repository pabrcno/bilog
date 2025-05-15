import type { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"

interface PageLayoutProps {
  children: ReactNode
  userName: string
  userRole: "admin" | "patient"
}

export function PageLayout({ children, userName, userRole }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader userName={userName} userRole={userRole} />
      <main className="container mx-auto py-6 px-4 sm:px-6">{children}</main>
      <footer className="border-t border-gray-200 py-6 text-center text-gray-500">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} DentalScheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
