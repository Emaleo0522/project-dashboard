'use client'

import AppLayout from '@/components/AppLayout'
import LoginForm from '@/components/LoginForm'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return user ? <AppLayout initialSection="dashboard" /> : <LoginForm />
}
