import { createClient } from "@/lib/supabase/server"
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Subscriptions fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Subscriptions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { plan_name, monthly_fee } = body

    // Create subscription record
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_name,
        status: "active",
        start_date: new Date().toISOString().split("T")[0],
        monthly_fee,
      })
      .select()
      .single()

    if (error) {
      console.error("Subscription creation error:", error)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    // Update user subscription tier
    const tierMap: { [key: string]: string } = {
      Free: "free",
      Pro: "pro",
      Enterprise: "enterprise",
    }

    await supabase
      .from("users")
      .update({ subscription_tier: tierMap[plan_name] || "free" })
      .eq("id", user.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Subscription creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
