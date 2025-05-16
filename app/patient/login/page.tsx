"use client"

import { LoginLayout } from "@/components/login-layout"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks"

export default function PatientLoginPage() {
  const { handleLogin } = useAuth()
  return (
    <LoginLayout>
      <LoginForm
        role="patient"
        title="Patient Login"
        description="Access your appointments and dental care information"
        submitText="Login to My Account"
        alternativeText="Don't have an account?"
        alternativeLink="/patient/register"
        alternativeLinkText="Register"
        onSubmit={handleLogin}
      />
    </LoginLayout>
  )
}
