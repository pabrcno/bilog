"use client"

import { LoginLayout } from "@/components/login-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function PatientLoginPage() {
  return (
    <LoginLayout>
      <LoginForm
        role="patient"
        title="Patient Login"
        description="Access your appointments and dental care information"
        submitText="Login to My Account"
        redirectPath="/patient"
        alternativeText="Don't have an account?"
        alternativeLink="/patient/register"
        alternativeLinkText="Register"
      />
    </LoginLayout>
  )
}
