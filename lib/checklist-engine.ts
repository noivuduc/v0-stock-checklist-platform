// Core checklist evaluation engine
import type { Checklist, ChecklistItem, FinancialMetrics } from "./types"

export interface EvaluationResult {
  symbol: string
  checklist_id: number
  passed_checks: number
  total_checks: number
  score_percentage: number
  details: CheckItemResult[]
  overall_result: "pass" | "fail" | "partial"
}

export interface CheckItemResult {
  item_id: number
  left_operand: string
  operator: string
  right_operand: string
  actual_value: number | string | null
  expected_value: number | string
  passed: boolean
  error?: string
}

class ChecklistEngine {
  // Evaluate a single stock against a checklist
  async evaluateStock(
    stockData: FinancialMetrics,
    checklist: Checklist,
    checklistItems: ChecklistItem[],
  ): Promise<EvaluationResult> {
    const enabledItems = checklistItems.filter((item) => item.enabled).sort((a, b) => a.sort_order - b.sort_order)

    const results: CheckItemResult[] = []
    let passedChecks = 0

    for (const item of enabledItems) {
      const result = this.evaluateChecklistItem(stockData, item)
      results.push(result)

      if (result.passed) {
        passedChecks++
      }
    }

    const totalChecks = enabledItems.length
    const scorePercentage = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0

    let overallResult: "pass" | "fail" | "partial"
    if (scorePercentage === 100) {
      overallResult = "pass"
    } else if (scorePercentage === 0) {
      overallResult = "fail"
    } else {
      overallResult = "partial"
    }

    return {
      symbol: stockData.symbol,
      checklist_id: checklist.id,
      passed_checks: passedChecks,
      total_checks: totalChecks,
      score_percentage: Math.round(scorePercentage * 100) / 100,
      details: results,
      overall_result: overallResult,
    }
  }

  // Evaluate multiple stocks against a checklist
  async evaluateMultipleStocks(
    stocksData: FinancialMetrics[],
    checklist: Checklist,
    checklistItems: ChecklistItem[],
  ): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = []

    for (const stockData of stocksData) {
      try {
        const result = await this.evaluateStock(stockData, checklist, checklistItems)
        results.push(result)
      } catch (error) {
        console.error(`[v0] Failed to evaluate ${stockData.symbol}:`, error)
        // Continue with other stocks
      }
    }

    return results
  }

  // Evaluate a single checklist item against stock data
  private evaluateChecklistItem(stockData: FinancialMetrics, item: ChecklistItem): CheckItemResult {
    try {
      const actualValue = this.getStockValue(stockData, item.left_operand)
      const expectedValue = this.parseValue(item.right_operand)

      if (actualValue === null || actualValue === undefined) {
        return {
          item_id: item.id,
          left_operand: item.left_operand,
          operator: item.operator,
          right_operand: item.right_operand,
          actual_value: null,
          expected_value: expectedValue,
          passed: false,
          error: `No data available for ${item.left_operand}`,
        }
      }

      const passed = this.compareValues(actualValue, item.operator, expectedValue)

      return {
        item_id: item.id,
        left_operand: item.left_operand,
        operator: item.operator,
        right_operand: item.right_operand,
        actual_value: actualValue,
        expected_value: expectedValue,
        passed,
      }
    } catch (error) {
      return {
        item_id: item.id,
        left_operand: item.left_operand,
        operator: item.operator,
        right_operand: item.right_operand,
        actual_value: null,
        expected_value: item.right_operand,
        passed: false,
        error: error instanceof Error ? error.message : "Evaluation error",
      }
    }
  }

  // Extract value from stock data based on field name
  private getStockValue(stockData: FinancialMetrics, fieldName: string): number | string | null {
    const fieldMap: Record<string, keyof FinancialMetrics> = {
      pe_ratio: "pe_ratio",
      peg_ratio: "peg_ratio",
      price_to_book: "price_to_book",
      ev_ebitda: "ev_ebitda",
      roe: "roe",
      debt_to_equity: "debt_to_equity",
      current_ratio: "current_ratio",
      revenue_growth: "revenue_growth",
      earnings_growth: "earnings_growth",
      market_cap: "market_cap",
      volume: "volume",
      price: "price",
      dividend_yield: "dividend_yield",
      sector: "sector",
      beta: "beta",
    }

    const mappedField = fieldMap[fieldName.toLowerCase()]
    if (!mappedField) {
      throw new Error(`Unknown field: ${fieldName}`)
    }

    return stockData[mappedField] ?? null
  }

  // Parse string value to appropriate type
  private parseValue(value: string): number | string {
    // Try to parse as number first
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      return numValue
    }

    // Return as string for text comparisons
    return value.toLowerCase()
  }

  // Compare two values using the specified operator
  private compareValues(actual: number | string | null, operator: string, expected: number | string): boolean {
    if (actual === null || actual === undefined) {
      return false
    }

    // Handle string comparisons
    if (typeof actual === "string" || typeof expected === "string") {
      const actualStr = String(actual).toLowerCase()
      const expectedStr = String(expected).toLowerCase()

      switch (operator) {
        case "=":
          return actualStr === expectedStr
        case "!=":
          return actualStr !== expectedStr
        default:
          throw new Error(`Operator ${operator} not supported for string comparisons`)
      }
    }

    // Handle numeric comparisons
    const actualNum = Number(actual)
    const expectedNum = Number(expected)

    if (isNaN(actualNum) || isNaN(expectedNum)) {
      throw new Error("Invalid numeric values for comparison")
    }

    switch (operator) {
      case "<":
        return actualNum < expectedNum
      case ">":
        return actualNum > expectedNum
      case "<=":
        return actualNum <= expectedNum
      case ">=":
        return actualNum >= expectedNum
      case "=":
        return Math.abs(actualNum - expectedNum) < 0.001 // Handle floating point precision
      case "!=":
        return Math.abs(actualNum - expectedNum) >= 0.001
      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }

  // Get available fields for checklist creation
  getAvailableFields(): Array<{ key: string; label: string; type: "number" | "string" }> {
    return [
      { key: "pe_ratio", label: "P/E Ratio", type: "number" },
      { key: "peg_ratio", label: "PEG Ratio", type: "number" },
      { key: "price_to_book", label: "Price to Book", type: "number" },
      { key: "ev_ebitda", label: "EV/EBITDA", type: "number" },
      { key: "roe", label: "Return on Equity", type: "number" },
      { key: "debt_to_equity", label: "Debt to Equity", type: "number" },
      { key: "current_ratio", label: "Current Ratio", type: "number" },
      { key: "revenue_growth", label: "Revenue Growth", type: "number" },
      { key: "earnings_growth", label: "Earnings Growth", type: "number" },
      { key: "market_cap", label: "Market Cap", type: "number" },
      { key: "volume", label: "Volume", type: "number" },
      { key: "price", label: "Stock Price", type: "number" },
      { key: "dividend_yield", label: "Dividend Yield", type: "number" },
      { key: "beta", label: "Beta", type: "number" },
      { key: "sector", label: "Sector", type: "string" },
    ]
  }

  // Get available operators for a field type
  getAvailableOperators(fieldType: "number" | "string"): Array<{ key: string; label: string }> {
    if (fieldType === "string") {
      return [
        { key: "=", label: "equals" },
        { key: "!=", label: "not equals" },
      ]
    }

    return [
      { key: "<", label: "less than" },
      { key: "<=", label: "less than or equal" },
      { key: ">", label: "greater than" },
      { key: ">=", label: "greater than or equal" },
      { key: "=", label: "equals" },
      { key: "!=", label: "not equals" },
    ]
  }
}

export const checklistEngine = new ChecklistEngine()
