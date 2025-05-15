import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SmileIcon as ToothIcon, Calendar, UserCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="container mx-auto py-6 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-md">
              <ToothIcon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-black">DentalScheduler</h1>
          </div>
          <nav className="space-x-2">
            <Link href="/patient/login">
              <Button variant="outline">Patient Login</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline">Dentist Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Dental Appointment Scheduling</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Easy and convenient appointment scheduling for both patients and dental professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 text-gray-800 p-2 rounded-full">
                  <UserCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-gray-800">For Patients</CardTitle>
              </div>
              <CardDescription>Book and manage your dental appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-gray-100 text-gray-800 p-1 rounded-full mr-2">✓</span>
                  <span>View available appointment slots</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gray-100 text-gray-800 p-1 rounded-full mr-2">✓</span>
                  <span>Book appointments online</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gray-100 text-gray-800 p-1 rounded-full mr-2">✓</span>
                  <span>Cancel or reschedule as needed</span>
                </li>
              </ul>
              <Link href="/patient/login">
                <Button className="w-full mt-4">Patient Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 text-gray-800 p-2 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle className="text-gray-800">For Dentists</CardTitle>
              </div>
              <CardDescription>Manage your schedule and appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-gray-100 text-gray-800 p-1 rounded-full mr-2">✓</span>
                  <span>View your appointment calendar</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gray-100 text-gray-800 p-1 rounded-full mr-2">✓</span>
                  <span>Set your availability</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gray-100 text-gray-800 p-1 rounded-full mr-2">✓</span>
                  <span>Manage patient appointments</span>
                </li>
              </ul>
              <Link href="/admin/login">
                <Button className="w-full mt-4">Dentist Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-gray-500 border-t border-gray-200">
        <p>© {new Date().getFullYear()} DentalScheduler. All rights reserved.</p>
      </footer>
    </div>
  )
}
