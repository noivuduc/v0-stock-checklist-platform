"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, Star, Zap } from "lucide-react"
import { subscriptionManager } from "@/lib/subscription-manager"
import type { User } from "@/lib/types"

interface PricingPlansProps {
  currentUser?: User
  onSelectPlan?: (planId: string) => void
}

export function PricingPlans({ currentUser, onSelectPlan }: PricingPlansProps) {
  const [isAnnual, setIsAnnual] = useState(false)
  const plans = subscriptionManager.getAllPlans()

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    const displayPrice = isAnnual ? price * 0.8 : price // 20% discount for annual
    return `$${displayPrice.toFixed(2)}`
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "premium":
        return <Star className="h-5 w-5" />
      case "enterprise":
        return <Zap className="h-5 w-5" />
      default:
        return null
    }
  }

  const isCurrentPlan = (planId: string) => {
    return currentUser?.subscription_tier === planId
  }

  const getButtonText = (planId: string) => {
    if (isCurrentPlan(planId)) return "Current Plan"
    if (planId === "free") return "Get Started"
    return "Upgrade Now"
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-toggle" className={!isAnnual ? "font-medium" : ""}>
          Monthly
        </Label>
        <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
        <Label htmlFor="billing-toggle" className={isAnnual ? "font-medium" : ""}>
          Annual
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            Save 20%
          </Badge>
        </Label>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPopular = plan.id === "premium"
          const isCurrent = isCurrentPlan(plan.id)

          return (
            <Card
              key={plan.id}
              className={`relative ${isPopular ? "border-primary shadow-lg scale-105" : ""} ${
                isCurrent ? "ring-2 ring-primary" : ""
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getPlanIcon(plan.id)}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-lg font-normal text-muted-foreground">/month</span>}
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Billed annually (${(plan.price * 12 * 0.8).toFixed(2)}/year)
                    </div>
                  )}
                </div>

                <CardDescription className="text-pretty">{plan.features[0]}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className="w-full"
                  variant={isCurrent ? "secondary" : isPopular ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => onSelectPlan?.(plan.id)}
                >
                  {getButtonText(plan.id)}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-pretty">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits Display */}
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Limits:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Checklists: {plan.limits.maxChecklists === -1 ? "Unlimited" : plan.limits.maxChecklists}</div>
                    <div>
                      Stocks/eval:{" "}
                      {plan.limits.maxStocksPerEvaluation === -1 ? "Unlimited" : plan.limits.maxStocksPerEvaluation}
                    </div>
                    <div className="col-span-2">
                      Monthly evals:{" "}
                      {plan.limits.maxEvaluationsPerMonth === -1 ? "Unlimited" : plan.limits.maxEvaluationsPerMonth}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-center mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center p-4">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">Advanced Metrics</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.limits.advancedMetrics ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4">Real-time Data</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.limits.realTimeData ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4">Export Capabilities</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.limits.exportCapabilities ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4">Priority Support</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.limits.prioritySupport ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
