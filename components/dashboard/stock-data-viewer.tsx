"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, RefreshCw, TrendingUp, Building, DollarSign, BarChart3 } from "lucide-react"
import type { ComprehensiveFinancialData } from "@/lib/types"

export function StockDataViewer() {
  const [symbol, setSymbol] = useState("")
  const [stockData, setStockData] = useState<ComprehensiveFinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchStockData = async (stockSymbol: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/stocks/data?symbol=${stockSymbol}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Stock data not found. Try refreshing to fetch new data.")
        }
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch stock data")
      }

      const data = await response.json()
      setStockData(data.stockData.financial_data)
      setLastUpdated(data.stockData.date_updated)
    } catch (err) {
      console.error("Failed to fetch stock data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch stock data")
      setStockData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStockData = async () => {
    if (!symbol) return

    setIsRefreshing(true)
    setError(null)

    try {
      const response = await fetch("/api/stocks/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to refresh stock data")
      }

      const data = await response.json()
      setStockData(data.stockData.financial_data)
      setLastUpdated(data.stockData.date_updated)
    } catch (err) {
      console.error("Failed to refresh stock data:", err)
      setError(err instanceof Error ? err.message : "Failed to refresh stock data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSearch = () => {
    if (symbol.trim()) {
      fetchStockData(symbol.trim().toUpperCase())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatValue = (
    value: number | string | null | undefined,
    type: "currency" | "percentage" | "number" | "text" = "number",
  ): string => {
    if (value === null || value === undefined) return "N/A"

    if (type === "currency") {
      const num = Number(value)
      if (isNaN(num)) return "N/A"
      if (num > 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
      if (num > 1000000) return `$${(num / 1000000).toFixed(1)}M`
      if (num > 1000) return `$${(num / 1000).toFixed(1)}K`
      return `$${num.toFixed(2)}`
    }

    if (type === "percentage") {
      const num = Number(value)
      if (isNaN(num)) return "N/A"
      return `${(num * 100).toFixed(2)}%`
    }

    if (type === "number") {
      const num = Number(value)
      if (isNaN(num)) return "N/A"
      return num.toFixed(2)
    }

    return String(value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Stock Data Viewer
          </CardTitle>
          <CardDescription>View comprehensive financial data stored in the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="stock-symbol" className="sr-only">
                Stock Symbol
              </Label>
              <Input
                id="stock-symbol"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                maxLength={10}
              />
            </div>
            <Button onClick={handleSearch} disabled={!symbol.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            {stockData && (
              <Button variant="outline" onClick={refreshStockData} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {stockData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
              <p className="text-muted-foreground">
                {stockData.sector} • {stockData.industry}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold financial-number">{formatValue(stockData.price, "currency")}</div>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">Updated: {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold financial-number">
                      {formatValue(stockData.market_cap, "currency")}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Volume</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold financial-number">{formatValue(stockData.volume, "number")}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold financial-number">
                      {formatValue(stockData.dividend_yield, "percentage")}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {stockData.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stockData.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {stockData.employees && (
                        <span>
                          <strong>Employees:</strong> {stockData.employees.toLocaleString()}
                        </span>
                      )}
                      {stockData.founded_year && (
                        <span>
                          <strong>Founded:</strong> {stockData.founded_year}
                        </span>
                      )}
                      {stockData.headquarters && (
                        <span>
                          <strong>HQ:</strong> {stockData.headquarters}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="valuation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "P/E Ratio", value: stockData.pe_ratio, type: "number" as const },
                  { label: "PEG Ratio", value: stockData.peg_ratio, type: "number" as const },
                  { label: "Price to Book", value: stockData.price_to_book, type: "number" as const },
                  { label: "EV/EBITDA", value: stockData.ev_ebitda, type: "number" as const },
                  { label: "Price to Sales", value: stockData.price_to_sales, type: "number" as const },
                  { label: "Beta", value: stockData.beta, type: "number" as const },
                ].map((metric) => (
                  <Card key={metric.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold financial-number">
                        {formatValue(metric.value, metric.type)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "ROE", value: stockData.roe, type: "percentage" as const },
                  { label: "ROA", value: stockData.roa, type: "percentage" as const },
                  { label: "Gross Margin", value: stockData.gross_margin, type: "percentage" as const },
                  { label: "Operating Margin", value: stockData.operating_margin, type: "percentage" as const },
                  { label: "Net Margin", value: stockData.net_margin, type: "percentage" as const },
                  { label: "Debt to Equity", value: stockData.debt_to_equity, type: "number" as const },
                  { label: "Current Ratio", value: stockData.current_ratio, type: "number" as const },
                  { label: "Quick Ratio", value: stockData.quick_ratio, type: "number" as const },
                  { label: "Interest Coverage", value: stockData.interest_coverage, type: "number" as const },
                ].map((metric) => (
                  <Card key={metric.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold financial-number">
                        {formatValue(metric.value, metric.type)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="growth" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Revenue Growth", value: stockData.revenue_growth, type: "percentage" as const },
                  { label: "Earnings Growth", value: stockData.earnings_growth, type: "percentage" as const },
                  { label: "Book Value Growth", value: stockData.book_value_growth, type: "percentage" as const },
                ].map((metric) => (
                  <Card key={metric.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold financial-number">
                        {formatValue(metric.value, metric.type)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {stockData.analyst_rating && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyst Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Consensus Rating:</span>
                      <Badge variant="secondary">{stockData.analyst_rating}</Badge>
                    </div>
                    {stockData.price_target && (
                      <div className="flex justify-between items-center">
                        <span>Price Target:</span>
                        <span className="financial-number">{formatValue(stockData.price_target, "currency")}</span>
                      </div>
                    )}
                    {stockData.analyst_count && (
                      <div className="flex justify-between items-center">
                        <span>Analyst Count:</span>
                        <span>{stockData.analyst_count}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
