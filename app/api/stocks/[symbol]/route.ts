// API route for fetching individual stock data
import { type NextRequest, NextResponse } from "next/server"
import { financialApi } from "@/lib/financial-api"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()

    if (!symbol || symbol.length > 10) {
      return NextResponse.json({ error: "Invalid stock symbol" }, { status: 400 })
    }

    console.log(`[v0] Fetching stock data for ${symbol}`)
    const stockData = await financialApi.getStockData(symbol)

    return NextResponse.json({
      success: true,
      data: stockData,
      provider: financialApi.getCurrentProvider(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[v0] API error for stock ${params.symbol}:`, error)

    return NextResponse.json(
      {
        error: "Failed to fetch stock data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
