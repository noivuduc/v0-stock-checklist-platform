"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { FinancialMetrics } from "@/lib/types"

interface StockCardProps {
  stock: FinancialMetrics
  className?: string
}

export function StockCard({ stock, className }: StockCardProps) {
  const formatValue = (
    value: number | null | undefined,
    type: "currency" | "percentage" | "number" = "number",
  ): string => {
    if (value === null || value === undefined) return "N/A"

    switch (type) {
      case "currency":
        if (value > 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
        if (value > 1000000) return `$${(value / 1000000).toFixed(1)}M`
        if (value > 1000) return `$${(value / 1000).toFixed(1)}K`
        return `$${value.toFixed(2)}`
      case "percentage":
        return `${(value * 100).toFixed(2)}%`
      default:
        return value.toFixed(2)
    }
  }

  const getPriceChange = () => {
    // Mock price change for demo
    const change = (Math.random() - 0.5) * 10
    return change
  }

  const priceChange = getPriceChange()
  const isPositive = priceChange >= 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{stock.symbol}</CardTitle>
            <CardDescription>{stock.sector || "Unknown Sector"}</CardDescription>
          </div>
          <Badge variant="secondary">{stock.sector || "N/A"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold financial-number">{formatValue(stock.price, "currency")}</div>
            <div className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">P/E Ratio</div>
            <div className="font-medium financial-number">{formatValue(stock.pe_ratio)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Market Cap</div>
            <div className="font-medium financial-number">{formatValue(stock.market_cap, "currency")}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Dividend Yield</div>
            <div className="font-medium financial-number">{formatValue(stock.dividend_yield, "percentage")}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Volume</div>
            <div className="font-medium financial-number">{formatValue(stock.volume)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
