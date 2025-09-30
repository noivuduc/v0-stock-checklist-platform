"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, GripVertical } from "lucide-react"

interface ChecklistBuilderProps {
  checklist?: {
    id: string
    name: string
    description: string
    checklist_items?: Array<{
      left_operand: string
      operator: string
      right_operand: string
      enabled: boolean
      sort_order: number
    }>
  }
  onSave: (
    checklist: { name: string; description: string },
    items: Array<{
      leftOperand: string
      operator: string
      rightOperand: string
      enabled: boolean
    }>,
  ) => void
  onCancel: () => void
}

interface ChecklistItemForm {
  leftOperand: string
  operator: string
  rightOperand: string
  enabled: boolean
}

const availableFields = [
  // Basic valuation metrics
  { key: "pe_ratio", label: "P/E Ratio", type: "number", category: "Valuation" },
  { key: "peg_ratio", label: "PEG Ratio", type: "number", category: "Valuation" },
  { key: "price_to_book", label: "Price to Book", type: "number", category: "Valuation" },
  { key: "ev_ebitda", label: "EV/EBITDA", type: "number", category: "Valuation" },
  { key: "price_to_sales", label: "Price to Sales", type: "number", category: "Valuation" },

  // Market data
  { key: "market_cap", label: "Market Cap", type: "number", category: "Market" },
  { key: "volume", label: "Volume", type: "number", category: "Market" },
  { key: "price", label: "Price", type: "number", category: "Market" },
  { key: "dividend_yield", label: "Dividend Yield", type: "number", category: "Market" },
  { key: "beta", label: "Beta", type: "number", category: "Market" },

  // Company info
  { key: "sector", label: "Sector", type: "string", category: "Company" },
  { key: "industry", label: "Industry", type: "string", category: "Company" },
  { key: "employees", label: "Employee Count", type: "number", category: "Company" },

  // Profitability metrics
  { key: "roe", label: "Return on Equity (ROE)", type: "number", category: "Profitability" },
  { key: "roa", label: "Return on Assets (ROA)", type: "number", category: "Profitability" },
  { key: "gross_margin", label: "Gross Margin", type: "number", category: "Profitability" },
  { key: "operating_margin", label: "Operating Margin", type: "number", category: "Profitability" },
  { key: "net_margin", label: "Net Margin", type: "number", category: "Profitability" },

  // Financial health
  { key: "debt_to_equity", label: "Debt to Equity", type: "number", category: "Financial Health" },
  { key: "current_ratio", label: "Current Ratio", type: "number", category: "Financial Health" },
  { key: "quick_ratio", label: "Quick Ratio", type: "number", category: "Financial Health" },
  { key: "interest_coverage", label: "Interest Coverage", type: "number", category: "Financial Health" },

  // Growth metrics
  { key: "revenue_growth", label: "Revenue Growth", type: "number", category: "Growth" },
  { key: "earnings_growth", label: "Earnings Growth", type: "number", category: "Growth" },
  { key: "book_value_growth", label: "Book Value Growth", type: "number", category: "Growth" },

  // Analyst data
  { key: "analyst_rating", label: "Analyst Rating", type: "string", category: "Analyst" },
  { key: "price_target", label: "Price Target", type: "number", category: "Analyst" },
  { key: "analyst_count", label: "Analyst Count", type: "number", category: "Analyst" },

  // Technical indicators
  { key: "rsi", label: "RSI", type: "number", category: "Technical" },
  { key: "moving_avg_50", label: "50-Day Moving Average", type: "number", category: "Technical" },
  { key: "moving_avg_200", label: "200-Day Moving Average", type: "number", category: "Technical" },

  // ESG
  { key: "esg_score", label: "ESG Score", type: "number", category: "ESG" },
]

const getAvailableOperators = (fieldType: string) => {
  if (fieldType === "string") {
    return [
      { key: "=", label: "equals" },
      { key: "!=", label: "not equals" },
      { key: "contains", label: "contains" },
      { key: "not_contains", label: "does not contain" },
    ]
  }
  return [
    { key: ">", label: "greater than" },
    { key: "<", label: "less than" },
    { key: ">=", label: "greater than or equal" },
    { key: "<=", label: "less than or equal" },
    { key: "=", label: "equals" },
    { key: "!=", label: "not equals" },
  ]
}

export function ChecklistBuilder({ checklist, onSave, onCancel }: ChecklistBuilderProps) {
  const [name, setName] = useState(checklist?.name || "")
  const [description, setDescription] = useState(checklist?.description || "")
  const [checklistItems, setChecklistItems] = useState<ChecklistItemForm[]>(
    checklist?.checklist_items?.map((item) => ({
      leftOperand: item.left_operand,
      operator: item.operator,
      rightOperand: item.right_operand,
      enabled: item.enabled,
    })) || [],
  )

  const addNewItem = () => {
    const newItem: ChecklistItemForm = {
      leftOperand: "pe_ratio",
      operator: "<",
      rightOperand: "",
      enabled: true,
    }
    setChecklistItems([...checklistItems, newItem])
  }

  const updateItem = (index: number, field: keyof ChecklistItemForm, value: any) => {
    const updated = [...checklistItems]
    updated[index] = { ...updated[index], [field]: value }

    // Update operators when field type changes
    if (field === "leftOperand") {
      const fieldInfo = availableFields.find((f) => f.key === value)
      if (fieldInfo) {
        const operators = getAvailableOperators(fieldInfo.type)
        updated[index].operator = operators[0]?.key || "<"
      }
    }

    setChecklistItems(updated)
  }

  const removeItem = (index: number) => {
    const updated = checklistItems.filter((_, i) => i !== index)
    setChecklistItems(updated)
  }

  const handleSave = () => {
    if (!name.trim()) return

    const checklistData = {
      name: name.trim(),
      description: description.trim(),
    }

    const itemsData = checklistItems
      .filter((item) => item.leftOperand && item.rightOperand.trim())
      .map((item) => ({
        leftOperand: item.leftOperand,
        operator: item.operator,
        rightOperand: item.rightOperand.trim(),
        enabled: item.enabled,
      }))

    onSave(checklistData, itemsData)
  }

  const getFieldLabel = (key: string) => {
    return availableFields.find((f) => f.key === key)?.label || key
  }

  const getFieldType = (key: string) => {
    return availableFields.find((f) => f.key === key)?.type || "number"
  }

  // Group fields by category for better organization
  const fieldsByCategory = availableFields.reduce(
    (acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = []
      }
      acc[field.category].push(field)
      return acc
    },
    {} as Record<string, typeof availableFields>,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{checklist ? "Edit Checklist" : "Create New Checklist"}</CardTitle>
          <CardDescription>Define your stock screening criteria using comprehensive financial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Checklist Name</Label>
            <Input
              id="name"
              placeholder="e.g., Value Investing Checklist"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your investment strategy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Screening Criteria</CardTitle>
              <CardDescription>
                Add conditions that stocks must meet using comprehensive financial metrics
              </CardDescription>
            </div>
            <Button onClick={addNewItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Criteria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {checklistItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No criteria added yet.</p>
              <p className="text-sm">Click "Add Criteria" to get started with comprehensive financial metrics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="cursor-move">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Field</Label>
                      <Select
                        value={item.leftOperand}
                        onValueChange={(value) => updateItem(index, "leftOperand", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {Object.entries(fieldsByCategory).map(([category, fields]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                                {category}
                              </div>
                              {fields.map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Operator</Label>
                      <Select value={item.operator} onValueChange={(value) => updateItem(index, "operator", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableOperators(getFieldType(item.leftOperand)).map((op) => (
                            <SelectItem key={op.key} value={op.key}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Input
                        placeholder="Enter value..."
                        value={item.rightOperand}
                        onChange={(e) => updateItem(index, "rightOperand", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`enabled-${index}`}
                          checked={item.enabled}
                          onChange={(e) => updateItem(index, "enabled", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`enabled-${index}`} className="text-xs">
                          Enabled
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || checklistItems.length === 0}>
          {checklist ? "Update Checklist" : "Create Checklist"}
        </Button>
      </div>
    </div>
  )
}
