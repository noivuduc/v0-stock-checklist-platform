"use client"

// Custom hook for fetching and managing stock data
import { useState } from "react"
import useSWR from "swr"
import type { FinancialMetrics } from "@/lib/types"

interface StockDataResponse {
  success: boolean
  data: FinancialMetrics
  provider: string
  timestamp: string
}

interface BatchStockDataResponse {
  success: boolean
  data: FinancialMetrics[]
  provider: string
  requested: number
  returned: number
  timestamp: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

const batchFetcher = async (url: string, symbols: string[]) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symbols }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export function useStockData(symbol: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StockDataResponse>(
    symbol ? `/api/stocks/${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    },
  )

  return {
    stockData: data?.data || null,
    provider: data?.provider || null,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useBatchStockData(symbols: string[]) {
  const { data, error, isLoading, mutate } = useSWR<BatchStockDataResponse>(
    symbols.length > 0 ? ["/api/stocks/batch", symbols] : null,
    ([url, syms]) => batchFetcher(url, syms),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute for batch requests
    },
  )

  return {
    stocksData: data?.data || [],
    provider: data?.provider || null,
    requested: data?.requested || 0,
    returned: data?.returned || 0,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useStockSearch() {
  const [searchResults, setSearchResults] = useState<FinancialMetrics[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchStocks = async (symbols: string[]) => {
    if (symbols.length === 0) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await batchFetcher("/api/stocks/batch", symbols)
      if (response.success) {
        setSearchResults(response.data)
      } else {
        setSearchError("Failed to search stocks")
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Search failed")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return {
    searchResults,
    isSearching,
    searchError,
    searchStocks,
    clearResults: () => setSearchResults([]),
  }
}
