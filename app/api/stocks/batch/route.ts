// API route for fetching multiple stocks at once
import { type NextRequest, NextResponse } from "next/server"
import { financialApi } from "@/lib/financial-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbols } = body

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: "Invalid symbols array" }, { status: 400 })
    }

    if (symbols.length > 50) {
      return NextResponse.json({ error: "Too many symbols requested (max 50)" }, { status: 400 })
    }

    // Validate symbols
    const validSymbols = symbols.filter((s) => typeof s === "string" && s.length <= 10).map((s) => s.toUpperCase())

    if (validSymbols.length === 0) {
      return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 })
    }

    console.log(`[v0] Fetching batch stock data for ${validSymbols.length} symbols`)
    const stocksData = await financialApi.getMultipleStocks(validSymbols)

    return NextResponse.json({
      success: true,
      data: stocksData,
      provider: financialApi.getCurrentProvider(),
      requested: validSymbols.length,
      returned: stocksData.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[v0] Batch API error:`, error)

    return NextResponse.json(
      {
        error: "Failed to fetch batch stock data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
