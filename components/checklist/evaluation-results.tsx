"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, TrendingDown } from "lucide-react"

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

interface EvaluationResultsProps {
  results: EvaluationResult[]
  checklistName: string
}

export function EvaluationResults({ results, checklistName }: EvaluationResultsProps) {
  const getResultIcon = (scorePercentage: number) => {
    if (scorePercentage >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (scorePercentage >= 50) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getResultColor = (scorePercentage: number) => {
    if (scorePercentage >= 80) return "bg-green-500"
    if (scorePercentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getResultLabel = (scorePercentage: number) => {
    if (scorePercentage >= 80) return "PASS"
    if (scorePercentage >= 50) return "PARTIAL"
    return "FAIL"
  }

  const formatValue = (value: number | string | null): string => {
    if (value === null || value === undefined) return "N/A"
    if (typeof value === "number") {
      if (value > 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
      if (value > 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value > 1000) return `$${(value / 1000).toFixed(1)}K`
      if (value < 1 && value > 0) return (value * 100).toFixed(2) + "%"
      return value.toFixed(2)
    }
    return String(value)
  }

  const sortedResults = [...results].sort((a, b) => b.scorePercentage - a.scorePercentage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Evaluation Results</h2>
          <p className="text-muted-foreground">Results for "{checklistName}"</p>
        </div>
        <Badge variant="secondary">{results.length} stocks evaluated</Badge>
      </div>

      <div className="grid gap-4">
        {sortedResults.map((result) => (
          <Card key={result.symbol} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getResultIcon(result.scorePercentage)}
                  <div>
                    <CardTitle className="text-lg">{result.symbol}</CardTitle>
                    <CardDescription>
                      {result.passedChecks} of {result.totalChecks} criteria met
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold financial-number">{result.scorePercentage.toFixed(1)}%</div>
                  <Badge variant="secondary" className={`${getResultColor(result.scorePercentage)} text-white`}>
                    {getResultLabel(result.scorePercentage)}
                  </Badge>
                </div>
              </div>
              <Progress value={result.scorePercentage} className="mt-2" />
            </CardHeader>

            <CardContent>
              {result.error ? (
                <div className="text-center py-4">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500 text-sm">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Detailed Results</h4>
                  <div className="grid gap-2">
                    {result.itemResults.map((detail, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          detail.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {detail.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            {detail.left_operand.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                            {detail.operator} {detail.right_operand}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm financial-number">Actual: {formatValue(detail.left_value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results</h3>
            <p className="text-muted-foreground">No stocks have been evaluated against this checklist yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
