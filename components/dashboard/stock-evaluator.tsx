"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, TrendingUp, Plus, X } from "lucide-react"
import { EvaluationResults } from "@/components/checklist/evaluation-results"

interface StockEvaluatorProps {
  checklist: {
    id: string
    name: string
    description: string
    checklist_items?: Array<{
      id: string
      left_operand: string
      operator: string
      right_operand: string
      enabled: boolean
    }>
  }
}

interface EvaluationResult {
  symbol: string
  stockData: any
  passedChecks: number
  totalChecks: number
  scorePercentage: number
  itemResults: Array<{
    item_id: string
    left_operand: string
    operator: string
    right_operand: string
    left_value: any
    passed: boolean
  }>
  error?: string
}

export function StockEvaluator({ checklist }: StockEvaluatorProps) {
  const [symbols, setSymbols] = useState<string[]>([])
  const [currentSymbol, setCurrentSymbol] = useState("")
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSymbol = () => {
    const symbol = currentSymbol.trim().toUpperCase()
    if (symbol && !symbols.includes(symbol) && symbol.length <= 10) {
      setSymbols([...symbols, symbol])
      setCurrentSymbol("")
    }
  }

  const removeSymbol = (symbolToRemove: string) => {
    setSymbols(symbols.filter((s) => s !== symbolToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addSymbol()
    }
  }

  const evaluateStocks = async () => {
    if (symbols.length === 0) return

    setIsEvaluating(true)
    setError(null)

    try {
      const response = await fetch("/api/stocks/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checklistId: checklist.id,
          symbols: symbols,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to evaluate stocks")
      }

      const data = await response.json()
      setEvaluationResults(data.results || [])
    } catch (err) {
      console.error("Evaluation failed:", err)
      setError(err instanceof Error ? err.message : "Evaluation failed")
    } finally {
      setIsEvaluating(false)
    }
  }

  const enabledCriteria = checklist.checklist_items?.filter((item) => item.enabled) || []

  return (
    <div className="space-y-6">
      {/* Checklist Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {checklist.name}
              </CardTitle>
              <CardDescription className="text-pretty">{checklist.description}</CardDescription>
            </div>
            <Badge variant="secondary">{enabledCriteria.length} criteria</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Criteria:</h4>
            <div className="flex flex-wrap gap-2">
              {enabledCriteria.map((item) => (
                <Badge key={item.id} variant="outline" className="text-xs">
                  {item.left_operand.replace(/_/g, " ")} {item.operator} {item.right_operand}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Input */}
      <Card>
        <CardHeader>
          <CardTitle>Add Stocks to Evaluate</CardTitle>
          <CardDescription>Enter stock symbols (e.g., AAPL, MSFT, GOOGL)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="symbol" className="sr-only">
                Stock Symbol
              </Label>
              <Input
                id="symbol"
                placeholder="Enter stock symbol..."
                value={currentSymbol}
                onChange={(e) => setCurrentSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                maxLength={10}
              />
            </div>
            <Button onClick={addSymbol} disabled={!currentSymbol.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {symbols.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Stocks to Evaluate:</Label>
              <div className="flex flex-wrap gap-2">
                {symbols.map((symbol) => (
                  <Badge key={symbol} variant="secondary" className="flex items-center gap-1">
                    {symbol}
                    <button
                      onClick={() => removeSymbol(symbol)}
                      className="ml-1 hover:text-destructive"
                      aria-label={`Remove ${symbol}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button onClick={evaluateStocks} disabled={symbols.length === 0 || isEvaluating} className="w-full">
            {isEvaluating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating stocks...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Evaluate {symbols.length} Stock{symbols.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {evaluationResults.length > 0 && <EvaluationResults results={evaluationResults} checklistName={checklist.name} />}
    </div>
  )
}
