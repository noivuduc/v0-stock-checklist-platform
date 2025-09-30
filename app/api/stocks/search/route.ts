import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Parse search parameters
    const symbol = searchParams.get("symbol")
    const sector = searchParams.get("sector")
    const minPE = searchParams.get("min_pe") ? Number.parseFloat(searchParams.get("min_pe")!) : null
    const maxPE = searchParams.get("max_pe") ? Number.parseFloat(searchParams.get("max_pe")!) : null
    const minMarketCap = searchParams.get("min_market_cap")
      ? Number.parseInt(searchParams.get("min_market_cap")!)
      : null
    const maxMarketCap = searchParams.get("max_market_cap")
      ? Number.parseInt(searchParams.get("max_market_cap")!)
      : null
    const minDividendYield = searchParams.get("min_dividend_yield")
      ? Number.parseFloat(searchParams.get("min_dividend_yield")!)
      : null

    let query = supabase
      .from("stock_data")
      .select("symbol, financial_data, price, market_cap, sector, date_updated")
      .order("date_updated", { ascending: false })

    // Apply filters
    if (symbol) {
      query = query.ilike("symbol", `%${symbol}%`)
    }

    if (sector) {
      query = query.ilike("sector", `%${sector}%`)
    }

    if (minMarketCap) {
      query = query.gte("market_cap", minMarketCap)
    }

    if (maxMarketCap) {
      query = query.lte("market_cap", maxMarketCap)
    }

    // For JSON field queries, we need to use raw SQL
    if (minPE || maxPE || minDividendYield) {
      const conditions = []

      if (minPE) {
        conditions.push(`(financial_data->>'pe_ratio')::numeric >= ${minPE}`)
      }

      if (maxPE) {
        conditions.push(`(financial_data->>'pe_ratio')::numeric <= ${maxPE}`)
      }

      if (minDividendYield) {
        conditions.push(`(financial_data->>'dividend_yield')::numeric >= ${minDividendYield}`)
      }

      if (conditions.length > 0) {
        const conditionString = conditions.join(" AND ")
        query = query.filter(
          "id",
          "in",
          `(SELECT DISTINCT ON (symbol) id FROM stock_data WHERE ${conditionString} ORDER BY symbol, date_updated DESC)`,
        )
      }
    }

    const { data: stocks, error } = await query.limit(100)

    if (error) {
      console.error("Stock search error:", error)
      return NextResponse.json({ error: "Failed to search stocks" }, { status: 500 })
    }

    // Remove duplicates by symbol, keeping the most recent
    const uniqueStocks =
      stocks?.reduce((acc: any[], stock) => {
        const existing = acc.find((s) => s.symbol === stock.symbol)
        if (!existing || new Date(stock.date_updated) > new Date(existing.date_updated)) {
          if (existing) {
            const index = acc.indexOf(existing)
            acc[index] = stock
          } else {
            acc.push(stock)
          }
        }
        return acc
      }, []) || []

    return NextResponse.json({ stocks: uniqueStocks })
  } catch (error) {
    console.error("Stock search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
