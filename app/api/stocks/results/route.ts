import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const checklistId = searchParams.get("checklistId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("checklist_results")
      .select(`
        *,
        checklists!inner (
          id,
          name,
          user_id
        )
      `)
      .eq("checklists.user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (checklistId) {
      query = query.eq("checklist_id", checklistId)
    }

    const { data: results, error } = await query

    if (error) {
      console.error("Results fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Results API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
