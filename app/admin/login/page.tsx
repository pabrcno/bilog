"use client"

import { LoginLayout } from "@/components/login-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function AdminLoginPage() {
  return (
    <LoginLayout>
      <LoginForm
        role="admin"
        title="Dentist Login"
        description="Access your dental practice management dashboard"
        submitText="Login to Dashboard"
        redirectPath="/admin"
        alternativeText="Not a dentist?"
        alternativeLink="/patient/login"
        alternativeLinkText="Patient Login"
      />
    </LoginLayout>
  )
}
