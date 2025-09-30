"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { subscriptionManager } from "@/lib/subscription-manager"
import type { User } from "@/lib/types"

interface UsageMeterProps {
  user: User
  checklistCount: number
  className?: string
}

export function UsageMeter({ user, checklistCount, className }: UsageMeterProps) {
  const plan = subscriptionManager.getUserPlan(user)
  const limits = subscriptionManager.getUserLimits(user.id)

  const getUsagePercentage = (used: number, max: number) => {
    if (max === -1) return 0 // Unlimited
    return Math.min((used / max) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? "Unlimited" : limit.toString()
  }

  const checklistUsage = getUsagePercentage(checklistCount, plan.limits.maxChecklists)
  const evaluationUsage = getUsagePercentage(limits.evaluationsThisMonth, plan.limits.maxEvaluationsPerMonth)

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Usage Overview</CardTitle>
          <Badge variant="secondary">{plan.name} Plan</Badge>
        </div>
        <CardDescription>Your current usage and limits</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Checklists Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Active Checklists</span>
            <span className={getUsageColor(checklistUsage)}>
              {checklistCount} / {formatLimit(plan.limits.maxChecklists)}
            </span>
          </div>
          {plan.limits.maxChecklists !== -1 && <Progress value={checklistUsage} className="h-2" />}
        </div>

        {/* Evaluations Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Monthly Evaluations</span>
            <span className={getUsageColor(evaluationUsage)}>
              {limits.evaluationsThisMonth} / {formatLimit(plan.limits.maxEvaluationsPerMonth)}
            </span>
          </div>
          {plan.limits.maxEvaluationsPerMonth !== -1 && <Progress value={evaluationUsage} className="h-2" />}
        </div>

        {/* Stocks per Evaluation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Stocks per Evaluation</span>
            <span className="text-muted-foreground">Up to {formatLimit(plan.limits.maxStocksPerEvaluation)}</span>
          </div>
        </div>

        {/* Feature Indicators */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm">Available Features</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${plan.limits.advancedMetrics ? "bg-green-500" : "bg-gray-300"}`} />
              <span>Advanced Metrics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${plan.limits.realTimeData ? "bg-green-500" : "bg-gray-300"}`} />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${plan.limits.exportCapabilities ? "bg-green-500" : "bg-gray-300"}`}
              />
              <span>Export Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${plan.limits.prioritySupport ? "bg-green-500" : "bg-gray-300"}`} />
              <span>Priority Support</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
