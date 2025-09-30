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

    const { data: checklists, error } = await supabase
      .from("checklists")
      .select(`
        *,
        checklist_items (*)
      `)
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Checklists fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 })
    }

    return NextResponse.json({ checklists })
  } catch (error) {
    console.error("Checklists API error:", error)
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
    const { name, description, items } = body

    // Check subscription limits
    const { data: userProfile } = await supabase.from("users").select("subscription_tier").eq("id", user.id).single()

    const { count: checklistCount } = await supabase
      .from("checklists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("active", true)

    const limits = {
      free: 3,
      pro: 25,
      enterprise: 100,
    }

    const userLimit = limits[userProfile?.subscription_tier as keyof typeof limits] || limits.free

    if ((checklistCount || 0) >= userLimit) {
      return NextResponse.json(
        {
          error: "Checklist limit reached",
          limit: userLimit,
          current: checklistCount,
        },
        { status: 403 },
      )
    }

    // Create checklist
    const { data: checklist, error: checklistError } = await supabase
      .from("checklists")
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single()

    if (checklistError) {
      console.error("Checklist creation error:", checklistError)
      return NextResponse.json({ error: "Failed to create checklist" }, { status: 500 })
    }

    // Create checklist items
    if (items && items.length > 0) {
      const checklistItems = items.map((item: any, index: number) => ({
        checklist_id: checklist.id,
        left_operand: item.leftOperand,
        operator: item.operator,
        right_operand: item.rightOperand,
        enabled: item.enabled ?? true,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase.from("checklist_items").insert(checklistItems)

      if (itemsError) {
        console.error("Checklist items creation error:", itemsError)
        // Clean up the checklist if items failed
        await supabase.from("checklists").delete().eq("id", checklist.id)
        return NextResponse.json({ error: "Failed to create checklist items" }, { status: 500 })
      }
    }

    // Fetch the complete checklist with items
    const { data: completeChecklist } = await supabase
      .from("checklists")
      .select(`
        *,
        checklist_items (*)
      `)
      .eq("id", checklist.id)
      .single()

    return NextResponse.json({ checklist: completeChecklist })
  } catch (error) {
    console.error("Checklist creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
