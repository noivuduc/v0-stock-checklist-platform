import { createClient } from "@/lib/supabase/server"
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    // Get the most recent data for the symbol
    const { data: stockData, error } = await supabase
      .from("stock_data")
      .select("*")
      .eq("symbol", symbol.toUpperCase())
      .order("date_updated", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!stockData) {
      return NextResponse.json({ error: "Stock data not found" }, { status: 404 })
    }

    return NextResponse.json({ stockData })
  } catch (error) {
    console.error("Stock data API error:", error)
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
    const { symbol } = body

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Import the fetch function from the evaluate route
    const { fetchStockData } = await import("../evaluate/route")

    try {
      const stockData = await fetchStockData(symbol.toUpperCase())

      // Store the updated data
      const { data: updatedStock, error: upsertError } = await supabase
        .from("stock_data")
        .upsert({
          symbol: stockData.symbol,
          financial_data: stockData,
          price: stockData.price,
          market_cap: stockData.market_cap,
          sector: stockData.sector,
          date_updated: new Date().toISOString(),
        })
        .select()
        .single()

      if (upsertError) {
        console.error("Upsert error:", upsertError)
        return NextResponse.json({ error: "Failed to update stock data" }, { status: 500 })
      }

      return NextResponse.json({ stockData: updatedStock })
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Stock data refresh API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
