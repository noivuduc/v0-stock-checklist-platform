-- Update Stock Data table to use JSON storage for comprehensive financial data
-- This allows storing much more data from financial APIs without schema changes

-- Drop existing stock_data table and recreate with JSON structure
DROP TABLE IF EXISTS public.stock_data CASCADE;

-- Create new stock_data table with JSON storage
CREATE TABLE IF NOT EXISTS public.stock_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  date_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Store all financial data as JSON for flexibility
  financial_data JSONB NOT NULL,
  -- Keep commonly accessed fields for indexing and quick queries
  price DECIMAL(10,2),
  market_cap BIGINT,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_data_symbol ON public.stock_data(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_data_date ON public.stock_data(date_updated);
CREATE INDEX IF NOT EXISTS idx_stock_data_sector ON public.stock_data(sector);
CREATE INDEX IF NOT EXISTS idx_stock_data_price ON public.stock_data(price);

-- Create GIN index for JSON queries
CREATE INDEX IF NOT EXISTS idx_stock_data_financial_data ON public.stock_data USING GIN (financial_data);

-- Add constraint to ensure symbol is uppercase
ALTER TABLE public.stock_data ADD CONSTRAINT check_symbol_uppercase CHECK (symbol = UPPER(symbol));

-- Create function to extract commonly used fields from JSON
CREATE OR REPLACE FUNCTION public.extract_stock_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extract commonly accessed fields from JSON for indexing
  NEW.price = COALESCE((NEW.financial_data->>'price')::DECIMAL(10,2), NEW.price);
  NEW.market_cap = COALESCE((NEW.financial_data->>'market_cap')::BIGINT, NEW.market_cap);
  NEW.sector = COALESCE(NEW.financial_data->>'sector', NEW.sector);
  
  -- Ensure symbol is uppercase
  NEW.symbol = UPPER(NEW.symbol);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically extract fields
CREATE TRIGGER extract_stock_fields_trigger
  BEFORE INSERT OR UPDATE ON public.stock_data
  FOR EACH ROW
  EXECUTE FUNCTION public.extract_stock_fields();

-- Create function to get stock data with fallback to older records
CREATE OR REPLACE FUNCTION public.get_latest_stock_data(stock_symbol TEXT)
RETURNS TABLE (
  symbol TEXT,
  financial_data JSONB,
  price DECIMAL(10,2),
  market_cap BIGINT,
  sector TEXT,
  date_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.symbol,
    sd.financial_data,
    sd.price,
    sd.market_cap,
    sd.sector,
    sd.date_updated
  FROM public.stock_data sd
  WHERE sd.symbol = UPPER(stock_symbol)
  ORDER BY sd.date_updated DESC
  LIMIT 1;
END;
$$;

-- Create function to search stocks by financial criteria
CREATE OR REPLACE FUNCTION public.search_stocks_by_criteria(
  min_pe_ratio DECIMAL DEFAULT NULL,
  max_pe_ratio DECIMAL DEFAULT NULL,
  min_market_cap BIGINT DEFAULT NULL,
  max_market_cap BIGINT DEFAULT NULL,
  target_sector TEXT DEFAULT NULL,
  min_dividend_yield DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  symbol TEXT,
  financial_data JSONB,
  price DECIMAL(10,2),
  market_cap BIGINT,
  sector TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (sd.symbol)
    sd.symbol,
    sd.financial_data,
    sd.price,
    sd.market_cap,
    sd.sector
  FROM public.stock_data sd
  WHERE 
    (min_pe_ratio IS NULL OR (sd.financial_data->>'pe_ratio')::DECIMAL >= min_pe_ratio)
    AND (max_pe_ratio IS NULL OR (sd.financial_data->>'pe_ratio')::DECIMAL <= max_pe_ratio)
    AND (min_market_cap IS NULL OR sd.market_cap >= min_market_cap)
    AND (max_market_cap IS NULL OR sd.market_cap <= max_market_cap)
    AND (target_sector IS NULL OR sd.sector ILIKE '%' || target_sector || '%')
    AND (min_dividend_yield IS NULL OR (sd.financial_data->>'dividend_yield')::DECIMAL >= min_dividend_yield)
  ORDER BY sd.symbol, sd.date_updated DESC;
END;
$$;
