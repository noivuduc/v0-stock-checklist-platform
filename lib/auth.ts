import type { User } from "./types"
import { createClient } from "./supabase/client"

export class AuthService {
  private static instance: AuthService

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.user) {
        return { user: null, error: authError?.message || "Invalid email or password" }
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle()

      if (userError || !userData) {
        return { user: null, error: "Failed to fetch user data" }
      }

      return { user: userData as User, error: null }
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
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (authError || !authData.user) {
        return { user: null, error: authError?.message || "Registration failed" }
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle()

      if (userError || !userData) {
        return { user: null, error: "Failed to fetch user profile" }
      }

      return { user: userData as User, error: null }
    } catch (error) {
      return { user: null, error: "Registration failed" }
    }
  }

  async signOut(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        return null
      }

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle()

      return userData as User | null
    } catch {
      return null
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  async hasSubscription(tier: "free" | "premium" | "enterprise"): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    const tierLevels = { free: 1, premium: 2, enterprise: 3 }
    const userLevel = tierLevels[user.subscription_tier]
    const requiredLevel = tierLevels[tier]

    return userLevel >= requiredLevel
  }
}

export const authService = AuthService.getInstance()
