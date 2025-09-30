// TypeScript interfaces matching the database schema

export interface User {
  id: number
  email: string
  created_at: string
  subscription_tier: "free" | "premium" | "enterprise"
  first_name?: string
  last_name?: string
  active: boolean
}

export interface DataSource {
  id: number
  provider_name: string
  api_endpoint: string
  last_updated: string
  status: "active" | "inactive" | "maintenance"
  rate_limit: number
  api_key_hash?: string
}

export interface StockData {
  id: string
  symbol: string
  date_updated: string
  // JSON field containing all financial data
  financial_data: ComprehensiveFinancialData
  // Extracted fields for indexing
  price?: number
  market_cap?: number
  sector?: string
  created_at: string
}

export interface ComprehensiveFinancialData {
  symbol: string

  // Basic valuation metrics
  pe_ratio?: number
  peg_ratio?: number
  price_to_book?: number
  ev_ebitda?: number
  price_to_sales?: number

  // Market data
  market_cap?: number
  volume?: number
  price?: number
  dividend_yield?: number

  // Company information
  sector?: string
  industry?: string
  employees?: number
  founded_year?: number
  headquarters?: string
  website?: string
  description?: string

  // Profitability metrics
  roe?: number
  roa?: number
  gross_margin?: number
  operating_margin?: number
  net_margin?: number

  // Financial health
  debt_to_equity?: number
  current_ratio?: number
  quick_ratio?: number
  interest_coverage?: number

  // Growth metrics
  revenue_growth?: number
  earnings_growth?: number
  book_value_growth?: number

  // Market metrics
  beta?: number
  shares_outstanding?: number
  float_shares?: number

  // Analyst data
  analyst_rating?: string
  price_target?: number
  analyst_count?: number

  // Technical indicators
  rsi?: number
  moving_avg_50?: number
  moving_avg_200?: number

  // ESG data
  esg_score?: number

  // Raw API responses for advanced analysis
  raw_metrics?: any
  raw_prices?: any
  raw_facts?: any
  raw_financials?: any
  raw_analyst?: any

  // Metadata
  last_updated: string
  data_source: string
}

export interface FinancialMetrics extends ComprehensiveFinancialData {
  // This interface now extends the comprehensive data structure
}

export interface Subscription {
  id: number
  user_id: number
  plan_name: string
  status: "active" | "cancelled" | "expired" | "trial"
  start_date: string
  end_date?: string
  monthly_fee: number
  created_at: string
}

export interface Checklist {
  id: number
  user_id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  active: boolean
}

export interface ChecklistItem {
  id: number
  checklist_id: number
  left_operand: string
  operator: "<" | ">" | "<=" | ">=" | "=" | "!="
  right_operand: string
  enabled: boolean
  sort_order: number
  created_at: string
}

export interface ChecklistResult {
  id: number
  checklist_id: number
  symbol: string
  passed_checks: number
  total_checks: number
  result_date: string
  score_percentage: number
  details?: string // JSON string
}
