"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { PricingPlans } from "@/components/subscription/pricing-plans"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth"

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const currentUser = authService.getCurrentUser()

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    // In a real app, this would redirect to payment processing
    alert(`Redirecting to payment for ${planId} plan...`)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-balance">Choose Your Plan</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Start free and upgrade as your investment research grows
              </p>
            </div>

            {selectedPlan && (
              <Alert>
                <AlertDescription>
                  You selected the {selectedPlan} plan. In a real application, you would be redirected to payment
                  processing.
                </AlertDescription>
              </Alert>
            )}

            <PricingPlans currentUser={currentUser || undefined} onSelectPlan={handleSelectPlan} />
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
