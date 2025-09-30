import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Financial Datasets API integration
async function fetchStockData(symbol: string) {
  const apiKey = process.env.FINANCIAL_DATASETS_API_KEY

  if (!apiKey) {
    // Return comprehensive mock data for development
    const mockData = {
      symbol: symbol.toUpperCase(),
      // Basic metrics
      pe_ratio: Math.random() * 30 + 5,
      peg_ratio: Math.random() * 3 + 0.5,
      price_to_book: Math.random() * 10 + 1,
      ev_ebitda: Math.random() * 25 + 5,
      market_cap: Math.floor(Math.random() * 1000000000000),
      volume: Math.floor(Math.random() * 10000000),
      price: Math.random() * 500 + 10,
      dividend_yield: Math.random() * 8,
      sector: ["Technology", "Healthcare", "Finance", "Energy", "Consumer", "Industrial", "Utilities"][
        Math.floor(Math.random() * 7)
      ],

      // Profitability metrics
      roe: Math.random() * 0.3 + 0.05,
      roa: Math.random() * 0.15 + 0.02,
      gross_margin: Math.random() * 0.5 + 0.2,
      operating_margin: Math.random() * 0.3 + 0.05,
      net_margin: Math.random() * 0.2 + 0.02,

      // Financial health
      debt_to_equity: Math.random() * 2,
      current_ratio: Math.random() * 3 + 0.5,
      quick_ratio: Math.random() * 2 + 0.3,
      interest_coverage: Math.random() * 20 + 2,

      // Growth metrics
      revenue_growth: (Math.random() - 0.5) * 0.4,
      earnings_growth: (Math.random() - 0.5) * 0.6,
      book_value_growth: (Math.random() - 0.3) * 0.3,

      // Market metrics
      beta: Math.random() * 2 + 0.3,
      shares_outstanding: Math.floor(Math.random() * 10000000000),
      float_shares: Math.floor(Math.random() * 8000000000),

      // Additional data
      employees: Math.floor(Math.random() * 500000),
      founded_year: Math.floor(Math.random() * 50) + 1970,
      headquarters: "Mock City, State",
      website: `https://www.${symbol.toLowerCase()}.com`,
      description: `Mock company description for ${symbol}`,

      // Analyst data
      analyst_rating: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"][Math.floor(Math.random() * 5)],
      price_target: Math.random() * 600 + 50,
      analyst_count: Math.floor(Math.random() * 30) + 5,

      // Technical indicators
      rsi: Math.random() * 100,
      moving_avg_50: Math.random() * 500 + 10,
      moving_avg_200: Math.random() * 500 + 10,

      // ESG scores (if available)
      esg_score: Math.floor(Math.random() * 100),

      // Last updated
      last_updated: new Date().toISOString(),
      data_source: "mock",
    }

    return mockData
  }

  try {
    const baseUrl = "https://api.financialdatasets.ai"

    const [metricsResponse, pricesResponse, factsResponse, financialsResponse, analystResponse] =
      await Promise.allSettled([
        fetch(`${baseUrl}/financial-metrics/snapshot?ticker=${symbol}`, {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        }),
        fetch(`${baseUrl}/prices/snapshot?ticker=${symbol}`, {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        }),
        fetch(`${baseUrl}/company/facts?ticker=${symbol}`, {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        }),
        fetch(`${baseUrl}/financials/income-statements?ticker=${symbol}&period=ttm&limit=1`, {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        }),
        fetch(`${baseUrl}/analyst-estimates?ticker=${symbol}`, {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        }),
      ])

    // Parse successful responses
    const metrics =
      metricsResponse.status === "fulfilled" && metricsResponse.value.ok ? await metricsResponse.value.json() : {}
    const prices =
      pricesResponse.status === "fulfilled" && pricesResponse.value.ok ? await pricesResponse.value.json() : {}
    const facts = factsResponse.status === "fulfilled" && factsResponse.value.ok ? await factsResponse.value.json() : {}
    const financials =
      financialsResponse.status === "fulfilled" && financialsResponse.value.ok
        ? await financialsResponse.value.json()
        : {}
    const analyst =
      analystResponse.status === "fulfilled" && analystResponse.value.ok ? await analystResponse.value.json() : {}

    const comprehensiveData = {
      symbol: symbol.toUpperCase(),

      // Basic valuation metrics
      pe_ratio: metrics.pe_ratio || null,
      peg_ratio: metrics.peg_ratio || null,
      price_to_book: metrics.price_to_book || null,
      ev_ebitda: metrics.ev_ebitda || null,
      price_to_sales: metrics.price_to_sales || null,

      // Market data
      market_cap: prices.market_cap || metrics.market_cap || null,
      volume: prices.volume || null,
      price: prices.price || prices.close || null,
      dividend_yield: metrics.dividend_yield || null,

      // Company info
      sector: facts.sector || null,
      industry: facts.industry || null,
      employees: facts.employees || null,
      founded_year: facts.founded_year || null,
      headquarters: facts.headquarters || null,
      website: facts.website || null,
      description: facts.description || null,

      // Profitability metrics
      roe: metrics.roe || null,
      roa: metrics.roa || null,
      gross_margin: metrics.gross_margin || financials.gross_margin || null,
      operating_margin: metrics.operating_margin || financials.operating_margin || null,
      net_margin: metrics.net_margin || financials.net_margin || null,

      // Financial health
      debt_to_equity: metrics.debt_to_equity || null,
      current_ratio: metrics.current_ratio || null,
      quick_ratio: metrics.quick_ratio || null,
      interest_coverage: metrics.interest_coverage || null,

      // Growth metrics
      revenue_growth: metrics.revenue_growth || null,
      earnings_growth: metrics.earnings_growth || null,
      book_value_growth: metrics.book_value_growth || null,

      // Market metrics
      beta: metrics.beta || null,
      shares_outstanding: metrics.shares_outstanding || facts.shares_outstanding || null,
      float_shares: metrics.float_shares || null,

      // Analyst data
      analyst_rating: analyst.consensus_rating || null,
      price_target: analyst.price_target || null,
      analyst_count: analyst.analyst_count || null,

      // Technical indicators (if available)
      rsi: prices.rsi || null,
      moving_avg_50: prices.moving_avg_50 || null,
      moving_avg_200: prices.moving_avg_200 || null,

      // ESG data (if available)
      esg_score: facts.esg_score || null,

      // Raw data for advanced analysis
      raw_metrics: metrics,
      raw_prices: prices,
      raw_facts: facts,
      raw_financials: financials,
      raw_analyst: analyst,

      // Metadata
      last_updated: new Date().toISOString(),
      data_source: "financial_datasets_api",
    }

    return comprehensiveData
  } catch (error) {
    console.error(`Error fetching comprehensive data for ${symbol}:`, error)
    // Return basic fallback data
    return {
      symbol: symbol.toUpperCase(),
      pe_ratio: Math.random() * 30 + 5,
      market_cap: Math.floor(Math.random() * 1000000000000),
      volume: Math.floor(Math.random() * 10000000),
      price: Math.random() * 500 + 10,
      dividend_yield: Math.random() * 8,
      sector: ["Technology", "Healthcare", "Finance", "Energy", "Consumer"][Math.floor(Math.random() * 5)],
      last_updated: new Date().toISOString(),
      data_source: "fallback",
    }
  }
}

function evaluateCondition(leftValue: any, operator: string, rightValue: any): boolean {
  // Handle null/undefined values
  if (leftValue === null || leftValue === undefined) {
    return operator === "!=" || operator === "not_contains"
  }

  const numLeft = Number.parseFloat(leftValue)
  const numRight = Number.parseFloat(rightValue)

  switch (operator) {
    case ">":
      return !isNaN(numLeft) && !isNaN(numRight) && numLeft > numRight
    case "<":
      return !isNaN(numLeft) && !isNaN(numRight) && numLeft < numRight
    case ">=":
      return !isNaN(numLeft) && !isNaN(numRight) && numLeft >= numRight
    case "<=":
      return !isNaN(numLeft) && !isNaN(numRight) && numLeft <= numRight
    case "=":
      return leftValue.toString().toLowerCase() === rightValue.toString().toLowerCase()
    case "!=":
      return leftValue.toString().toLowerCase() !== rightValue.toString().toLowerCase()
    case "contains":
      return leftValue.toString().toLowerCase().includes(rightValue.toString().toLowerCase())
    case "not_contains":
      return !leftValue.toString().toLowerCase().includes(rightValue.toString().toLowerCase())
    default:
      return false
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
    const { checklistId, symbols } = body

    if (!checklistId || !symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Check subscription limits for evaluations
    const { data: userProfile } = await supabase.from("users").select("subscription_tier").eq("id", user.id).single()

    const evaluationLimits = {
      free: 10,
      pro: 100,
      enterprise: 1000,
    }

    const userLimit =
      evaluationLimits[userProfile?.subscription_tier as keyof typeof evaluationLimits] || evaluationLimits.free

    if (symbols.length > userLimit) {
      return NextResponse.json(
        {
          error: "Evaluation limit exceeded",
          limit: userLimit,
          requested: symbols.length,
        },
        { status: 403 },
      )
    }

    // Fetch checklist with items
    const { data: checklist, error: checklistError } = await supabase
      .from("checklists")
      .select(`
        *,
        checklist_items (*)
      `)
      .eq("id", checklistId)
      .eq("user_id", user.id)
      .single()

    if (checklistError || !checklist) {
      return NextResponse.json({ error: "Checklist not found" }, { status: 404 })
    }

    const results = []

    // Process each symbol
    for (const symbol of symbols) {
      try {
        const stockData = await fetchStockData(symbol.toUpperCase())

        await supabase.from("stock_data").upsert({
          symbol: stockData.symbol,
          financial_data: stockData,
          price: stockData.price,
          market_cap: stockData.market_cap,
          sector: stockData.sector,
          date_updated: new Date().toISOString(),
        })

        // Evaluate against checklist items
        let passedChecks = 0
        const totalChecks = checklist.checklist_items.filter((item: any) => item.enabled).length
        const itemResults = []

        for (const item of checklist.checklist_items) {
          if (!item.enabled) continue

          const leftValue = stockData[item.left_operand as keyof typeof stockData]
          const passed = evaluateCondition(leftValue, item.operator, item.right_operand)

          if (passed) passedChecks++

          itemResults.push({
            item_id: item.id,
            left_operand: item.left_operand,
            operator: item.operator,
            right_operand: item.right_operand,
            left_value: leftValue,
            passed,
          })
        }

        const scorePercentage = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0

        // Store evaluation result
        const { data: result } = await supabase
          .from("checklist_results")
          .insert({
            checklist_id: checklistId,
            symbol: stockData.symbol,
            passed_checks: passedChecks,
            total_checks: totalChecks,
            score_percentage: scorePercentage,
            details: {
              stock_data: stockData,
              item_results: itemResults,
            },
          })
          .select()
          .single()

        results.push({
          symbol: stockData.symbol,
          stockData,
          passedChecks,
          totalChecks,
          scorePercentage,
          itemResults,
          resultId: result?.id,
        })
      } catch (error) {
        console.error(`Error evaluating ${symbol}:`, error)
        results.push({
          symbol: symbol.toUpperCase(),
          error: "Failed to evaluate stock",
          passedChecks: 0,
          totalChecks: 0,
          scorePercentage: 0,
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Stock evaluation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export { fetchStockData }
