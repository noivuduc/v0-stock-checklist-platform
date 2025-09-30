// Financial API integration with adapter pattern for multiple providers
import type { FinancialMetrics } from "./types"

// Base interface for all financial data providers
interface FinancialDataProvider {
  name: string
  getSnapshot(symbol: string): Promise<FinancialMetrics>
  getHistoricalMetrics(symbol: string, period: "quarterly" | "annual", limit: number): Promise<any[]>
  getAnalystEstimates(symbol: string): Promise<any>
  getCompanyFacts(symbol: string): Promise<any>
  getFinancialStatements(symbol: string, statement: "income" | "balance" | "cashflow"): Promise<any>
}

// Financial Datasets API implementation
class FinancialDatasetsProvider implements FinancialDataProvider {
  name = "Financial Datasets API"
  private baseUrl = "https://api.financialdatasets.ai"
  private apiKey = process.env.FINANCIAL_DATASETS_API_KEY || "demo-key"

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`[v0] Financial API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async getSnapshot(symbol: string): Promise<FinancialMetrics> {
    try {
      // Fetch multiple endpoints in parallel for comprehensive data
      const [metricsResponse, pricesResponse, factsResponse] = await Promise.all([
        this.makeRequest(`/financial-metrics/snapshot?ticker=${symbol}`),
        this.makeRequest(`/prices/snapshot?ticker=${symbol}`),
        this.makeRequest(`/company/facts?ticker=${symbol}`),
      ])

      // Normalize data into our standard format
      const metrics: FinancialMetrics = {
        symbol: symbol.toUpperCase(),
        pe_ratio: metricsResponse?.pe_ratio || null,
        peg_ratio: metricsResponse?.peg_ratio || null,
        price_to_book: metricsResponse?.price_to_book || null,
        ev_ebitda: metricsResponse?.ev_ebitda || null,
        roe: metricsResponse?.roe || null,
        debt_to_equity: metricsResponse?.debt_to_equity || null,
        current_ratio: metricsResponse?.current_ratio || null,
        revenue_growth: metricsResponse?.revenue_growth || null,
        earnings_growth: metricsResponse?.earnings_growth || null,
        market_cap: pricesResponse?.market_cap || null,
        volume: pricesResponse?.volume || null,
        price: pricesResponse?.price || null,
        dividend_yield: metricsResponse?.dividend_yield || null,
        sector: factsResponse?.sector || null,
        beta: metricsResponse?.beta || null,
      }

      // Compute missing metrics if possible
      await this.computeMissingMetrics(metrics, symbol)

      return metrics
    } catch (error) {
      console.error(`[v0] Failed to get snapshot for ${symbol}:`, error)
      throw error
    }
  }

  private async computeMissingMetrics(metrics: FinancialMetrics, symbol: string): Promise<void> {
    try {
      // If PEG ratio is missing, compute it
      if (!metrics.peg_ratio && metrics.pe_ratio && metrics.earnings_growth) {
        metrics.peg_ratio = metrics.pe_ratio / Math.abs(metrics.earnings_growth)
      }

      // If EV/EBITDA is missing, try to compute from financial statements
      if (!metrics.ev_ebitda) {
        const incomeData = await this.getFinancialStatements(symbol, "income")
        const balanceData = await this.getFinancialStatements(symbol, "balance")

        if (incomeData?.ebit && balanceData?.total_debt && metrics.market_cap) {
          const enterpriseValue = metrics.market_cap + (balanceData.total_debt || 0) - (balanceData.cash || 0)
          const ebitda = incomeData.ebit + (incomeData.depreciation || 0)
          if (ebitda > 0) {
            metrics.ev_ebitda = enterpriseValue / ebitda
          }
        }
      }
    } catch (error) {
      console.error(`[v0] Failed to compute missing metrics for ${symbol}:`, error)
      // Continue without computed metrics
    }
  }

  async getHistoricalMetrics(symbol: string, period: "quarterly" | "annual" = "quarterly", limit = 8): Promise<any[]> {
    return await this.makeRequest(`/financial-metrics?ticker=${symbol}&period=${period}&limit=${limit}`)
  }

  async getAnalystEstimates(symbol: string): Promise<any> {
    return await this.makeRequest(`/analyst-estimates?ticker=${symbol}&period=annual`)
  }

  async getCompanyFacts(symbol: string): Promise<any> {
    return await this.makeRequest(`/company/facts?ticker=${symbol}`)
  }

  async getFinancialStatements(symbol: string, statement: "income" | "balance" | "cashflow"): Promise<any> {
    const endpoints = {
      income: "/financials/income-statements",
      balance: "/financials/balance-sheets",
      cashflow: "/financials/cash-flow-statements",
    }

    return await this.makeRequest(`${endpoints[statement]}?ticker=${symbol}&period=ttm&limit=2`)
  }
}

// Mock provider for development/testing
class MockFinancialProvider implements FinancialDataProvider {
  name = "Mock Provider"

  async getSnapshot(symbol: string): Promise<FinancialMetrics> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockData: Record<string, FinancialMetrics> = {
      AAPL: {
        symbol: "AAPL",
        pe_ratio: 28.5,
        peg_ratio: 2.1,
        price_to_book: 8.2,
        ev_ebitda: 22.1,
        roe: 0.365,
        debt_to_equity: 1.73,
        current_ratio: 1.05,
        revenue_growth: 0.08,
        earnings_growth: 0.12,
        market_cap: 3000000000000,
        volume: 50000000,
        price: 175.5,
        dividend_yield: 0.005,
        sector: "Technology",
        beta: 1.2,
      },
      MSFT: {
        symbol: "MSFT",
        pe_ratio: 32.1,
        peg_ratio: 1.8,
        price_to_book: 12.5,
        ev_ebitda: 25.3,
        roe: 0.42,
        debt_to_equity: 0.35,
        current_ratio: 1.8,
        revenue_growth: 0.15,
        earnings_growth: 0.18,
        market_cap: 2800000000000,
        volume: 30000000,
        price: 380.25,
        dividend_yield: 0.007,
        sector: "Technology",
        beta: 0.9,
      },
      TSLA: {
        symbol: "TSLA",
        pe_ratio: 65.2,
        peg_ratio: 3.2,
        price_to_book: 15.8,
        ev_ebitda: 45.2,
        roe: 0.28,
        debt_to_equity: 0.17,
        current_ratio: 1.29,
        revenue_growth: 0.35,
        earnings_growth: 0.42,
        market_cap: 800000000000,
        volume: 80000000,
        price: 250.0,
        dividend_yield: 0.0,
        sector: "Automotive",
        beta: 2.1,
      },
    }

    return (
      mockData[symbol.toUpperCase()] || {
        symbol: symbol.toUpperCase(),
        pe_ratio: Math.random() * 50 + 10,
        market_cap: Math.random() * 1000000000000 + 100000000000,
        volume: Math.floor(Math.random() * 100000000) + 1000000,
        price: Math.random() * 500 + 50,
        dividend_yield: Math.random() * 0.05,
        sector: "Unknown",
      }
    )
  }

  async getHistoricalMetrics(): Promise<any[]> {
    return []
  }

  async getAnalystEstimates(): Promise<any> {
    return {}
  }

  async getCompanyFacts(): Promise<any> {
    return {}
  }

  async getFinancialStatements(): Promise<any> {
    return {}
  }
}

// Financial API service with provider abstraction
class FinancialApiService {
  private providers: FinancialDataProvider[]
  private currentProviderIndex = 0

  constructor() {
    this.providers = [
      new FinancialDatasetsProvider(),
      new MockFinancialProvider(), // Fallback provider
    ]
  }

  private async withFallback<T>(operation: (provider: FinancialDataProvider) => Promise<T>): Promise<T> {
    let lastError: Error | null = null

    for (let i = 0; i < this.providers.length; i++) {
      const providerIndex = (this.currentProviderIndex + i) % this.providers.length
      const provider = this.providers[providerIndex]

      try {
        console.log(`[v0] Attempting to fetch data using ${provider.name}`)
        const result = await operation(provider)

        // Update current provider on success
        this.currentProviderIndex = providerIndex
        return result
      } catch (error) {
        console.error(`[v0] Provider ${provider.name} failed:`, error)
        lastError = error as Error

        // Add delay before trying next provider
        if (i < this.providers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }
    }

    throw lastError || new Error("All financial data providers failed")
  }

  async getStockData(symbol: string): Promise<FinancialMetrics> {
    return await this.withFallback((provider) => provider.getSnapshot(symbol))
  }

  async getMultipleStocks(symbols: string[]): Promise<FinancialMetrics[]> {
    const results: FinancialMetrics[] = []

    // Process symbols with rate limiting
    for (const symbol of symbols) {
      try {
        const data = await this.getStockData(symbol)
        results.push(data)

        // Rate limiting: 200ms delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`[v0] Failed to fetch data for ${symbol}:`, error)
        // Continue with other symbols
      }
    }

    return results
  }

  async getHistoricalData(symbol: string, period: "quarterly" | "annual" = "quarterly"): Promise<any[]> {
    return await this.withFallback((provider) => provider.getHistoricalMetrics(symbol, period, 8))
  }

  getCurrentProvider(): string {
    return this.providers[this.currentProviderIndex]?.name || "Unknown"
  }
}

export const financialApi = new FinancialApiService()
