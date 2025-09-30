import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: checklist, error } = await supabase
      .from("checklists")
      .select(`
        *,
        checklist_items (*)
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Checklist fetch error:", error)
      return NextResponse.json({ error: "Checklist not found" }, { status: 404 })
    }

    return NextResponse.json({ checklist })
  } catch (error) {
    console.error("Checklist API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Update checklist
    const { data: checklist, error: updateError } = await supabase
      .from("checklists")
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Checklist update error:", updateError)
      return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
    }

    // Delete existing items and recreate
    await supabase.from("checklist_items").delete().eq("checklist_id", id)

    if (items && items.length > 0) {
      const checklistItems = items.map((item: any, index: number) => ({
        checklist_id: id,
        left_operand: item.leftOperand,
        operator: item.operator,
        right_operand: item.rightOperand,
        enabled: item.enabled ?? true,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase.from("checklist_items").insert(checklistItems)

      if (itemsError) {
        console.error("Checklist items update error:", itemsError)
        return NextResponse.json({ error: "Failed to update checklist items" }, { status: 500 })
      }
    }

    // Fetch updated checklist with items
    const { data: updatedChecklist } = await supabase
      .from("checklists")
      .select(`
        *,
        checklist_items (*)
      `)
      .eq("id", id)
      .single()

    return NextResponse.json({ checklist: updatedChecklist })
  } catch (error) {
    console.error("Checklist update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("checklists").update({ active: false }).eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Checklist deletion error:", error)
      return NextResponse.json({ error: "Failed to delete checklist" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Checklist deletion API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
