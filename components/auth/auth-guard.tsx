"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { authService } from "@/lib/auth"
import type { User } from "@/lib/types"
import { LoginForm } from "./login-form"
import { SignUpForm } from "./signup-form"

interface AuthGuardProps {
  children: React.ReactNode
  requireSubscription?: "free" | "premium" | "enterprise"
}

export function AuthGuard({ children, requireSubscription = "free" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        {showSignUp ? (
          <SignUpForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setShowSignUp(false)} />
        ) : (
          <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignUp={() => setShowSignUp(true)} />
        )}
      </div>
    )
  }

  if (!authService.hasSubscription(requireSubscription)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Upgrade Required</h2>
          <p className="text-muted-foreground">This feature requires a {requireSubscription} subscription or higher.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
