// Authentication utilities and session management
import type { User } from "./types"

// Mock authentication for development - replace with real auth service
export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Mock authentication - replace with real API call
      const mockUsers: User[] = [
        {
          id: 1,
          email: "demo@example.com",
          created_at: new Date().toISOString(),
          subscription_tier: "free",
          first_name: "Demo",
          last_name: "User",
          active: true,
        },
        {
          id: 2,
          email: "premium@example.com",
          created_at: new Date().toISOString(),
          subscription_tier: "premium",
          first_name: "Premium",
          last_name: "User",
          active: true,
        },
      ]

      const user = mockUsers.find((u) => u.email === email)
      if (user && password === "password") {
        this.currentUser = user
        localStorage.setItem("auth_user", JSON.stringify(user))
        return { user, error: null }
      }

      return { user: null, error: "Invalid email or password" }
    } catch (error) {
      return { user: null, error: "Authentication failed" }
    }
  }

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      // Mock user creation - replace with real API call
      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 100,
        email,
        created_at: new Date().toISOString(),
        subscription_tier: "free",
        first_name: firstName,
        last_name: lastName,
        active: true,
      }

      this.currentUser = newUser
      localStorage.setItem("auth_user", JSON.stringify(newUser))
      return { user: newUser, error: null }
    } catch (error) {
      return { user: null, error: "Registration failed" }
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null
    localStorage.removeItem("auth_user")
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to restore from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          return this.currentUser
        } catch {
          localStorage.removeItem("auth_user")
        }
      }
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  hasSubscription(tier: "free" | "premium" | "enterprise"): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    const tierLevels = { free: 1, premium: 2, enterprise: 3 }
    const userLevel = tierLevels[user.subscription_tier]
    const requiredLevel = tierLevels[tier]

    return userLevel >= requiredLevel
  }
}

export const authService = AuthService.getInstance()
