"use client"

import { LoginLayout } from "@/components/login-layout"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks"

export default function AdminLoginPage() {
  const { handleLogin } = useAuth()
  return (
    <LoginLayout>
      <LoginForm
        role="admin"
        title="Dentist Login"
        description="Access your dental practice management dashboard"
        submitText="Login to Dashboard"
        alternativeText="Not a dentist?"
        alternativeLink="/patient/login"
        alternativeLinkText="Patient Login"
        onSubmit={handleLogin}
      />
    </LoginLayout>
  )
}
