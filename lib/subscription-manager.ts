// Subscription management and feature gating
import type { User } from "./types"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "monthly" | "annual"
  features: string[]
  limits: {
    maxChecklists: number
    maxStocksPerEvaluation: number
    maxEvaluationsPerMonth: number
    advancedMetrics: boolean
    realTimeData: boolean
    exportCapabilities: boolean
    prioritySupport: boolean
  }
}

export interface SubscriptionLimits {
  checklistsUsed: number
  evaluationsThisMonth: number
  lastResetDate: string
}

class SubscriptionManager {
  private plans: Map<string, SubscriptionPlan> = new Map()
  private userLimits: Map<number, SubscriptionLimits> = new Map()

  constructor() {
    this.initializePlans()
    this.initializeMockLimits()
  }

  private initializePlans() {
    const plans: SubscriptionPlan[] = [
      {
        id: "free",
        name: "Free",
        price: 0,
        interval: "monthly",
        features: [
          "Up to 5 active checklists",
          "Basic stock metrics",
          "Monthly data refresh",
          "Up to 10 stocks per evaluation",
          "50 evaluations per month",
        ],
        limits: {
          maxChecklists: 5,
          maxStocksPerEvaluation: 10,
          maxEvaluationsPerMonth: 50,
          advancedMetrics: false,
          realTimeData: false,
          exportCapabilities: false,
          prioritySupport: false,
        },
      },
      {
        id: "premium",
        name: "Premium",
        price: 29.99,
        interval: "monthly",
        features: [
          "Unlimited checklists",
          "Advanced metrics (PEG, EV/EBITDA, ROIC)",
          "Daily data refresh",
          "Up to 50 stocks per evaluation",
          "500 evaluations per month",
          "Export to CSV/Excel",
          "Email support",
        ],
        limits: {
          maxChecklists: -1, // Unlimited
          maxStocksPerEvaluation: 50,
          maxEvaluationsPerMonth: 500,
          advancedMetrics: true,
          realTimeData: false,
          exportCapabilities: true,
          prioritySupport: false,
        },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 99.99,
        interval: "monthly",
        features: [
          "Everything in Premium",
          "Real-time data updates",
          "Unlimited stocks per evaluation",
          "Unlimited evaluations",
          "Advanced analytics dashboard",
          "API access",
          "Priority support",
          "Custom integrations",
        ],
        limits: {
          maxChecklists: -1,
          maxStocksPerEvaluation: -1,
          maxEvaluationsPerMonth: -1,
          advancedMetrics: true,
          realTimeData: true,
          exportCapabilities: true,
          prioritySupport: true,
        },
      },
    ]

    plans.forEach((plan) => {
      this.plans.set(plan.id, plan)
    })
  }

  private initializeMockLimits() {
    // Mock usage data for demo users
    this.userLimits.set(1, {
      checklistsUsed: 3,
      evaluationsThisMonth: 12,
      lastResetDate: new Date().toISOString(),
    })

    this.userLimits.set(2, {
      checklistsUsed: 8,
      evaluationsThisMonth: 45,
      lastResetDate: new Date().toISOString(),
    })
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null
  }

  getAllPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values())
  }

  getUserPlan(user: User): SubscriptionPlan {
    return this.getPlan(user.subscription_tier) || this.getPlan("free")!
  }

  getUserLimits(userId: number): SubscriptionLimits {
    return (
      this.userLimits.get(userId) || {
        checklistsUsed: 0,
        evaluationsThisMonth: 0,
        lastResetDate: new Date().toISOString(),
      }
    )
  }

  canCreateChecklist(user: User, currentChecklistCount: number): { allowed: boolean; reason?: string } {
    const plan = this.getUserPlan(user)

    if (plan.limits.maxChecklists === -1) {
      return { allowed: true }
    }

    if (currentChecklistCount >= plan.limits.maxChecklists) {
      return {
        allowed: false,
        reason: `You've reached the limit of ${plan.limits.maxChecklists} checklists for the ${plan.name} plan.`,
      }
    }

    return { allowed: true }
  }

  canEvaluateStocks(user: User, stockCount: number): { allowed: boolean; reason?: string; maxAllowed?: number } {
    const plan = this.getUserPlan(user)
    const limits = this.getUserLimits(user.id)

    // Check monthly evaluation limit
    if (plan.limits.maxEvaluationsPerMonth !== -1) {
      if (limits.evaluationsThisMonth >= plan.limits.maxEvaluationsPerMonth) {
        return {
          allowed: false,
          reason: `You've reached the monthly limit of ${plan.limits.maxEvaluationsPerMonth} evaluations.`,
        }
      }
    }

    // Check stocks per evaluation limit
    if (plan.limits.maxStocksPerEvaluation !== -1) {
      if (stockCount > plan.limits.maxStocksPerEvaluation) {
        return {
          allowed: false,
          reason: `You can evaluate up to ${plan.limits.maxStocksPerEvaluation} stocks at once with the ${plan.name} plan.`,
          maxAllowed: plan.limits.maxStocksPerEvaluation,
        }
      }
    }

    return { allowed: true }
  }

  hasFeature(user: User, feature: keyof SubscriptionPlan["limits"]): boolean {
    const plan = this.getUserPlan(user)
    return plan.limits[feature] === true
  }

  recordEvaluation(userId: number): void {
    const limits = this.getUserLimits(userId)
    limits.evaluationsThisMonth += 1
    this.userLimits.set(userId, limits)
  }

  getUpgradeRecommendation(user: User, requestedFeature?: string): SubscriptionPlan | null {
    const currentPlan = this.getUserPlan(user)
    const allPlans = this.getAllPlans().sort((a, b) => a.price - b.price)

    // Find the next tier up
    const currentIndex = allPlans.findIndex((p) => p.id === currentPlan.id)
    if (currentIndex < allPlans.length - 1) {
      return allPlans[currentIndex + 1]
    }

    return null
  }

  calculateSavings(planId: string): { monthly: number; annual: number } {
    const plan = this.getPlan(planId)
    if (!plan) return { monthly: 0, annual: 0 }

    const monthlyPrice = plan.price
    const annualPrice = monthlyPrice * 12 * 0.8 // 20% discount for annual
    const savings = monthlyPrice * 12 - annualPrice

    return {
      monthly: monthlyPrice,
      annual: annualPrice / 12,
    }
  }
}

export const subscriptionManager = new SubscriptionManager()
