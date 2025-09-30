"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, ArrowRight, X } from "lucide-react"
import { subscriptionManager } from "@/lib/subscription-manager"
import type { User } from "@/lib/types"

interface UpgradePromptProps {
  user: User
  feature?: string
  reason?: string
  onUpgrade?: () => void
  onDismiss?: () => void
  className?: string
}

export function UpgradePrompt({ user, feature, reason, onUpgrade, onDismiss, className }: UpgradePromptProps) {
  const currentPlan = subscriptionManager.getUserPlan(user)
  const recommendedPlan = subscriptionManager.getUpgradeRecommendation(user, feature)

  if (!recommendedPlan) return null

  const getFeatureTitle = (feature?: string) => {
    switch (feature) {
      case "maxChecklists":
        return "Create More Checklists"
      case "maxStocksPerEvaluation":
        return "Evaluate More Stocks"
      case "maxEvaluationsPerMonth":
        return "Unlimited Evaluations"
      case "advancedMetrics":
        return "Advanced Metrics"
      case "realTimeData":
        return "Real-time Data"
      case "exportCapabilities":
        return "Export Capabilities"
      default:
        return "Upgrade Your Plan"
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">{getFeatureTitle(feature)}</CardTitle>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-pretty">
          {reason || `Upgrade to ${recommendedPlan.name} to unlock this feature and more.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            You're currently on the <strong>{currentPlan.name}</strong> plan.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="font-medium">{recommendedPlan.name} Plan</div>
            <div className="text-sm text-muted-foreground">
              {recommendedPlan.price === 0 ? "Free" : `$${recommendedPlan.price}/month`}
            </div>
          </div>
          <Badge variant="secondary">Recommended</Badge>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">What you'll get:</h4>
          <ul className="space-y-1 text-sm">
            {recommendedPlan.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-pretty">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={onUpgrade} className="w-full">
          Upgrade to {recommendedPlan.name}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <div className="text-center text-xs text-muted-foreground">Cancel anytime • 30-day money-back guarantee</div>
      </CardContent>
    </Card>
  )
}
